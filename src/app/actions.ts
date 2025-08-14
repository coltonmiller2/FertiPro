"use server";

import { suggestTreatmentPlan, SuggestTreatmentPlanInput } from "@/ai/flows/suggest-treatment-plan";

export async function getAiSuggestion(input: SuggestTreatmentPlanInput) {
  try {
    const result = await suggestTreatmentPlan(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to get AI suggestion: ${errorMessage}` };
  }
}
