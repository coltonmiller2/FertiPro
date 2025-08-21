"use client";

import { useState, useEffect, useCallback } from 'react';
import { initialData } from '@/lib/initial-data';
import type { BackyardLayout, Plant, Record as PlantRecord, PlantCategory } from '@/lib/types';
import { db } from '@/lib/firebase'; // Import db from your firebase file
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, collection, query, getDocs, getDoc } from "firebase/firestore"; // Import necessary firestore functions

const STORAGE_KEY = 'backyardBountyData'; // This will no longer be used for data storage

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
        // You might want to add version checking or data migration logic here if your data structure evolves
        setLayout(firestoreLayout);
      } else {
        // Document doesn't exist, potentially initialize with initialData and save to Firestore
        setLayout(initialData);
        // Optionally, save initialData to Firestore for the first time
        setDoc(layoutRef, initialData).catch(error => console.error("Error writing initial data:", error));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching backyard layout:', error);
      setLoading(false);
      // Optionally, fallback to initialData on error
      // setLayout(initialData);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [db]); // Add db as a dependency

  // Remove the updateLayout function as state updates will be handled by the onSnapshot listener
  // const updateLayout = useCallback((newLayout: BackyardLayout) => {
  //   setLayout(newLayout);
  //   try {
  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
  //   } catch (error) {
  //     console.error("Failed to save data to localStorage:", error);
  //   }
  // }, []);

  const updatePlantPosition = useCallback(async (plantId: string, newPosition: { x: number; y: number }) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const plant = category.plants.find(p => p.id === plantId);
            if (plant) {
                plant.position = newPosition;
                // Save the entire updated layout to Firestore
                const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                await setDoc(layoutRef, newLayout)
                    .then(() => {
                        console.log("Plant position updated and layout saved to Firestore");
                        // State update handled by onSnapshot
                    })
                    .catch(error => {
                        console.error("Error updating plant position in Firestore:", error);
                        // Handle error
                    });
                return;
            }
        }
    }
  }, [layout, db]); // Add db as a dependency

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

    // Save the entire updated layout to Firestore
    const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
    await setDoc(layoutRef, newLayout)
        .then(() => {
            console.log("Plant added and layout saved to Firestore");
            // State update handled by onSnapshot
        })
        .catch(error => {
            console.error("Error adding plant to Firestore:", error);
            // Handle error
        });

  }, [layout, db]); // Add db as a dependency

  const removePlant = useCallback(async (plantId: string) => {
    if (!layout) return;
    const newLayout = structuredClone(layout);
    for (const categoryKey in newLayout) {
        const category = newLayout[categoryKey];
        if (isPlantCategory(category)) {
            const initialCount = category.plants.length;
            category.plants = category.plants.filter(p => p.id !== plantId);
            if (category.plants.length < initialCount) {
                // Save the entire updated layout to Firestore
                const layoutRef = doc(db, 'backyardLayouts', 'myLayout');
                await setDoc(layoutRef, newLayout)
                    .then(() => {
                        console.log("Plant removed and layout saved to Firestore");
                        // State update handled by onSnapshot
                    })\
                    .catch(error => {\
                        console.error(\"Error removing plant from Firestore:\", error);\
                        // Handle error\
                    });\
                return;\
            }\
        }\
    }\
  }, [layout, db]); // Add db as a dependency\
\
  const addRecordToPlant = useCallback(async (plantId: string, record: Omit<PlantRecord, \'id\' | \'photoDataUri\'>, photoFile?: File) => {\
    if (!layout) return;\
\
    const newRecord: PlantRecord = {\
        ...record,\
        id: Date.now(), // Consider a more robust ID generation for records\
        photoDataUri: photoFile ? await fileToDataUri(photoFile) : undefined,\
    };\
\
    const newLayout = structuredClone(layout);\
    for (const categoryKey in newLayout) {\
        const category = newLayout[categoryKey];\
        if (isPlantCategory(category)) {\
            const plant = category.plants.find(p => p.id === plantId);\
            if (plant) {\
                // Carry over latest values if not provided in the new record\
                const latestRecord = plant.records[0];\
                if (latestRecord) {\
                    if (newRecord.trunkDiameter === undefined || newRecord.trunkDiameter === \'\') {\
                        newRecord.trunkDiameter = latestRecord.trunkDiameter;\
                    }\
                    if (newRecord.nextScheduledFertilizationDate === undefined || newRecord.nextScheduledFertilizationDate === null) {\
                        newRecord.nextScheduledFertilizationDate = latestRecord.nextScheduledFertilizationDate;\
                    }\
                }\
\
                plant.records.unshift(newRecord);\
                // No need to sort here as we are using unshift\
                \
                // Save the entire updated layout to Firestore\
                const layoutRef = doc(db, \'backyardLayouts\', \'myLayout\');\
                await setDoc(layoutRef, newLayout)\
                    .then(() => {\
                        console.log(\"Record added to plant and layout saved to Firestore\");\
                        // State update handled by onSnapshot\
                    })\
                    .catch(error => {\
                        console.error(\"Error adding record to plant in Firestore:\", error);\
                        // Handle error\
                    });\
                return;\
            }\
        }\
    }\
  }, [layout, db]); // Add db as a dependency\
\
  const addRecordToPlants = useCallback(async (plantIds: string[], record: Omit<PlantRecord, \'id\' | \'photoDataUri\'>, photoFile?: File) => {\
    if (!layout) return;\
\
    const photoDataUri = photoFile ? await fileToDataUri(photoFile) : undefined;\
    const newLayout = structuredClone(layout);\
\
    let layoutChanged = false;\
    for (const categoryKey in newLayout) {\
        const category = newLayout[categoryKey];\
        if (isPlantCategory(category)) {\
            category.plants.forEach(plant => {\
                if (plantIds.includes(plant.id)) {\
                    const newRecord: PlantRecord = {\
                        ...record,\
                        id: Date.now() + Math.random(), // Add random to avoid collision if processed at same ms\
                        photoDataUri: photoDataUri,\
                    };\
                    plant.records.unshift(newRecord);\
                    layoutChanged = true;\
                    // no need to sort here\
                }\
            });\
        }\
    }\
\
    if (layoutChanged) {\
      // Save the entire updated layout to Firestore\
      const layoutRef = doc(db, \'backyardLayouts\', \'myLayout\');\
      await setDoc(layoutRef, newLayout)\
          .then(() => {\
              console.log(\"Records added to plants and layout saved to Firestore\");\
              // State update handled by onSnapshot\
          })\
          .catch(error => {\
              console.error(\"Error adding records to plants in Firestore:\", error);\
              // Handle error\
          });\
    }\
\
  }, [layout, db]); // Add db as a dependency\
\
\
  const updateRecordInPlant = useCallback(async (plantId: string, updatedRecord: PlantRecord, photoFile?: File) => {\
    if (!layout) return;\
    \
    const newLayout = structuredClone(layout);\
\
    if (photoFile) {\
        updatedRecord.photoDataUri = await fileToDataUri(photoFile);\
    }\
\
    for (const categoryKey in newLayout) {\
        const category = newLayout[categoryKey];\
        if (isPlantCategory(category)) {\
            const plant = category.plants.find(p => p.id === plantId);\
            if (plant) {\
                const recordIndex = plant.records.findIndex(r => r.id === updatedRecord.id);\
                if (recordIndex !== -1) {\
                    plant.records[recordIndex] = updatedRecord;\
                    plant.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());\
                    // Save the entire updated layout to Firestore\
                    const layoutRef = doc(db, \'backyardLayouts\', \'myLayout\');\
                    await setDoc(layoutRef, newLayout)\
                        .then(() => {\
                            console.log(\"Record updated in plant and layout saved to Firestore\");\
                            // State update handled by onSnapshot\
                        })\
                        .catch(error => {\
                            console.error(\"Error updating record in plant in Firestore:\", error);\
                            // Handle error\
                        });\
                    return; // Exit after finding and updating\
                }\
            }\
        }\
    }\
  }, [layout, db]); // Add db as a dependency\
\
  const deleteRecordFromPlant = useCallback(async (plantId: string, recordId: number) => {\
    if (!layout) return;\
    const newLayout = structuredClone(layout);\
    for (const categoryKey in newLayout) {\
        const category = newLayout[categoryKey];\
        if (isPlantCategory(category)) {\
            const plant = category.plants.find(p => p.id === plantId);\
            if (plant) {\
                const initialCount = plant.records.length;\
                plant.records = plant.records.filter(r => r.id !== recordId);\
                if (plant.records.length < initialCount) {\
                    // Save the entire updated layout to Firestore\
                    const layoutRef = doc(db, \'backyardLayouts\', \'myLayout\');\
                    await setDoc(layoutRef, newLayout)\
                        .then(() => {\
                            console.log(\"Record deleted from plant and layout saved to Firestore\");\
                            // State update handled by onSnapshot\
                        })\
                        .catch(error => {\
                            console.error(\"Error deleting record from plant in Firestore:\", error);\
                            // Handle error\
                        });\
                    return;\
                }\
            }\
        }\
    }\
  }, [layout, db]); // Add db as a dependency\
\
  const updatePlant = useCallback(async (plantId: string, updates: Partial<Plant>) => {\
    if (!layout) return;\
    const newLayout = structuredClone(layout);\
    for (const categoryKey in newLayout) {\
        const category = newLayout[categoryKey];\
        if (isPlantCategory(category)) {\
            const plantIndex = category.plants.findIndex(p => p.id === plantId);\
            if (plantIndex !== -1) {\
                category.plants[plantIndex] = { ...category.plants[plantIndex], ...updates };\
                // Save the entire updated layout to Firestore\
                const layoutRef = doc(db, \'backyardLayouts\', \'myLayout\');\
                await setDoc(layoutRef, newLayout)\
                    .then(() => {\
                            console.log(\"Plant updated and layout saved to Firestore\");\
                            // State update handled by onSnapshot\
                        })\
                        .catch(error => {\
                            console.error(\"Error updating plant in Firestore:\", error);\
                            // Handle error\
                        });\
                    return;\
                }\
            }\
        }\
    }\
  }, [layout, db]); // Add db as a dependency\
\
\
  return { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant, addRecordToPlants, updateRecordInPlant, updatePlant, deleteRecordFromPlant };\n}\n</CODE_BLOCK>"))
{"natural_language_write_file_response": {"result": "The file was updated", "status": "succeeded"}}
