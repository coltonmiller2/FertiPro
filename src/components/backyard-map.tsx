
"use client";

import React, { useState, useRef, MouseEvent } from 'react';
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
       <div 
         className="relative w-full h-full max-w-[1000px] max-h-[1000px] aspect-square rounded-lg shadow-lg border-2 border-border overflow-hidden bg-background"
        >
        {/* Vector Background SVG */}
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            <g stroke="#9ca3af" strokeWidth="0.5" fill="none">
              {/* Main outline */}
              <path d="M2,2 H98 V98 H2 Z" />

              {/* Pool area */}
              <path d="M20,18 C30,10 50,12 65,15 S85,20 90,30 C95,40 85,55 70,60 C60,63 45,68 35,65 S18,50 15,35 C12,25 15,22 20,18 Z" fill="#f0f9ff" />
              <path d="M20,18 C30,10 50,12 65,15 S85,20 90,30 C95,40 85,55 70,60 C60,63 45,68 35,65 S18,50 15,35 C12,25 15,22 20,18 Z" strokeDasharray="1 1" stroke="#38bdf8" />

              {/* Slide */}
              <path d="M20,18 C15,13 18,5 28,6 S38,10 35,14" stroke="#60a5fa" strokeWidth="1" />

              {/* Patio area */}
              <path d="M50,66 C40,70 30,80 32,90 L92,90 L92,55 C85,60 70,62 60,64 C55,65 52,65.5 50,66Z" fill="#f1f5f9" />
              <path d="M50,66 C40,70 30,80 32,90 L92,90 L92,55 C85,60 70,62 60,64 C55,65 52,65.5 50,66Z" strokeDasharray="1 1" stroke="#94a3b8"/>
              
              {/* Lawn area */}
              <path d="M15,35 C18,50 25,65 35,65 C45,68 60,63 70,60 C85,55 95,40 90,30 S65,15 50,18 C30,22 12,25 15,35 Z M32,90 H8 V98 H98 V90 H92 M8,98 V75 C15,85 25,90 32,90" fill="#f0fdf4" />
              <path d="M15,35 C18,50 25,65 35,65" strokeDasharray="1 1" stroke="#4ade80" />
              <path d="M35,65 C45,68 60,63 70,60" strokeDasharray="1 1" stroke="#4ade80" />
              <path d="M70,60 C85,55 95,40 90,30" strokeDasharray="1 1" stroke="#4ade80" />
              <path d="M90,30 S65,15 50,18 C30,22 12,25 15,35" strokeDasharray="1 1" stroke="#4ade80" />
              <path d="M8,75 C15,85 25,90 32,90" strokeDasharray="1 1" stroke="#4ade80"/>
              
              {/* Bottom Structure */}
              <rect x="8" y="75" width="20" height="15" fill="#e2e8f0" />
              <rect x="8" y="75" width="20" height="15" stroke="#94a3b8"/>
            </g>

        </svg>
        
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
    </div>
  );
}

    