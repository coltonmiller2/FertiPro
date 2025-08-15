
"use client";

import * as React from 'react';
import { X, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Plant, PlantCategory, Record as PlantRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AITreatmentSuggestion } from '@/components/ai-suggestion';


interface PlantDetailsPanelProps {
  plant: Plant | null;
  category: PlantCategory | null;
  onClose: () => void;
  onUpdatePlant: (plantId: string, record: Omit<PlantRecord, 'id'>) => void;
  onDeletePlant: (plantId: string) => void;
}

const recordFormSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  treatment: z.string().min(1, "Treatment is required."),
  notes: z.string().optional(),
  phLevel: z.string().optional(),
  moistureLevel: z.string().optional(),
});

export function PlantDetailsPanel({ plant, category, onClose, onUpdatePlant, onDeletePlant }: PlantDetailsPanelProps) {
  
  const form = useForm<z.infer<typeof recordFormSchema>>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      date: new Date(),
      treatment: "",
      notes: "",
      phLevel: "",
      moistureLevel: "",
    },
  });

  function onSubmit(values: z.infer<typeof recordFormSchema>) {
    if (!plant) return;
    onUpdatePlant(plant.id, {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    });
    form.reset({
        date: new Date(),
        treatment: "",
        notes: "",
        phLevel: "",
        moistureLevel: "",
    });
  }

  const panelOpen = !!plant;

  // Reset form when plant changes
  React.useEffect(() => {
    form.reset({
      date: new Date(),
      treatment: "",
      notes: "",
      phLevel: "",
      moistureLevel: "",
    });
  }, [plant, form]);

  return (
    <div
      className={cn(
        "absolute top-0 right-0 h-full w-full max-w-sm bg-background/95 backdrop-blur-sm border-l border-border shadow-lg transition-transform duration-300 ease-in-out z-20",
        panelOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {plant && category && (
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">{plant.type} ({plant.label})</h2>
              <p className="text-sm" style={{ color: category.color }}>{category.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">New Record / Soil Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="treatment" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Treatment</FormLabel>
                            <FormControl><Input placeholder="e.g., Palm Gain 8-2-12" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField control={form.control} name="notes" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl><Input placeholder="e.g., 4 TBSP" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                         <FormField control={form.control} name="phLevel" render={({ field }) => (
                            <FormItem>
                              <FormLabel>pH Level</FormLabel>
                              <FormControl><Input placeholder="e.g., 6.8" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField control={form.control} name="moistureLevel" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moisture %</FormLabel>
                              <FormControl><Input placeholder="e.g., 55" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full">Add Record</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <AITreatmentSuggestion plant={plant} />

              <div>
                <h3 className="text-base font-semibold mb-2">History</h3>
                <div className="space-y-3">
                  {plant.records.length > 0 ? (
                    plant.records.map((record, index) => (
                      <Card key={record.id} className="text-sm">
                        <CardContent className="pt-4">
                          <p><strong>Date:</strong> {format(new Date(record.date), "PPP")}</p>
                          <p><strong>Treatment:</strong> {record.treatment}</p>
                          {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                          {(record.phLevel || record.moistureLevel) && <Separator className="my-2" />}
                          {record.phLevel && <p><strong>pH:</strong> {record.phLevel}</p>}
                          {record.moistureLevel && <p><strong>Moisture:</strong> {record.moistureLevel}%</p>}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No records found.</p>
                  )}
                </div>
              </div>

            </div>
          </ScrollArea>
          
          <footer className="p-4 border-t mt-auto bg-background">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Plant
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove this plant and all its records. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeletePlant(plant.id)}>
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </footer>
        </div>
      )}
    </div>
  );
}
