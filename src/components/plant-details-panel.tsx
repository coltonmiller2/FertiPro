
"use client";

import * as React from 'react';
import { X, Trash2, Calendar as CalendarIcon, Edit, Image as ImageIcon } from 'lucide-react';
import { format } from "date-fns"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from 'next/image';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AITreatmentSuggestion } from '@/components/ai-suggestion';


interface PlantDetailsPanelProps {
  plant: Plant | null;
  category: PlantCategory | null;
  onClose: () => void;
  onAddRecord: (plantId: string, record: Omit<PlantRecord, 'id' | 'photoDataUri'>, photoFile?: File) => void;
  onUpdateRecord: (plantId: string, record: PlantRecord, photoFile?: File) => void;
  onDeletePlant: (plantId: string) => void;
  onUpdatePlant: (plantId: string, updates: Partial<Plant>) => void;
}

const recordFormSchema = z.object({
  id: z.number().optional(),
  date: z.date({ required_error: "A date is required." }),
  treatment: z.string().min(1, "Treatment is required."),
  notes: z.string().optional(),
  phLevel: z.string().optional(),
  moistureLevel: z.string().optional(),
  photo: z.any().optional(),
});

const plantTypeFormSchema = z.object({
  type: z.string().min(2, { message: "Plant type must be at least 2 characters." }),
});


const EditPlantTypeModal: React.FC<{
    plant: Plant;
    onUpdatePlant: (plantId: string, updates: Partial<Plant>) => void;
    children: React.ReactNode;
}> = ({ plant, onUpdatePlant, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const form = useForm<z.infer<typeof plantTypeFormSchema>>({
        resolver: zodResolver(plantTypeFormSchema),
        defaultValues: {
            type: plant.type,
        },
    });

    function onSubmit(values: z.infer<typeof plantTypeFormSchema>) {
        onUpdatePlant(plant.id, { type: values.type });
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Plant Type</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plant Type</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

const EditRecordModal: React.FC<{
    record: PlantRecord;
    plantId: string;
    onUpdateRecord: (plantId: string, record: PlantRecord, photoFile?: File) => void;
    children: React.ReactNode;
}> = ({ record, plantId, onUpdateRecord, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const form = useForm<z.infer<typeof recordFormSchema>>({
        resolver: zodResolver(recordFormSchema),
        defaultValues: {
            ...record,
            date: new Date(record.date),
        },
    });
    
    React.useEffect(() => {
        form.reset({
            ...record,
            date: new Date(record.date)
        });
    }, [record, form]);

    const photoRef = form.register("photo");

    async function onSubmit(values: z.infer<typeof recordFormSchema>) {
        const photoFile = values.photo?.[0];
        const updatedRecord = {
            ...record,
            ...values,
            date: format(values.date, "yyyy-MM-dd"),
        };
        onUpdateRecord(plantId, updatedRecord, photoFile);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Record</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Form fields are the same as the main form, pre-filled */}
                        <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="treatment" render={({ field }) => ( <FormItem><FormLabel>Treatment</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="e.g., 4 TBSP" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="phLevel" render={({ field }) => ( <FormItem><FormLabel>pH Level</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="moistureLevel" render={({ field }) => ( <FormItem><FormLabel>Moisture %</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        </div>
                         <FormField control={form.control} name="photo" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Photo</FormLabel>
                                <FormControl><Input type="file" accept="image/*" {...photoRef} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};


export function PlantDetailsPanel({ plant, category, onClose, onAddRecord, onUpdateRecord, onDeletePlant, onUpdatePlant }: PlantDetailsPanelProps) {
  
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
    if (!plant) return;
    const photoFile = values.photo?.[0];

    onAddRecord(plant.id, {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    }, photoFile);

    form.reset({
        date: new Date(),
        treatment: "",
        notes: "",
        phLevel: "",
        moistureLevel: "",
        photo: null
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
            <div className="flex items-center gap-2">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {plant.type} ({plant.label})
                        <EditPlantTypeModal plant={plant} onUpdatePlant={onUpdatePlant}>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </EditPlantTypeModal>
                    </h2>
                    <p className="text-sm" style={{ color: category.color }}>{category.name}</p>
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
                                <FormLabel>Attach Photo</FormLabel>
                                <FormControl><Input type="file" accept="image/*" {...photoRef} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
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
                    plant.records.map((record) => (
                      <Card key={record.id} className="text-sm">
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p><strong>Date:</strong> {format(new Date(record.date), "PPP")}</p>
                                    <p><strong>Treatment:</strong> {record.treatment}</p>
                                    {record.notes && <p className="whitespace-pre-wrap"><strong>Notes:</strong> {record.notes}</p>}
                                    {(record.phLevel || record.moistureLevel) && <Separator className="my-2" />}
                                    {record.phLevel && <p><strong>pH:</strong> {record.phLevel}</p>}
                                    {record.moistureLevel && <p><strong>Moisture:</strong> {record.moistureLevel}%</p>}
                                </div>
                                 <EditRecordModal record={record} plantId={plant.id} onUpdateRecord={onUpdateRecord}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </EditRecordModal>
                            </div>
                            {record.photoDataUri && (
                                <div className="mt-2">
                                    <Image src={record.photoDataUri} alt={`Record photo for ${record.date}`} width={80} height={80} className="rounded-md object-cover" />
                                </div>
                            )}
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
