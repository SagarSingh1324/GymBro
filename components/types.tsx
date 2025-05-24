// types.ts - Shared type definitions

// Workout related types

export interface Exercise {
  id: string;
  name: string;
}

export interface Workout {
  id: string,
  exercise: string,
  sets: number,
  reps: number;
  weight: number;
}

export interface WorkoutTemplate {
  id: string,
  name: string,
  exercises: Workout[],
}

export interface WorkoutSession {
  id: string;
  name: string,
  date: string;
  duration: number; 
  exercises: Workout[];
}

// Weight realted types
export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

// Measurements realted types
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