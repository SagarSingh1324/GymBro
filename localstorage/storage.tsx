import { CurrentMeasurement, Exercise, MeasurementEntry, WeightEntry, WorkoutSession, WorkoutTemplate } from '@/components/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  // Exercises list
  EXERCISES: 'exercises_list',
  // Weight logging
  WEIGHT_HISTORY: 'weight_history',
  // Measurements
  MEASUREMENTS_HISTORY: 'measurements_history',
  CURRENT_MEASUREMENTS: 'current_measurements', 
  // Workouts sessions
  WORKOUT_TEMPLATES: 'workout_templates',
  WORKOUT_SESSIONS: 'workout_sessions',
};

// Function to save exercises
export const saveExercises = async (exercises: Exercise[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(exercises);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, jsonValue);
    console.log('Exercises saved successfully');
  } catch (error) {
    console.error('Error saving exercises:', error);
    throw new Error('Failed to save exercises');
  }
};

// Function to load saved exercises
export const loadExercises = async (): Promise<Exercise[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
    
    if (jsonValue !== null) {
      const exercises = JSON.parse(jsonValue) as Exercise[];
      console.log('Exercises loaded successfully:', exercises.length, 'exercises found');
      return exercises;
    } else {
      // Return default exercises if none exist
      console.log('No exercises found in storage, returning default exercises');
      return getDefaultExercises();
    }
  } catch (error) {
    console.error('Error loading exercises:', error);
    // Return default exercises if there's an error
    console.log('Error occurred, returning default exercises');
    return getDefaultExercises();
  }
};

// Workout Templates Storage
export const saveWorkoutTemplates = async (templates: WorkoutTemplate[]) => {
  try {
    const jsonValue = JSON.stringify(templates);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, jsonValue);
    console.log('Templates saved successfully');
  } catch (error) {
    console.error('Error saving templates:', error);
  }
};

export const loadWorkoutTemplates = async (): Promise<WorkoutTemplate[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_TEMPLATES);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

// workout sessions history storage
export const saveWorkoutSession = async (session: WorkoutSession) => {
  try {
    const existingSessions = await loadWorkoutSessions();
    const updatedSessions = [...existingSessions, session];
    const jsonValue = JSON.stringify(updatedSessions);
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, jsonValue);
    console.log('Workout session saved successfully');
  } catch (error) {
    console.error('Error saving workout session:', error);
  }
};

export const loadWorkoutSessions = async (): Promise<WorkoutSession[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading workout sessions:', error);
    return [];
  }
};

export const clearWorkoutSessions = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify([]));
    console.log('All workout sessions cleared');
  } catch (error) {
    console.error('Error clearing workout sessions:', error);
  }
};

// Weight history storage functions
export const saveWeightHistory = async (weightHistory: WeightEntry[]) => {
  try {
    const jsonValue = JSON.stringify(weightHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_HISTORY, jsonValue);
  } catch (error) {
    console.error('Error saving weight history:', error);
  }
};

export const loadWeightHistory = async (): Promise<WeightEntry[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_HISTORY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading weight history:', error);
    return [];
  }
};

export const addWeightEntry = async (newEntry: WeightEntry) => {
  try {
    const existingHistory = await loadWeightHistory();
    const updatedHistory = [...existingHistory, newEntry];
    await saveWeightHistory(updatedHistory);
  } catch (error) {
    console.error('Error adding weight entry:', error);
  }
};

// Measurements history storagte functions
export const saveMeasurementsHistory = async (history: MeasurementEntry[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENTS_HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving measurements history:', error);
    }
};

export const loadMeasurementsHistory = async (): Promise<MeasurementEntry[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.MEASUREMENTS_HISTORY);
        return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error loading measurements history:', error);
        return [];
    }
};

export const saveCurrentMeasurements = async (measurements: CurrentMeasurement[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_MEASUREMENTS, JSON.stringify(measurements));
    } catch (error) {
        console.error('Error saving current measurements:', error);
    }
};

export const loadCurrentMeasurements = async (): Promise<CurrentMeasurement[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_MEASUREMENTS);
        return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error loading current measurements:', error);
        return [];
    }
};

// Clear all data (useful for debugging or user logout)
  export const clearAllData = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.WORKOUT_TEMPLATES, JSON.stringify([])],
        [STORAGE_KEYS.WEIGHT_HISTORY, JSON.stringify([])],
        [STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify([])],
        [STORAGE_KEYS.EXERCISES, JSON.stringify(getDefaultExercises())],
        [STORAGE_KEYS.MEASUREMENTS_HISTORY, JSON.stringify([])],
        [STORAGE_KEYS.CURRENT_MEASUREMENTS, JSON.stringify([])],
      ]);
      console.log('Data reset to initial empty values');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

// Get storage info (useful for debugging)
export const getStorageInfo = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All stored keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, value ? JSON.parse(value).length : 'null');
    }
  } catch (error) {
    console.error('Error getting storage info:', error);
  }
};

// Helper function to provide default exercises if none exist
const getDefaultExercises = (): Exercise[] => {
  return [
    // Chest Exercises
    { id: '1', name: 'Bench Press' },
    { id: '2', name: 'Incline Bench Press' },
    { id: '3', name: 'Decline Bench Press' },
    { id: '4', name: 'Dumbbell Press' },
    { id: '5', name: 'Incline Dumbbell Press' },
    { id: '6', name: 'Dumbbell Flyes' },
    { id: '7', name: 'Push-ups' },
    { id: '8', name: 'Chest Dips' },
    
    // Back Exercises
    { id: '9', name: 'Pull-ups' },
    { id: '10', name: 'Chin-ups' },
    { id: '11', name: 'Lat Pulldown' },
    { id: '12', name: 'Seated Cable Row' },
    { id: '13', name: 'Barbell Row' },
    { id: '14', name: 'Dumbbell Row' },
    { id: '15', name: 'T-Bar Row' },
    { id: '16', name: 'Deadlift' },
    
    // Shoulder Exercises
    { id: '17', name: 'Overhead Press' },
    { id: '18', name: 'Dumbbell Shoulder Press' },
    { id: '19', name: 'Lateral Raises' },
    { id: '20', name: 'Front Raises' },
    { id: '21', name: 'Rear Delt Flyes' },
    { id: '22', name: 'Arnold Press' },
    { id: '23', name: 'Upright Row' },
    { id: '24', name: 'Shrugs' },
    
    // Arm Exercises
    { id: '25', name: 'Bicep Curls' },
    { id: '26', name: 'Hammer Curls' },
    { id: '27', name: 'Preacher Curls' },
    { id: '28', name: 'Tricep Dips' },
    { id: '29', name: 'Tricep Pushdown' },
    { id: '30', name: 'Overhead Tricep Extension' },
    { id: '31', name: 'Close Grip Bench Press' },
    { id: '32', name: 'Cable Curls' },
    
    // Leg Exercises
    { id: '33', name: 'Squats' },
    { id: '34', name: 'Front Squats' },
    { id: '35', name: 'Leg Press' },
    { id: '36', name: 'Lunges' },
    { id: '37', name: 'Romanian Deadlift' },
    { id: '38', name: 'Leg Curls' },
    { id: '39', name: 'Leg Extensions' },
    { id: '40', name: 'Calf Raises' },
    { id: '41', name: 'Bulgarian Split Squats' },
    { id: '42', name: 'Hip Thrusts' },
    
    // Core Exercises
    { id: '43', name: 'Plank' },
    { id: '44', name: 'Crunches' },
    { id: '45', name: 'Russian Twists' },
    { id: '46', name: 'Mountain Climbers' },
    { id: '47', name: 'Bicycle Crunches' },
    { id: '48', name: 'Dead Bug' },
    { id: '49', name: 'Hanging Leg Raises' },
    { id: '50', name: 'Ab Wheel Rollout' },
  ];
};