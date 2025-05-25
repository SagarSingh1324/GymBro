import { Workout, WorkoutSession } from '@/components/types';
import { loadWorkoutTemplates, saveWorkoutSession } from '@/localstorage/storage';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActiveSession() {
  const { templateId, templateName } = useLocalSearchParams<{ templateId: string; templateName: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const [exercises, setExercises] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const styles = createStyles(theme);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const templates = await loadWorkoutTemplates();
        const selectedTemplate = templates.find(t => t.id === templateId);

        if (selectedTemplate) {
          setExercises(selectedTemplate.exercises);
        } else {
          Alert.alert('Error', 'Workout template not found.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load workout template.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    if (isRunning && startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const handleStartSession = () => {
    setStartTime(Date.now());
    setIsRunning(true);
    setElapsedTime(0);
    Alert.alert('Workout Started', 'Session timer is running.');
  };

  const handleEndSession = async () => {
    if (!startTime) {
      Alert.alert('Error', 'Start the session first.');
      return;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);

    const durationInMilliseconds = elapsedTime;

    const session: WorkoutSession = {
      id: `${templateId}-${Date.now()}`,
      name: templateName,
      date: new Date().toISOString(), 
      duration: durationInMilliseconds,
      exercises: exercises,
    };

    await saveWorkoutSession(session);
    Alert.alert('Workout Saved', `Duration: ${formatTime(durationInMilliseconds)}`);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading session...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{templateName} Session</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
            <Text style={[styles.exerciseName, { color: theme.text }]}>{item.exercise}</Text>
            
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text }]}>Sets: </Text>
              <TextInput
                editable={isRunning}
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                keyboardType="number-pad"
                value={String(item.sets)}
                onChangeText={(text) => {
                  const updated = exercises.map((ex) =>
                    ex.id === item.id ? { ...ex, sets: Number(text) || 0 } : ex
                  );
                  setExercises(updated);
                }}
              />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text }]}>Reps: </Text>
              <TextInput
                editable={isRunning}
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                keyboardType="number-pad"
                value={String(item.reps)}
                onChangeText={(text) => {
                  const updated = exercises.map((ex) =>
                    ex.id === item.id ? { ...ex, reps: Number(text) || 0 } : ex
                  );
                  setExercises(updated);
                }}
              />
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text }]}>Weight (kg): </Text>
              <TextInput
                editable={isRunning}
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                keyboardType="decimal-pad"
                value={String(item.weight)}
                onChangeText={(text) => {
                  const updated = exercises.map((ex) =>
                    ex.id === item.id ? { ...ex, weight: parseFloat(text) || 0 } : ex
                  );
                  setExercises(updated);
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No exercises found in this template.
            </Text>
          </View>
        }
      />

      {isRunning && (
        <View style={[styles.timerContainer, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
          <Text style={[styles.timerText, { color: theme.primary }]}>
            Elapsed Time: {formatTime(elapsedTime)}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isRunning && !startTime ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton, { backgroundColor: theme.primary }]}
            onPress={handleStartSession}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Start Workout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.endButton, { backgroundColor: theme.primary }]}
            onPress={handleEndSession}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>End & Save Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    minWidth: 100,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginLeft: 8,
    width: 80,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  timerContainer: {
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingVertical: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    // Additional styling for start button if needed
  },
  endButton: {
    // Additional styling for end button if needed
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
