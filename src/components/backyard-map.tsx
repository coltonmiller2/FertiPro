
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
         className="relative w-full h-full max-w-[1000px] max-h-[1000px] aspect-square rounded-lg shadow-lg border-2 border-border overflow-hidden bg-gray-50"
        >
        {/* Background SVG */}
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
            {/* Grass */}
            <path d="M0,10 C20,0 40,0 100,20 V100 H0 Z" fill="#E2F0D9" />
            <path d="M0,10 Q5,5 10,10 T20,10 T30,10 T40,10 T50,10 T60,10 T70,10 T80,10 T90,10 T100,20" stroke="#C8E6C9" fill="none" strokeWidth="0.5" />


            {/* Patio */}
            <path d="M0,90 C10,95 20,100 40,100 H0 Z" fill="#F5EFE6" />
            <path d="M0,10 C20,0,40,0,100,20 L0,90 C10,95,20,100,40,100 H0 Z" stroke="#E0E0E0" fill="none" strokeWidth="0.2" />
            <path d="M0,50 L50,100" stroke="#E0E0E0" fill="none" strokeWidth="0.2" />
            <path d="M0,70 L30,100" stroke="#E0E0E0" fill="none" strokeWidth="0.2" />
            <path d="M20,100 L60,60" stroke="#E0E0E0" fill="none" strokeWidth="0.2" />
            
            {/* Pool */}
            <rect x="55" y="30" width="35" height="45" rx="5" ry="5" fill="#D6EAF8" stroke="#AED6F1" strokeWidth="0.5"/>
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
