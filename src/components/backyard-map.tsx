"use client";

import React, { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import type { BackyardLayout, Plant } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BackyardMapProps {
  layout: BackyardLayout;
  selectedPlantId: string | null;
  onSelectPlant: (plantId: string) => void;
  onUpdatePlantPosition: (plantId: string, position: { x: number; y: number }) => void;
}

export function BackyardMap({ layout, selectedPlantId, onSelectPlant, onUpdatePlantPosition }: BackyardMapProps) {
  const [draggingPlant, setDraggingPlant] = useState<{ id: string; offset: { x: number; y: number } } | null>(null);
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
    e.preventDefault();
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
    if (draggingPlant) {
      // Small delay to prevent click event from firing after drag
      setTimeout(() => setDraggingPlant(null), 50);
    }
  };

  const handleClick = (e: MouseEvent, plantId: string) => {
    if (draggingPlant) {
      e.stopPropagation();
      return;
    }
    onSelectPlant(plantId);
  };
  
  return (
    <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
       <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-full max-w-[1000px] max-h-[1000px] aspect-square rounded-lg shadow-lg border-2 border-border"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <image
          href="https://placehold.co/1000x1000.png"
          data-ai-hint="backyard lawn diagram"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
        />

        {Object.values(layout).map((category) =>
          category.plants.map((plant) => (
            <g
              key={plant.id}
              transform={`translate(${plant.position.x}, ${plant.position.y})`}
              className={cn("cursor-pointer transition-transform duration-200", draggingPlant?.id === plant.id && "cursor-grabbing")}
              onMouseDown={(e) => handleMouseDown(e, plant)}
              onClick={(e) => handleClick(e, plant.id)}
            >
              <circle
                r="2.5"
                fill={category.color}
                stroke="white"
                strokeWidth="0.3"
                className={cn("transition-all", selectedPlantId === plant.id && "stroke-accent" )}
                style={{
                    filter: selectedPlantId === plant.id ? 'drop-shadow(0 0 1px hsl(var(--accent)))' : 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))'
                }}
              />
               <circle
                r="2.5"
                fill="transparent"
                stroke={selectedPlantId === plant.id ? 'hsl(var(--accent))' : 'transparent'}
                strokeWidth="0.5"
               />
              <text
                x="0"
                y="0.5"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="1.8"
                fontWeight="bold"
                fill="white"
                className="pointer-events-none select-none"
              >
                {plant.label}
              </text>
            </g>
          ))
        )}
      </svg>
    </div>
  );
}
