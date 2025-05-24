import { Workout, WorkoutSession } from '@/components/types';
import { loadWorkoutTemplates, saveWorkoutSession } from '@/localstorage/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActiveSession() {
  const { templateId, templateName } = useLocalSearchParams<{ templateId: string; templateName: string }>();
  const router = useRouter();

  const [exercises, setExercises] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

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
    router.replace('/(tabs)/History');
    };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#666" />
        <Text>Loading session...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{templateName} Session</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.exerciseName}>{item.exercise}</Text>
            <View style={styles.row}>

                <Text>Sets: </Text>
                <TextInput
                  editable={isRunning}
                  style={styles.input}
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
                <Text>Reps: </Text>
                <TextInput
                  editable={isRunning}
                  style={styles.input}
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
                    <Text>Weight (kg): </Text>
                    <TextInput
                      editable={isRunning}
                      style={styles.input}
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
        ListEmptyComponent={<Text>No exercises found in this template.</Text>}
      />

      {isRunning && (
        <Text style={styles.timerText}>
          Elapsed Time: {formatTime(elapsedTime)}
        </Text>
      )}

      {!isRunning && !startTime ? (
        <Button title="Start Workout" onPress={handleStartSession} />
      ) : (
        <Button title="End & Save Session" onPress={handleEndSession} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 10,
        marginVertical: 8,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
    },
    timerText: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    marginLeft: 8,
    width: 60,
    borderRadius: 4,
    textAlign: 'center',
    },

    row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    },
});
