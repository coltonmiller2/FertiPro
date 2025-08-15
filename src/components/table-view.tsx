
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { BackyardLayout, Plant } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TableViewProps {
  layout: Omit<BackyardLayout, 'version'>;
  onSelectPlant: (plantId: string | null) => void;
}

type PlantRow = Plant & { categoryName: string; categoryColor: string };

const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(`${dateString}T00:00:00`), "PPP");
}

export const columns: ColumnDef<PlantRow>[] = [
    {
        accessorKey: "label",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Label
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: info => <div className="pl-4">{info.getValue<string>()}</div>
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
         cell: info => <div className="pl-4">{info.getValue<string>()}</div>
    },
    {
        accessorKey: "categoryName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="pl-4">
                <Badge style={{ backgroundColor: row.original.categoryColor, color: '#fff' }}>
                    {row.original.categoryName}
                </Badge>
            </div>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "lastTreatmentDate",
        accessorFn: row => (row.records.length > 0 ? row.records[0].date : null),
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Last Treatment Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: info => <div className="pl-4">{formatDisplayDate(info.getValue() as string)}</div>,
    },
    {
        id: "lastTreatment",
        accessorFn: row => (row.records.length > 0 ? row.records[0].treatment : "N/A"),
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Last Treatment
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: info => <div className="pl-4">{info.getValue<string>()}</div>
    },
    {
        accessorKey: "nextScheduledFertilizationDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Next Fertilization
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: info => <div className="pl-4">{formatDisplayDate(info.getValue() as string)}</div>,
    },
];

export function TableView({ layout, onSelectPlant }: TableViewProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const allPlants = React.useMemo(() => {
    return Object.values(layout).flatMap(category =>
      category.plants.map(plant => ({
        ...plant,
        categoryName: category.name,
        categoryColor: category.color,
      }))
    );
  }, [layout]);

  const table = useReactTable({
    data: allPlants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">All Plants</h1>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                             {header.column.getCanFilter() ? (
                                <div>
                                    <Filter column={header.column} />
                                </div>
                                ) : null}
                        </TableHead>
                    ))}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                        <TableRow
                            key={row.id}
                            onClick={() => onSelectPlant(row.original.id)}
                            className="cursor-pointer"
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}

function Filter({ column }: { column: any }) {
    const columnFilterValue = column.getFilterValue()

    return (
        <Input
          type="text"
          value={(columnFilterValue ?? '') as string}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={`Search...`}
          className="w-full mt-1 h-8"
        />
    )
}
