
"use client";

import * as React from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Plant, Record as PlantRecord } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from './ui/badge';


interface BulkUpdatePanelProps {
  selectedPlants: Plant[];
  onClose: () => void;
  onBulkAddRecord: (plantIds: string[], record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => void;
}

const recordFormSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  treatment: z.string().min(1, "Treatment is required."),
  notes: z.string().optional(),
  phLevel: z.string().optional(),
  moistureLevel: z.string().optional(),
  photo: z.any().optional(),
});


export function BulkUpdatePanel({ selectedPlants, onClose, onBulkAddRecord }: BulkUpdatePanelProps) {
  
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

  const photoRef = form.register("photo");

  async function onSubmit(values: z.infer<typeof recordFormSchema>) {
    const photoFile = values.photo?.[0];
    const plantIds = selectedPlants.map(p => p.id);
    
    const recordData = {
      date: format(values.date, 'yyyy-MM-dd'),
      treatment: values.treatment,
      notes: values.notes ?? '',
      phLevel: values.phLevel ?? '',
      moistureLevel: values.moistureLevel ?? '',
    };
    
    onBulkAddRecord(plantIds, recordData, photoFile);

    form.reset({
        date: new Date(),
        treatment: "",
        notes: "",
        phLevel: "",
        moistureLevel: "",
        photo: undefined
    });
    const photoInput = document.querySelector('input[name="photo"]') as HTMLInputElement | null;
    if (photoInput) {
        photoInput.value = '';
    }
  }

  React.useEffect(() => {
    form.reset({
      date: new Date(),
      treatment: "",
      notes: "",
      phLevel: "",
      moistureLevel: "",
    });
  }, [form, selectedPlants]);

  return (
    <div
      className="flex flex-col h-full w-full bg-background border-l border-border shadow-lg z-20"
    >
      {selectedPlants.length > 0 && (
        <>
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <div>
                    <h2 className="text-lg font-semibold">
                        Bulk Update
                    </h2>
                    <p className="text-sm text-muted-foreground">{selectedPlants.length} plants selected</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Selected Plants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                        {selectedPlants.map(p => (
                            <Badge key={p.id} variant="secondary">{p.type} ({p.label})</Badge>
                        ))}
                        </div>
                    </CardContent>
                </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Record to All Selected Plants</CardTitle>
                  <CardDescription>This record will be added to all {selectedPlants.length} selected plants.</CardDescription>
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
                            <FormControl><Textarea placeholder="e.g., 4 TBSP" {...field} /></FormControl>
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
                       <FormField control={form.control} name="photo" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attach Photo (Optional)</FormLabel>
                                <FormControl><Input type="file" accept="image/*" {...photoRef} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                      <Button type="submit" className="w-full">Add Record to {selectedPlants.length} Plants</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

    