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
        <defs>
            <pattern id="patio-texture" patternUnits="userSpaceOnUse" width="1" height="1">
                <circle cx="0.5" cy="0.5" r="0.2" fill="hsl(var(--muted-foreground))" fillOpacity="0.3" />
            </pattern>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="hsl(var(--card))" />

        {/* Patio Area */}
        <path
            d="M51,99 V62 C51,62 50,55 45,55 S30,55 30,55 C30,55 18,55 18,65 S18,99 18,99 H51 Z M99,99 V62 H55 V99 H99 Z M55,58 H99V48 H55Z"
            fill="url(#patio-texture)"
            stroke="hsl(var(--border))"
            strokeWidth="0.2"
        />

        {/* Lawn Area */}
        <path
            d="M3.5,3.5 H96.5 V96.5 H3.5 V3.5 Z"
            fill="transparent"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
        />
        <path
            d="M18,65 C18,55 30,55 30,55 C30,55 45,55 45,55 C50,55 51,62 51,62 V85 C51,85 51,90 55,90 S70,90 75,90 S83,88 83,85 S85,75 85,70 S88,60 92,58 S95,50 95,45 S92,30 88,25 S80,15 75,12 S65,10 60,12 S50,15 45,18 S35,22 30,22 S22,25 20,30 S18,40 18,45 S20,55 18,65 Z"
            fill="transparent"
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
        />

        {/* Pool */}
        <path
            d="M30,12 C30,12 35,8 45,8 S55,10 60,15 S70,20 75,20 S85,18 88,22 S90,30 90,35 S88,42 85,45 S78,48 70,48 S60,45 55,42 S45,38 40,35 S30,30 25,25 S28,15 30,12 Z"
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
        />

        {/* Stepping Stones */}
        <circle cx="18" cy="65" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.2" />
        <circle cx="95" cy="45" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.2" />
        <circle cx="83" cy="85" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.2" />
        <circle cx="88,25" cy="25" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="0.2" />

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
