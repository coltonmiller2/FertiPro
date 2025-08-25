"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/initial-data';
import type { BackyardLayout, Plant, Record as PlantRecord, PlantCategory } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import debounce from 'lodash.debounce';

type ConnectionStatus = 'connecting' | 'connected' | 'error';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isPlantCategory(value: any): value is PlantCategory {
    return value && typeof value === 'object' && 'name' in value && 'color' in value && Array.isArray(value.plants);
}

const layoutRef = doc(db, 'backyardLayouts', 'myLayout');

export function useBackyardData() {
  const [layout, setLayout] = useState<BackyardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  // Debounced function to update Firestore
  const debouncedUpdateFirestore = useCallback(debounce((newLayout: BackyardLayout) => {
    setDoc(layoutRef, newLayout, { merge: true }).catch(error => {
      console.error("Error updating layout in Firestore:", error);
      setConnectionStatus('error');
    });
  }, 500), []);


  useEffect(() => {
    const unsubscribe = onSnapshot(layoutRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setLayout(docSnapshot.data() as BackyardLayout);
        setConnectionStatus('connected');
      } else {
        setDoc(layoutRef, initialData)
          .then(() => {
            setLayout(initialData);
            setConnectionStatus('connected');
          })
          .catch(error => {
            console.error("Error writing initial data:", error);
            setConnectionStatus('error');
          });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching backyard layout:', error);
      setConnectionStatus('error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateLayout = useCallback((newLayout: BackyardLayout) => {
    setLayout(newLayout);
    debouncedUpdateFirestore(newLayout);
  }, [debouncedUpdateFirestore]);

  const updatePlantPosition = useCallback((plantId: string, newPosition: { x: number; y: number }) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    let found = false;
    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
            plant.position = newPosition;
            found = true;
            break;
            }
        }
    }
    if (found) {
      updateLayout(newLayout);
    }
  }, [layout, updateLayout]);

  const addPlant = useCallback((categoryKey: string, plantType: string) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    const category = newLayout[categoryKey];
    if (!isPlantCategory(category)) return;

    const existingLabels = category.plants.map(p => p.label);
    let newLabel = 'A';
    while (existingLabels.includes(newLabel)) {
      newLabel = String.fromCharCode(newLabel.charCodeAt(0) + 1);
    }

    const newPlant: Plant = {
      id: `${categoryKey.substring(0, 3)}-${Date.now()}`,
      label: newLabel,
      type: plantType,
      position: { x: 50, y: 50 },
      records: [],
    };
    category.plants.push(newPlant);
    updateLayout(newLayout);
  }, [layout, updateLayout]);

  const removePlant = useCallback((plantId: string) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    let found = false;
    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const initialCount = category.plants.length;
            category.plants = category.plants.filter(p => p.id !== plantId);
            if (category.plants.length < initialCount) {
            found = true;
            break;
            }
        }
    }
    if (found) {
      updateLayout(newLayout);
    }
  }, [layout, updateLayout]);

  const addRecordToPlant = useCallback(async (plantId: string, record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    if (!layout) return;

    let photoDataUri: string | undefined = undefined;
    if (photoFile) {
        photoDataUri = await fileToDataUri(photoFile);
    }
    
    const newRecord: PlantRecord = {
      ...record,
      id: Date.now(),
      photoDataUri: photoDataUri,
    };
    const newLayout = structuredClone(layout);
    let found = false;
    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
            plant.records.unshift(newRecord);
            found = true;
            break;
            }
        }
    }
    if (found) {
      updateLayout(newLayout);
    }
  }, [layout, updateLayout]);
  
  const addRecordToPlants = useCallback(async (plantIds: string[], record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    if (!layout) return;
    const photoDataUri = photoFile ? await fileToDataUri(photoFile) : undefined;
    const newLayout = structuredClone(layout);
    let layoutChanged = false;

    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            category.plants.forEach(plant => {
                if (plantIds.includes(plant.id)) {
                    const newRecord: PlantRecord = {
                        ...record,
                        id: Date.now() + Math.random(),
                        photoDataUri: photoDataUri,
                    };
                    plant.records.unshift(newRecord);
                    layoutChanged = true;
                }
            });
        }
    }
    if (layoutChanged) {
        updateLayout(newLayout);
    }
  }, [layout, updateLayout]);

  const updateRecordInPlant = useCallback(async (plantId: string, updatedRecord: PlantRecord, photoFile?: File) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    if (photoFile) {
        updatedRecord.photoDataUri = await fileToDataUri(photoFile);
    }
    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                const recordIndex = plant.records.findIndex(r => r.id === updatedRecord.id);
                if (recordIndex !== -1) {
                    plant.records[recordIndex] = updatedRecord;
                    plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    updateLayout(newLayout);
                    return;
                }
            }
        }
    }
  }, [layout, updateLayout]);

  const deleteRecordFromPlant = useCallback(async (plantId: string, recordId: number) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                const initialCount = plant.records.length;
                plant.records = plant.records.filter(r => r.id !== recordId);
                if (plant.records.length < initialCount) {
                    updateLayout(newLayout);
                    return;
                }
            }
        }
    }
  }, [layout, updateLayout]);

  const updatePlant = useCallback(async (plantId: string, updates: Partial<Plant>) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        if (categoryKey === 'version') continue;
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plantIndex = category.plants.findIndex(p => p.id === plantId);
            if (plantIndex !== -1) {
                category.plants[plantIndex] = { ...category.plants[plantIndex], ...updates };
                updateLayout(newLayout);
                return;
            }
        }
    }
  }, [layout, updateLayout]);

  return { layout, loading, connectionStatus, updatePlantPosition, addPlant, removePlant, addRecordToPlant, addRecordToPlants, updateRecordInPlant, updatePlant, deleteRecordFromPlant };
}
