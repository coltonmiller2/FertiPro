"use client";

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getAiSuggestion } from '@/app/actions';
import type { Plant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AITreatmentSuggestionProps {
  plant: Plant;
}

export function AITreatmentSuggestion({ plant }: AITreatmentSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);

    const latestRecord = plant.records.length > 0 ? plant.records[0] : null;

    if (!latestRecord || (!latestRecord.phLevel && !latestRecord.moistureLevel)) {
      toast({
        variant: "destructive",
        title: "Missing Data",
        description: "Please add a record with pH or moisture level to get an AI suggestion.",
      });
      setLoading(false);
      return;
    }

    const input = {
      plantType: plant.type,
      phLevel: latestRecord.phLevel || 'Not provided',
      moistureLevel: latestRecord.moistureLevel || 'Not provided',
      treatment: latestRecord.treatment,
    };

    const result = await getAiSuggestion(input);

    if (result.success && result.data) {
      setSuggestion(result.data.suggestedTreatmentPlan);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Failed to get AI suggestion.",
      });
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Wand2 className="text-accent h-5 w-5" />
          <span>AI Treatment Suggestion</span>
        </CardTitle>
        <CardDescription>
            Get a treatment plan suggestion based on the latest record.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGetSuggestion} disabled={loading} className="w-full">
          {loading ? 'Generating...' : 'Get Suggestion'}
        </Button>
        
        {loading && (
            <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}

        {suggestion && (
          <Alert className="mt-4">
            <AlertTitle className="font-bold">Suggested Plan</AlertTitle>
            <AlertDescription className="prose prose-sm text-foreground">
              {suggestion}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
