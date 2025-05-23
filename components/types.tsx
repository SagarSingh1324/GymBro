// types.ts - Shared type definitions

export interface Exercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  restTime: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  lastUsed: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  templateId: string;
  date: string;
  duration: number; // in minutes
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface MeasurementEntry {
    id: string;
    date: string;
    measurements: {
        part: string;
        measure: string;
    }[];
}

export interface CurrentMeasurement {
    part: string;
    measure: string;
}