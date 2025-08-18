"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BackyardLayout } from '@/lib/types';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlant: (categoryKey: string, plantType: string) => void;
  layout: Omit<BackyardLayout, 'version'>;
}

const formSchema = z.object({
  category: z.string({
    required_error: 'Please select a category.',
  }),
  plantType: z.string().min(2, {
    message: 'Plant type must be at least 2 characters.',
  }),
});

export function AddPlantModal({ isOpen, onClose, onAddPlant, layout }: AddPlantModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantType: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddPlant(values.category, values.plantType);
    onClose();
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Plant</DialogTitle>
          <DialogDescription>
            Choose a category and name for your new plant. You can position it on the map after adding it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plant category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* --- THIS IS THE CORRECTED SECTION --- */}
                      {Object.entries(layout).map(([key, category]) => {
                        // Check if category is an object and has a name property
                        if (typeof category === 'object' && category && 'name' in category) {
                          return (
                            <SelectItem key={key} value={key}>
                              {(category as any).name}
                            </SelectItem>
                          );
                        }
                        // Return null for items that aren't valid categories to prevent rendering them
                        return null;
                      })}
                      {/* --- END OF CORRECTION --- */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plantType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Queen Palm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit">Add Plant</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}