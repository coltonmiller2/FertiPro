"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/initial-data';
import type { BackyardLayout, Plant, Record as PlantRecord, PlantCategory } from '@/lib/types';
import { db } from '@/lib/firebase'; // Import db from your firebase file
import { doc, onSnapshot, setDoc } from "firebase/firestore"; // Import necessary firestore functions

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


export function useBackyardData() {
  const [layout, setLayout] = useState<BackyardLayout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const layoutRef = doc(db, 'backyardLayouts', 'myLayout'); // Reference your layout document in Firestore

    const unsubscribe = onSnapshot(layoutRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const firestoreLayout = docSnapshot.data() as BackyardLayout;
        setLayout(firestoreLayout);
      } else {
        setLayout(initialData);
        setDoc(layoutRef, initialData).catch(error => console.error("Error writing initial data:", error));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching backyard layout:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const updatePlantPosition = useCallback(async (plantId: string, newPosition: { x: number; y: number }) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                plant.position = newPosition;
                const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                await setDoc(layoutRef, newLayout)
                    .catch(error => {
                        console.error("Error updating plant position in Firestore:", error);
                    });
                return;
            }
        }
    }
  }, [layout, db]);

  const addPlant = useCallback(async (categoryKey: string, plantType: string) => {
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
    const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
    await setDoc(layoutRef, newLayout)
        .catch(error => {
            console.error("Error adding plant to Firestore:", error);
        });
  }, [layout, db]);

  const removePlant = useCallback(async (plantId: string) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const initialCount = category.plants.length;
            category.plants = category.plants.filter(p => p.id !== plantId);
            if (category.plants.length < initialCount) {
                const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                await setDoc(layoutRef, newLayout)
                    .catch(error => {
                        console.error("Error removing plant from Firestore:", error);
                    });
                return;
            }
        }
    }
  }, [layout, db]);

  const addRecordToPlant = useCallback(async (plantId: string, record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    if (!layout) return;
    const newRecord: PlantRecord = {
        ...record,
        id: Date.now(),
        photoDataUri: photoFile ? await fileToDataUri(photoFile) : undefined,
    };
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                const latestRecord = plant.records[0];
                if (latestRecord) {
                    if (newRecord.trunkDiameter === undefined || newRecord.trunkDiameter === '') {
                        newRecord.trunkDiameter = latestRecord.trunkDiameter;
                    }
                    if (newRecord.nextScheduledFertilizationDate === undefined || newRecord.nextScheduledFertilizationDate === null) {
                        newRecord.nextScheduledFertilizationDate = latestRecord.nextScheduledFertilizationDate;
                    }
                }
                plant.records.unshift(newRecord);
                const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                await setDoc(layoutRef, newLayout)
                    .catch(error => {
                        console.error("Error adding record to plant in Firestore:", error);
                    });
                return;
            }
        }
    }
  }, [layout, db]);

  const addRecordToPlants = useCallback(async (plantIds: string[], record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    if (!layout) return;
    const photoDataUri = photoFile ? await fileToDataUri(photoFile) : undefined;
    const newLayout = structuredClone(layout);
    let layoutChanged = false;
    for (const categoryKey in newLayout) {
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
      const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
      await setDoc(layoutRef, newLayout)
          .catch(error => {
              console.error("Error adding records to plants in Firestore:", error);
          });
    }
  }, [layout, db]);

  const updateRecordInPlant = useCallback(async (plantId: string, updatedRecord: PlantRecord, photoFile?: File) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    if (photoFile) {
        updatedRecord.photoDataUri = await fileToDataUri(photoFile);
    }
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                const recordIndex = plant.records.findIndex(r => r.id === updatedRecord.id);
                if (recordIndex !== -1) {
                    plant.records[recordIndex] = updatedRecord;
                    plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                    await setDoc(layoutRef, newLayout)
                        .catch(error => {
                            console.error("Error updating record in plant in Firestore:", error);
                        });
                    return;
                }
            }
        }
    }
  }, [layout, db]);

  const deleteRecordFromPlant = useCallback(async (plantId: string, recordId: number) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                const initialCount = plant.records.length;
                plant.records = plant.records.filter(r => r.id !== recordId);
                if (plant.records.length < initialCount) {
                    const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                    await setDoc(layoutRef, newLayout)
                        .catch(error => {
                            console.error("Error deleting record from plant in Firestore:", error);
                        });
                    return;
                }
            }
        }
    }
  }, [layout, db]);

  const updatePlant = useCallback(async (plantId: string, updates: Partial<Plant>) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plantIndex = category.plants.findIndex(p => p.id === plantId);
            if (plantIndex !== -1) {
                category.plants[plantIndex] = { ...category.plants[plantIndex], ...updates };
                const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                await setDoc(layoutRef, newLayout)
                    .catch(error => {
                        console.error("Error updating plant in Firestore:", error);
                    });
                    return;
                }
            }
        }
  }, [layout, db]);

  return { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant, addRecordToPlants, updateRecordInPlant, updatePlant, deleteRecordFromPlant };
}