
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { BackyardLayout, Plant } from "@/lib/types";

interface TableViewProps {
  layout: BackyardLayout;
  onSelectPlant: (plantId: string | null) => void;
}

export function TableView({ layout, onSelectPlant }: TableViewProps) {
  const allPlants = React.useMemo(() => {
    return Object.values(layout).flatMap(category =>
      category.plants.map(plant => ({
        ...plant,
        categoryName: category.name,
        categoryColor: category.color,
      }))
    );
  }, [layout]);

  return (
    <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">All Plants</h1>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Treatment Date</TableHead>
                    <TableHead>Last Treatment</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {allPlants.length > 0 ? (
                    allPlants.map(plant => {
                    const latestRecord = plant.records[0]; // Records are pre-sorted
                    return (
                        <TableRow key={plant.id} onClick={() => onSelectPlant(plant.id)} className="cursor-pointer">
                            <TableCell className="font-medium">{plant.label}</TableCell>
                            <TableCell>{plant.type}</TableCell>
                            <TableCell>
                                <Badge style={{ backgroundColor: plant.categoryColor, color: '#fff' }}>
                                    {plant.categoryName}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {latestRecord ? format(new Date(latestRecord.date), "PPP") : "N/A"}
                            </TableCell>
                            <TableCell>
                                {latestRecord ? latestRecord.treatment : "N/A"}
                            </TableCell>
                        </TableRow>
                    );
                    })
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        No plants found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
