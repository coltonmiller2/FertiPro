
"use client";

import React, { useState, useRef, MouseEvent } from 'react';
import type { BackyardLayout, Plant, PlantCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BackyardMapProps {
  layout: Omit<BackyardLayout, 'version'>;
  selectedPlantIds: string[];
  onSelectPlant: (plantId: string | null, isMultiSelect: boolean) => void;
  onUpdatePlantPosition: (plantId:string, position: { x: number; y: number }) => void;
}

function isPlantCategory(value: any): value is PlantCategory {
    return value && typeof value === 'object' && Array.isArray(value.plants);
}

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 1000;


export function BackyardMap({ layout, selectedPlantIds, onSelectPlant, onUpdatePlantPosition }: BackyardMapProps) {
  const [draggingPlant, setDraggingPlant] = useState<{ id: string; offset: { x: number; y: number } } | null>(null);
  const dragHappened = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const getSVGPoint = (e: MouseEvent) => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleMouseDown = (e: MouseEvent, plant: Plant) => {
    dragHappened.current = false;
    const point = getSVGPoint(e);
    if (!point) return;

    setDraggingPlant({
      id: plant.id,
      offset: {
        x: plant.position.x - point.x,
        y: plant.position.y - point.y,
      },
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingPlant) return;
    e.preventDefault();
    dragHappened.current = true; // If mouse moves, it's a drag
    const point = getSVGPoint(e);
    if (!point) return;

    const newX = point.x + draggingPlant.offset.x;
    const newY = point.y + draggingPlant.offset.y;
    
    // Clamp positions within viewBox
    const clampedX = Math.max(0, Math.min(VIEWBOX_WIDTH, newX));
    const clampedY = Math.max(0, Math.min(VIEWBOX_HEIGHT, newY));

    onUpdatePlantPosition(draggingPlant.id, { x: clampedX, y: clampedY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    // No need to call onUpdatePlantPosition on mouse up, it is now handled in handleMouseMove for real-time updates
    setDraggingPlant(null);
  };
  
  const handleClick = (e: MouseEvent, plantId: string) => {
    if (dragHappened.current) {
      dragHappened.current = false;
      return;
    }
    const isMultiSelect = e.ctrlKey || e.metaKey;
    onSelectPlant(plantId, isMultiSelect);
  };
  
  const scale = 40;

  return (
    <div
      className="p-4 md:p-8 flex items-center justify-center h-full w-full"
    >
      <div
        className="relative w-full h-full max-w-[1000px] max-h-[1000px] bg-background shadow-2xl rounded-lg"
        style={{ aspectRatio: '1 / 1' }}
      >
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
             <image href="https://placehold.co/1000x1000.png" x="0" y="0" width="100%" height="100%" data-ai-hint="backyard map" />
            
            {Object.values(layout)
              .filter(isPlantCategory)
              .map((category) =>
              category.plants.map((plant) => {
                const isSelected = selectedPlantIds.includes(plant.id);
                
                return (
                  <g
                  key={plant.id}
                  transform={`translate(${plant.position.x}, ${plant.position.y})`}
                  className={cn("cursor-pointer transition-transform duration-200", draggingPlant?.id === plant.id && "cursor-grabbing")}
                  onMouseDown={(e) => handleMouseDown(e, plant)}
                  onClick={(e) => handleClick(e, plant.id)}
                  >
                  <circle
                      r={scale * 0.22}
                      fill={category.color}
                      stroke="white"
                      strokeWidth={scale * 0.03}
                      className={cn("transition-all", isSelected && "stroke-accent" )}
                      style={{
                          filter: isSelected ? 'drop-shadow(0 0 10px hsl(var(--accent)))' : 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))'
                      }}
                  />
                  <circle
                      r={scale * 0.22}
                      fill="transparent"
                      stroke={isSelected ? 'hsl(var(--accent))' : 'transparent'}
                      strokeWidth={scale * 0.05}
                  />
                  <text
                      x="0"
                      y="0"
                      dy="0.05em"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={scale * 0.16}
                      fontWeight="bold"
                      fill="white"
                      className="pointer-events-none select-none"
                  >
                      {plant.label}
                  </text>
                  </g>
                )
              })
            )}
        </svg>
      </div>
    </div>
  );
}

