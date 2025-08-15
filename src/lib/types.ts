
export interface Record {
  id: number;
  date: string;
  treatment: string;
  notes: string;
  phLevel: string;
  moistureLevel: string;
  photoDataUri?: string;
}

export interface Plant {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  records: Record[];
  nextScheduledFertilizationDate?: string;
  trunkDiameter?: string;
}

export interface PlantCategory {
  name: string;
  color: string;
  plants: Plant[];
}

export interface BackyardLayout {
  version?: number;
  [key:string]: PlantCategory | number | undefined;
}
