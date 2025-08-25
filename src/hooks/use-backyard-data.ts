"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import type {
  BackyardLayout,
  Plant,
  Record as PlantRecord,
  PlantCategory,
} from "@/lib/types";
import { initialData } from "@/lib/initial-data";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

type ConnectionStatus = "connecting" | "connected" | "error";

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isPlantCategory(value: unknown): value is PlantCategory {
  return (
    !!value &&
    typeof value === "object" &&
    "name" in (value as any) &&
    "color" in (value as any) &&
    Array.isArray((value as any).plants)
  );
}

type CategoryKey<T> = Extract<keyof T, string>;

function getCategoryKeys(layout: BackyardLayout): CategoryKey<BackyardLayout>[] {
  return (Object.keys(layout) as CategoryKey<BackyardLayout>[]).filter(
    (k) => k !== "version" && isPlantCategory((layout as any)[k])
  );
}

// --- NEW: no top-level await; dynamically import Storage when needed
async function uploadPhotoIfPossible(
  path: string,
  file: File
): Promise<string> {
  try {
    const mod = await import("firebase/storage");
    const { getStorage, ref, uploadBytes, getDownloadURL } = mod;
    const storage = getStorage();
    const r = ref(storage, path);
    await uploadBytes(r, file);
    return getDownloadURL(r);
  } catch {
    // Storage not configured or runtime import failed; fallback to Data URI
    return fileToDataUri(file);
  }
}

export function useBackyardData(docId: string = "myLayout") {
  const layoutRef = useMemo(() => doc(db, "backyardLayouts", docId), [docId]);

  const [layout, setLayout] = useState<BackyardLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);

  // Avoid echoing our own writes back into state in a noisy way (reserved for future needs)
  const isApplyingRemoteRef = useRef(false);

  // FIX: useRef expects a value, not a function
  const instanceIdRef = useRef<string>(Math.random().toString(36).slice(2));

  // Debounced Firestore updater
  const debouncedUpdateFirestore = useMemo(
    () =>
      debounce(
        async (newLayout: BackyardLayout) => {
          try {
            setLastError(null);
            await setDoc(
              layoutRef,
              {
                ...newLayout,
                meta: {
                  ...(newLayout as any).meta,
                  updatedAt: serverTimestamp(),
                  lastUpdatedBy: instanceIdRef.current,
                },
              },
              { merge: true }
            );
            setConnectionStatus("connected");
          } catch (error: any) {
            console.error("Error updating layout in Firestore:", error);
            setConnectionStatus("error");
            setLastError(error?.message ?? String(error));
          }
        },
        500,
        { leading: false, trailing: true, maxWait: 1500 }
      ),
    [layoutRef]
  );

  useEffect(() => {
    return () => debouncedUpdateFirestore.cancel();
  }, [debouncedUpdateFirestore]);

  // Subscribe / bootstrap doc
  useEffect(() => {
    setLoading(true);
    setConnectionStatus("connecting");
    setLastError(null);

    const unsubscribe = onSnapshot(
      layoutRef,
      { includeMetadataChanges: true },
      async (snap) => {
        try {
          if (!snap.exists()) {
            await setDoc(
              layoutRef,
              {
                ...initialData,
                meta: {
                  updatedAt: serverTimestamp(),
                  lastUpdatedBy: instanceIdRef.current,
                },
              },
              { merge: true }
            );
            setLayout(initialData);
            setConnectionStatus("connected");
            setLoading(false);
            return;
          }

          const data = snap.data() as BackyardLayout;
          isApplyingRemoteRef.current = true;
          setLayout(data);
          setConnectionStatus("connected");
          setLoading(false);
        } catch (err: any) {
          console.error("Snapshot handling error:", err);
          setConnectionStatus("error");
          setLastError(err?.message ?? String(err));
          setLoading(false);
        } finally {
          isApplyingRemoteRef.current = false;
        }
      },
      (error) => {
        console.error("Error fetching backyard layout:", error);
        setConnectionStatus("error");
        setLastError(error?.message ?? String(error));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [layoutRef]);

  const updateLayout = useCallback(
    (newLayout: BackyardLayout) => {
      setLayout(newLayout); // optimistic local
      debouncedUpdateFirestore(newLayout);
    },
    [debouncedUpdateFirestore]
  );

  const findPlant = useCallback(
    (
      theLayout: BackyardLayout,
      plantId: string
    ): { categoryKey: string; plant: Plant; index: number } | null => {
      for (const key of getCategoryKeys(theLayout)) {
        const cat = (theLayout as any)[key];
        if (!isPlantCategory(cat)) continue;
        const idx = cat.plants.findIndex((p: Plant) => p.id === plantId);
        if (idx !== -1) {
          return { categoryKey: key, plant: cat.plants[idx], index: idx };
        }
      }
      return null;
    },
    []
  );

  // ---------- Public API ----------
  const updatePlantPosition = useCallback(
    (plantId: string, newPosition: { x: number; y: number }) => {
      if (!layout) return;
      const newLayout = structuredClone(layout);
      const hit = findPlant(newLayout, plantId);
      if (!hit) return;
      (newLayout as any)[hit.categoryKey].plants[hit.index] = {
        ...hit.plant,
        position: newPosition,
      };
      updateLayout(newLayout);
    },
    [layout, findPlant, updateLayout]
  );

  const addPlant = useCallback(
    (categoryKey: string, plantType: string) => {
      if (!layout) return;
      const newLayout = structuredClone(layout);
      const category = (newLayout as any)[categoryKey];
      if (!isPlantCategory(category)) return;

      const existing = new Set(category.plants.map((p: Plant) => p.label));
      let labelCode = "A".charCodeAt(0);
      while (existing.has(String.fromCharCode(labelCode))) labelCode++;
      const newLabel = String.fromCharCode(labelCode);

      const newPlant: Plant = {
        id: `${categoryKey.slice(0, 3)}-${Date.now()}`,
        label: newLabel,
        type: plantType,
        position: { x: 50, y: 50 },
        records: [],
      };
      category.plants.push(newPlant);
      updateLayout(newLayout);
    },
    [layout, updateLayout]
  );

  const removePlant = useCallback(
    (plantId: string) => {
      if (!layout) return;
      const newLayout = structuredClone(layout);
      for (const key of getCategoryKeys(newLayout)) {
        const category = (newLayout as any)[key] as PlantCategory;
        const next = category.plants.filter((p) => p.id !== plantId);
        if (next.length !== category.plants.length) {
          category.plants = next;
          updateLayout(newLayout);
          return;
        }
      }
    },
    [layout, updateLayout]
  );

  const addRecordToPlant = useCallback(
    async (
      plantId: string,
      record: Omit<PlantRecord, "id" | "photoDataUri">,
      photoFile?: File
    ) => {
      if (!layout) return;

      let photoDataUri: string | undefined = undefined;
      if (photoFile) {
        const path = `backyardLayouts/${docId}/plants/${plantId}/records/${Date.now()}-${photoFile.name}`;
        photoDataUri = await uploadPhotoIfPossible(path, photoFile);
      }

      const newRecord: PlantRecord = {
        ...record,
        id: Date.now(),
        photoDataUri, // remains undefined if no file provided
      };

      const newLayout = structuredClone(layout);
      const hit = findPlant(newLayout, plantId);
      if (!hit) return;

      const plant = (newLayout as any)[hit.categoryKey].plants[hit.index] as Plant;
      plant.records.unshift(newRecord);
      plant.records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      updateLayout(newLayout);
    },
    [layout, updateLayout, findPlant, docId]
  );

  const addRecordToPlants = useCallback(
    async (
      plantIds: string[],
      record: Omit<PlantRecord, "id" | "photoDataUri">,
      photoFile?: File
    ) => {
      if (!layout) return;

      let sharedPhoto: string | undefined = undefined;
      if (photoFile) {
        const path = `backyardLayouts/${docId}/bulk/${Date.now()}-${photoFile.name}`;
        sharedPhoto = await uploadPhotoIfPossible(path, photoFile);
      }

      const newLayout = structuredClone(layout);
      let changed = false;

      for (const key of getCategoryKeys(newLayout)) {
        const category = (newLayout as any)[key] as PlantCategory;
        category.plants.forEach((plant, idx) => {
          if (plantIds.includes(plant.id)) {
            const newRecord: PlantRecord = {
              ...record,
              id: Date.now() + Math.random(),
              photoDataUri: sharedPhoto, // undefined if no file provided
            };
            category.plants[idx].records = [
              newRecord,
              ...category.plants[idx].records,
            ].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            changed = true;
          }
        });
      }

      if (changed) updateLayout(newLayout);
    },
    [layout, updateLayout, docId]
  );

  const updateRecordInPlant = useCallback(
    async (plantId: string, updatedRecord: PlantRecord, photoFile?: File) => {
      if (!layout) return;
      const newLayout = structuredClone(layout);
      const hit = findPlant(newLayout, plantId);
      if (!hit) return;

      const plant = (newLayout as any)[hit.categoryKey].plants[hit.index] as Plant;

      let photoUrl = updatedRecord.photoDataUri;
      if (photoFile) {
        const path = `backyardLayouts/${docId}/plants/${plantId}/records/${updatedRecord.id}-${photoFile.name}`;
        photoUrl = await uploadPhotoIfPossible(path, photoFile);
      }

      const idx = plant.records.findIndex((r) => r.id === updatedRecord.id);
      if (idx === -1) return;

      plant.records[idx] = { ...updatedRecord, photoDataUri: photoUrl };
      plant.records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      updateLayout(newLayout);
    },
    [layout, updateLayout, findPlant, docId]
  );

  const deleteRecordFromPlant = useCallback(
    async (plantId: string, recordId: number) => {
      if (!layout) return;
      const newLayout = structuredClone(layout);
      const hit = findPlant(newLayout, plantId);
      if (!hit) return;

      const plant = (newLayout as any)[hit.categoryKey].plants[hit.index] as Plant;
      const initial = plant.records.length;
      plant.records = plant.records.filter((r) => r.id !== recordId);
      if (plant.records.length !== initial) {
        updateLayout(newLayout);
      }
    },
    [layout, updateLayout, findPlant]
  );

  const updatePlant = useCallback(
    async (plantId: string, updates: Partial<Plant>) => {
      if (!layout) return;
      const newLayout = structuredClone(layout);
      const hit = findPlant(newLayout, plantId);
      if (!hit) return;

      const plant = (newLayout as any)[hit.categoryKey].plants[hit.index] as Plant;
      (newLayout as any)[hit.categoryKey].plants[hit.index] = {
        ...plant,
        ...updates,
      };
      updateLayout(newLayout);
    },
    [layout, updateLayout, findPlant]
  );

  const forceReload = useCallback(async () => {
    try {
      const d = await getDoc(layoutRef);
      if (d.exists()) {
        setLayout(d.data() as BackyardLayout);
        setConnectionStatus("connected");
      }
    } catch (e: any) {
      setConnectionStatus("error");
      setLastError(e?.message ?? String(e));
    }
  }, [layoutRef]);

  const resetToInitial = useCallback(async () => {
    try {
      await setDoc(
        layoutRef,
        {
          ...initialData,
          meta: {
            updatedAt: serverTimestamp(),
            lastUpdatedBy: instanceIdRef.current,
          },
        },
        { merge: false }
      );
      setLayout(initialData);
      setConnectionStatus("connected");
      setLastError(null);
    } catch (e: any) {
      setConnectionStatus("error");
      setLastError(e?.message ?? String(e));
    }
  }, [layoutRef]);

  return {
    layout,
    loading,
    connectionStatus,
    lastError,
    updatePlantPosition,
    addPlant,
    removePlant,
    addRecordToPlant,
    addRecordToPlants,
    updateRecordInPlant,
    updatePlant,
    deleteRecordFromPlant,
    forceReload,
    resetToInitial,
  };
}
