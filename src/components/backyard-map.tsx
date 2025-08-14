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
          <pattern id="grass-texture" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeOpacity="0.3" />
          </pattern>
          <pattern id="patio-texture" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
            <rect width="2.5" height="5" fill="hsl(var(--muted))"/>
            <rect x="2.5" y="2.5" width="2.5" height="2.5" fill="hsl(var(--muted))"/>
          </pattern>
          <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
            <feOffset in="blur" dx="0.5" dy="0.5" result="offsetBlur"/>
            <feMerge>
              <feMergeNode in="offsetBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="hsl(var(--card))" />

        {/* Lawn Area */}
        <rect x="0" y="0" width="100" height="100" fill="url(#grass-texture)" />

        {/* Patio Area */}
        <path 
          d="M0,100 L0,50 C0,40 10,40 20,40 L80,40 C90,40 100,50 100,60 L100,100 Z"
          fill="url(#patio-texture)"
          stroke="hsl(var(--border))"
          strokeWidth="0.3"
        />

        {/* Pool */}
        <path
          d="M20,15 C10,15 10,25 20,25 L80,25 C90,25 90,15 80,15 Z"
          transform="rotate(10 50 20)"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="0.3"
          filter="url(#dropshadow)"
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
