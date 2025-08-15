
"use client";

import React, { useState, useRef, MouseEvent } from 'react';
import type { BackyardLayout, Plant } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BackyardMapProps {
  layout: Omit<BackyardLayout, 'version'>;
  selectedPlantIds: string[];
  onSelectPlant: (plantId: string | null, isMultiSelect: boolean) => void;
  onUpdatePlantPosition: (plantId:string, position: { x: number; y: number }) => void;
}

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
    const clampedX = Math.max(0, Math.min(100, newX));
    const clampedY = Math.max(0, Math.min(100, newY));

    onUpdatePlantPosition(draggingPlant.id, { x: clampedX, y: clampedY });
  };

  const handleMouseUp = (e: MouseEvent) => {
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
  
  return (
    <div className="relative w-full h-full p-4 md:p-8 flex items-center justify-center">
       <div className="relative w-full h-full max-w-[1000px] max-h-[1000px] aspect-square shadow-2xl rounded-lg overflow-hidden bg-white">
        
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url('https://i.imgur.com/7wkMw77.png')`,
          }}
        />

        {/* Interactive Plant Overlay SVG */}
        <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            className="absolute top-0 left-0 w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <defs>
            <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feOffset in="blur" dx="0.5" dy="0.5" result="offsetBlur"/>
                <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            </defs>

            {Object.values(layout).map((category) =>
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
                    r="2.2"
                    fill={category.color}
                    stroke="white"
                    strokeWidth="0.3"
                    className={cn("transition-all", isSelected && "stroke-accent" )}
                    style={{
                        filter: isSelected ? 'drop-shadow(0 0 1px hsl(var(--accent)))' : 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))'
                    }}
                />
                <circle
                    r="2.2"
                    fill="transparent"
                    stroke={isSelected ? 'hsl(var(--accent))' : 'transparent'}
                    strokeWidth="0.5"
                />
                <text
                    x="0"
                    y="0"
                    dy="0.05em"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="1.6"
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
