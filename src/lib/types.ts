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
}

export interface PlantCategory {
  name: string;
  color: string;
  plants: Plant[];
}

export interface BackyardLayout {
  [key:string]: PlantCategory;
}
