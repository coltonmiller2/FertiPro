
"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/initial-data';
import type { BackyardLayout, Plant, Record as PlantRecord, PlantCategory } from '@/lib/types';

const STORAGE_KEY = 'backyardBountyData';

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
    try {
      const storedDataJSON = localStorage.getItem(STORAGE_KEY);
      if (storedDataJSON) {
        const storedData: BackyardLayout = JSON.parse(storedDataJSON);
        // Version check
        if (storedData.version === initialData.version) {
          setLayout(storedData);
        } else {
          // Version mismatch, use initialData and update localStorage
          setLayout(initialData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        }
      } else {
        // No data in localStorage, use initialData
        setLayout(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse data:", error);
      // Fallback to initialData
      setLayout(initialData);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLayout = useCallback((newLayout: BackyardLayout) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
    }
  }, []);

  const updatePlantPosition = useCallback((plantId: string, newPosition: { x: number; y: number }) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                plant.position = newPosition;
                updateLayout(newLayout);
                return;
            }
        }
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
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const initialCount = category.plants.length;
            category.plants = category.plants.filter(p => p.id !== plantId);
            if (category.plants.length < initialCount) {
                updateLayout(newLayout);
                return;
            }
        }
    }
  }, [layout, updateLayout]);
  
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
                plant.records.push(newRecord);
                plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                updateLayout(newLayout);
                return;
            }
        }
    }
  }, [layout, updateLayout]);

  const addRecordToPlants = useCallback(async (plantIds: string[], record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    if (!layout) return;

    const photoDataUri = photoFile ? await fileToDataUri(photoFile) : undefined;
    const newLayout = structuredClone(layout);

    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            category.plants.forEach(plant => {
                if (plantIds.includes(plant.id)) {
                    const newRecord: PlantRecord = {
                        ...record,
                        id: Date.now() + Math.random(), // Add random to avoid collision if processed at same ms
                        photoDataUri: photoDataUri,
                    };
                    plant.records.push(newRecord);
                    plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                }
            });
        }
    }
    updateLayout(newLayout);
  }, [layout, updateLayout]);


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
                    updateLayout(newLayout);
                    return; // Exit after finding and updating
                }
            }
        }
    }
  }, [layout, updateLayout]);

  const updatePlant = useCallback((plantId: string, updates: Partial<Plant>) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
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


  return { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant, addRecordToPlants, updateRecordInPlant, updatePlant };
}
