
"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/initial-data';
import type { BackyardLayout, Plant, Record as PlantRecord } from '@/lib/types';

const STORAGE_KEY = 'backyardBountyData';

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useBackyardData() {
  const [layout, setLayout] = useState<BackyardLayout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setLayout(JSON.parse(storedData));
      } else {
        setLayout(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse data:", error);
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
    const newLayout = { ...layout };
    let updated = false;
    for (const categoryKey in newLayout) {
      const category = newLayout[categoryKey];
      const plantIndex = category.plants.findIndex(p => p.id === plantId);
      if (plantIndex !== -1) {
        category.plants[plantIndex].position = newPosition;
        updated = true;
        break;
      }
    }
    if (updated) {
      updateLayout(newLayout);
    }
  }, [layout, updateLayout]);

  const addPlant = useCallback((categoryKey: string, plantType: string) => {
    if (!layout) return;

    const newLayout = { ...layout };
    const category = newLayout[categoryKey];
    if (!category) return;

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
    const newLayout = { ...layout };
    let updated = false;
    for (const categoryKey in newLayout) {
      const category = newLayout[categoryKey];
      const initialCount = category.plants.length;
      category.plants = category.plants.filter(p => p.id !== plantId);
      if (category.plants.length < initialCount) {
        updated = true;
        break;
      }
    }
    if (updated) {
      updateLayout(newLayout);
    }
  }, [layout, updateLayout]);
  
  const addRecordToPlant = useCallback(async (plantId: string, record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    if (!layout) return;

    const newRecord: PlantRecord = {
        ...record,
        id: Date.now(),
        photoDataUri: photoFile ? await fileToDataUri(photoFile) : undefined,
    };

    const newLayout = { ...layout };
    let updated = false;
    for (const categoryKey in newLayout) {
      const category = newLayout[categoryKey];
      const plant = category.plants.find(p => p.id === plantId);
      if (plant) {
        plant.records.push(newRecord);
        plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        updated = true;
        break;
      }
    }
    if (updated) {
      updateLayout(newLayout);
    }
  }, [layout, updateLayout]);

  const updateRecordInPlant = useCallback(async (plantId: string, updatedRecord: PlantRecord, photoFile?: File) => {
    if (!layout) return;
    
    if (photoFile) {
        updatedRecord.photoDataUri = await fileToDataUri(photoFile);
    }

    const newLayout = { ...layout };
    let updated = false;
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        const plant = category.plants.find(p => p.id === plantId);
        if (plant) {
            const recordIndex = plant.records.findIndex(r => r.id === updatedRecord.id);
            if (recordIndex !== -1) {
                plant.records[recordIndex] = updatedRecord;
                plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                updated = true;
                break;
            }
        }
    }
    if (updated) {
        updateLayout(newLayout);
    }
  }, [layout, updateLayout]);


  return { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant, updateRecordInPlant };
}
