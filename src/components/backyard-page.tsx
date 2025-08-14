
"use client";

import React, { useState, useMemo } from 'react';
import { Leaf, Plus } from 'lucide-react';
import Image from 'next/image';

import { useBackyardData } from '@/hooks/use-backyard-data';
import type { Plant, PlantCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddPlantModal } from '@/components/add-plant-modal';
import { PlantDetailsPanel } from '@/components/plant-details-panel';
import { BackyardMap } from '@/components/backyard-map';
import { Skeleton } from '@/components/ui/skeleton';

export function BackyardPage() {
  const { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant } = useBackyardData();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const { selectedPlant, selectedPlantCategory } = useMemo(() => {
    if (!selectedPlantId || !layout) {
      return { selectedPlant: null, selectedPlantCategory: null };
    }
    for (const categoryKey in layout) {
      const category = layout[categoryKey];
      const plant = category.plants.find(p => p.id === selectedPlantId);
      if (plant) {
        return { selectedPlant: plant, selectedPlantCategory: category };
      }
    }
    return { selectedPlant: null, selectedPlantCategory: null };
  }, [selectedPlantId, layout]);

  const handleSelectPlant = (plantId: string | null) => {
    setSelectedPlantId(plantId);
  };
  
  const handleUpdatePlant = (plantId: string, record: any) => {
    addRecordToPlant(plantId, record);
    // Refetch or update local state to show new record
    if(layout) {
        const newLayout = {...layout};
        // This is a bit of a hack to force a re-render of the details panel
        // In a real app with a more robust state manager, this would be cleaner
        setSelectedPlantId(null);
        setTimeout(() => setSelectedPlantId(plantId), 0);
    }
  };

  const handleDeletePlant = (plantId: string) => {
    removePlant(plantId);
    setSelectedPlantId(null);
  };


  if (loading || !layout) {
    return (
        <div className="w-full h-screen p-4 flex flex-col gap-4 bg-background">
            <Skeleton className="h-16 w-1/3" />
            <Skeleton className="flex-1 w-full" />
        </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-secondary/50 font-sans overflow-hidden">
      <header className="flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6 shrink-0 z-10">
        <div className="flex items-center gap-2 font-semibold">
          <Leaf className="h-6 w-6 text-primary" />
          <span>Backyard Bounty</span>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Plant
        </Button>
      </header>
      
      <div className="fixed inset-0 -z-10">
          <Image
              src="https://placehold.co/1000x1000.png"
              alt="Backyard background"
              layout="fill"
              objectFit="cover"
              className="filter blur-sm brightness-75"
              data-ai-hint="backyard garden"
           />
      </div>

      <main className="flex-1 relative">
        <BackyardMap
          layout={layout}
          selectedPlantId={selectedPlantId}
          onSelectPlant={handleSelectPlant}
          onUpdatePlantPosition={updatePlantPosition}
        />
        <PlantDetailsPanel
          plant={selectedPlant}
          category={selectedPlantCategory}
          onClose={() => handleSelectPlant(null)}
          onUpdatePlant={handleUpdatePlant}
          onDeletePlant={handleDeletePlant}
        />
      </main>
      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddPlant={addPlant}
        layout={layout}
      />
    </div>
  );
}
