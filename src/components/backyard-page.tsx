
"use client";

import React, { useState, useMemo } from 'react';
import { Leaf, Plus, Map, Table } from 'lucide-react';
import { useBackyardData } from '@/hooks/use-backyard-data';
import type { Plant, PlantCategory, Record as PlantRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddPlantModal } from '@/components/add-plant-modal';
import { PlantDetailsPanel } from '@/components/plant-details-panel';
import { BackyardMap } from '@/components/backyard-map';
import { TableView } from '@/components/table-view';
import { Skeleton } from '@/components/ui/skeleton';

export function BackyardPage() {
  const { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant, updateRecordInPlant } = useBackyardData();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

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
  
  const handleAddRecord = (plantId: string, record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    addRecordToPlant(plantId, record, photoFile);
  };

  const handleUpdateRecord = (plantId: string, record: PlantRecord, photoFile?: File) => {
    updateRecordInPlant(plantId, record, photoFile);
  };

  const handleDeletePlant = (plantId: string) => {
    removePlant(plantId);
    setSelectedPlantId(null);
  };

  if (loading || !layout) {
    return (
      <div className="flex h-screen w-screen flex-col bg-background font-sans overflow-hidden">
         <header className="flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 font-semibold">
            <Leaf className="h-6 w-6 text-primary" />
            <span>Backyard Bounty</span>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </header>
        <main className="flex-1 relative">
            <div className="relative w-full h-full p-4 md:p-8 flex items-center justify-center">
              <Skeleton className="w-full h-full max-w-[1000px] max-h-[1000px] aspect-square shadow-2xl rounded-lg"/>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background font-sans overflow-hidden">
      <header className="flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6 shrink-0 z-10">
        <div className="flex items-center gap-2 font-semibold">
          <Leaf className="h-6 w-6 text-primary" />
          <span>Backyard Bounty</span>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'map' ? 'table' : 'map')}>
            {viewMode === 'map' ? <Table className="mr-2 h-4 w-4" /> : <Map className="mr-2 h-4 w-4" />}
            {viewMode === 'map' ? 'View Table' : 'View Map'}
            </Button>
            <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Plant
            </Button>
        </div>
      </header>
      
      <main className="flex-1 relative overflow-auto">
        {viewMode === 'map' ? (
            <BackyardMap
                layout={layout}
                selectedPlantId={selectedPlantId}
                onSelectPlant={handleSelectPlant}
                onUpdatePlantPosition={updatePlantPosition}
            />
        ) : (
            <TableView layout={layout} onSelectPlant={handleSelectPlant} />
        )}
        <PlantDetailsPanel
          plant={selectedPlant}
          category={selectedPlantCategory}
          onClose={() => handleSelectPlant(null)}
          onUpdatePlant={handleAddRecord}
          onUpdateRecord={handleUpdateRecord}
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
