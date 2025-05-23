import { CurrentMeasurement, MeasurementEntry, WeightEntry, WorkoutSession, WorkoutTemplate } from '@/components/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  WORKOUT_TEMPLATES: 'workout_templates',
  WEIGHT_HISTORY: 'weight_history',
  MEASUREMENTS_HISTORY: 'measurements_history',
  WORKOUT_SESSIONS: 'workout_sessions',
  CURRENT_MEASUREMENTS: 'current_measurements', 
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
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.WORKOUT_TEMPLATES,
      STORAGE_KEYS.WEIGHT_HISTORY,
      STORAGE_KEYS.WORKOUT_SESSIONS,
    ]);
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
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