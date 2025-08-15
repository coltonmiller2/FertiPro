
"use client";

import React, { useState, useMemo } from 'react';
import { Leaf, Plus, Map, Table } from 'lucide-react';
import { useBackyardData } from '@/hooks/use-backyard-data';
import type { Plant, PlantCategory, Record as PlantRecord, BackyardLayout } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AddPlantModal } from '@/components/add-plant-modal';
import { PlantDetailsPanel } from '@/components/plant-details-panel';
import { BackyardMap } from '@/components/backyard-map';
import { TableView } from '@/components/table-view';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BulkUpdatePanel } from '@/components/bulk-update-panel';

function isPlantCategory(value: any): value is PlantCategory {
    return value && typeof value === 'object' && 'name' in value && 'color' in value && Array.isArray(value.plants);
}

const getFilteredLayout = (layout: BackyardLayout | null): Omit<BackyardLayout, 'version'> => {
    if (!layout) return {};
    const filteredLayout: Omit<BackyardLayout, 'version'> = {};
    for (const key in layout) {
        if (key !== 'version') {
            const category = layout[key];
            if (isPlantCategory(category)) {
               filteredLayout[key] = category;
            }
        }
    }
    return filteredLayout;
}

export function BackyardPage() {
  const { layout, loading, updatePlantPosition, addPlant, removePlant, addRecordToPlant, addRecordToPlants, updateRecordInPlant, updatePlant } = useBackyardData();
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  const filteredLayout = useMemo(() => getFilteredLayout(layout), [layout]);

  const allPlants = useMemo(() => {
    if (!layout) return [];
    return Object.values(filteredLayout).flatMap(category => category.plants);
  }, [filteredLayout]);

  const selectedPlants = useMemo(() => {
    return allPlants.filter(p => selectedPlantIds.includes(p.id));
  }, [selectedPlantIds, allPlants]);
  
  const { selectedPlant, selectedPlantCategory } = useMemo(() => {
    if (selectedPlantIds.length !== 1 || !layout) {
      return { selectedPlant: null, selectedPlantCategory: null };
    }
    const singleSelectedId = selectedPlantIds[0];
    for (const categoryKey in layout) {
      const category = layout[categoryKey];
      if (isPlantCategory(category)) {
          const plant = category.plants.find(p => p.id === singleSelectedId);
          if (plant) {
            return { selectedPlant: plant, selectedPlantCategory: category };
          }
      }
    }
    return { selectedPlant: null, selectedPlantCategory: null };
  }, [selectedPlantIds, layout]);

  const handleSelectPlant = (plantId: string | null, isMultiSelect = false) => {
    if (plantId === null) {
      setSelectedPlantIds([]);
      return;
    }

    if (isMultiSelect) {
      setSelectedPlantIds(prev =>
        prev.includes(plantId)
          ? prev.filter(id => id !== plantId)
          : [...prev, plantId]
      );
    } else {
      setSelectedPlantIds(prev => prev.includes(plantId) && prev.length === 1 ? [] : [plantId]);
    }
  };
  
  const handleAddRecord = (plantId: string, record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    addRecordToPlant(plantId, record, photoFile);
  };
  
  const handleBulkAddRecord = (plantIds: string[], record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => {
    addRecordToPlants(plantIds, record, photoFile);
    setSelectedPlantIds([]);
  }

  const handleUpdateRecord = (plantId: string, record: PlantRecord, photoFile?: File) => {
    updateRecordInPlant(plantId, record, photoFile);
  };

  const handleDeletePlant = (plantId: string) => {
    removePlant(plantId);
    setSelectedPlantIds(prev => prev.filter(id => id !== plantId));
  };

  const handleUpdatePlant = (plantId: string, updates: Partial<Plant>) => {
    updatePlant(plantId, updates);
  };

  const showDetailsPanel = selectedPlants.length === 1;
  const showBulkUpdatePanel = selectedPlants.length > 1;
  const showRightPanel = showDetailsPanel || showBulkUpdatePanel;


  if (loading || !layout) {
    return (
      <div className="flex h-screen w-screen flex-col bg-background font-sans overflow-hidden">
         <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 font-semibold">
            <Leaf className="h-6 w-6 text-primary" />
            <span>Backyard Bounty</span>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </header>
        <main className="flex-1 relative flex items-center justify-center p-4 md:p-8">
            <Skeleton className="w-full h-full max-w-[1000px] shadow-2xl rounded-lg"/>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background font-sans">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 lg:px-6 z-10">
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
      
      <main className="flex flex-1 overflow-hidden">
        <div className={cn("transition-all duration-300 ease-in-out h-full flex-1", showRightPanel ? "w-[calc(100%-24rem)]" : "w-full")}>
            {viewMode === 'map' ? (
                <BackyardMap
                    layout={filteredLayout}
                    selectedPlantIds={selectedPlantIds}
                    onSelectPlant={handleSelectPlant}
                    onUpdatePlantPosition={updatePlantPosition}
                />
            ) : (
                <div className="h-full overflow-auto">
                    <TableView 
                      layout={filteredLayout}
                      selectedPlantIds={selectedPlantIds}
                      onSelectPlant={handleSelectPlant}
                      setSelectedPlantIds={setSelectedPlantIds}
                    />
                </div>
            )}
        </div>
        
        <div className={cn("transition-all duration-300 ease-in-out flex-shrink-0", showRightPanel ? 'w-96' : 'w-0')}>
            {showDetailsPanel && (
                <PlantDetailsPanel
                  plant={selectedPlants[0]}
                  category={selectedPlantCategory}
                  onClose={() => handleSelectPlant(null, false)}
                  onAddRecord={handleAddRecord}
                  onUpdateRecord={handleUpdateRecord}
                  onDeletePlant={handleDeletePlant}
                  onUpdatePlant={handleUpdatePlant}
                />
            )}
            
            {showBulkUpdatePanel && (
                <BulkUpdatePanel
                    selectedPlants={selectedPlants}
                    onClose={() => setSelectedPlantIds([])}
                    onBulkAddRecord={handleBulkAddRecord}
                />
            )}
        </div>

      </main>
      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddPlant={addPlant}
        layout={filteredLayout}
      />
    </div>
  );
}
