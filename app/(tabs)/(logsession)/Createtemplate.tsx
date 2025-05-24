import { Exercise, Workout, WorkoutTemplate } from '@/components/types';
import { loadExercises, loadWorkoutTemplates, saveExercises, saveWorkoutTemplates } from '@/localstorage/storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateTemplate() {
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Workout[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);

  useEffect(() => {
    loadAvailableExercises();
  }, []);

  const loadAvailableExercises = async () => {
    try {
      setLoading(true);
      const exercises = await loadExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Helper function to add a single exercise
  const addExercise = async (exerciseName: string) => {
    try {
      const existingExercises = await loadExercises();
      
      // Check if exercise already exists (case-insensitive)
      const exerciseExists = existingExercises.some(
        exercise => exercise.name.toLowerCase() === exerciseName.toLowerCase()
      );
      
      if (exerciseExists) {
        Alert.alert('Error', 'Exercise already exists');
        return;
      }
      
      // Generate new ID
      const newId = generateId();
      
      // Create new exercise
      const newExercise: Exercise = {
        id: newId,
        name: exerciseName.trim(),
      };
      
      // Add to existing exercises
      const updatedExercises = [...existingExercises, newExercise];
      
      // Save updated list
      await saveExercises(updatedExercises);
      
      // Update local state
      setAvailableExercises(updatedExercises);
      setNewExerciseName('');
      setShowAddExerciseForm(false);
      
      Alert.alert('Success', 'New exercise added successfully!');
      console.log('New exercise added:', exerciseName);
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  // Helper function to remove an exercise
  const removeExercise = async (exerciseId: string) => {
    try {
      const existingExercises = await loadExercises();
      
      // Filter out the exercise to remove
      const updatedExercises = existingExercises.filter(
        exercise => exercise.id !== exerciseId
      );
      
      // Save updated list
      await saveExercises(updatedExercises);
      
      // Update local state
      setAvailableExercises(updatedExercises);
      
      Alert.alert('Success', 'Exercise removed successfully!');
      console.log('Exercise removed:', exerciseId);
    } catch (error) {
      console.error('Error removing exercise:', error);
      Alert.alert('Error', 'Failed to remove exercise');
    }
  };

  // Helper function to update an exercise name
  const updateExercise = async (exerciseId: string, newName: string) => {
    try {
      const existingExercises = await loadExercises();
      
      // Check if new name already exists (excluding current exercise)
      const nameExists = existingExercises.some(
        exercise => exercise.id !== exerciseId && 
                   exercise.name.toLowerCase() === newName.toLowerCase()
      );
      
      if (nameExists) {
        Alert.alert('Error', 'Exercise name already exists');
        return;
      }
      
      // Update the exercise
      const updatedExercises = existingExercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, name: newName.trim() }
          : exercise
      );
      
      // Save updated list
      await saveExercises(updatedExercises);
      
      // Update local state
      setAvailableExercises(updatedExercises);
      
      Alert.alert('Success', 'Exercise updated successfully!');
      console.log('Exercise updated:', exerciseId, 'to', newName);
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'Failed to update exercise');
    }
  };

  const addExerciseToTemplate = (exercise: Exercise) => {
    const newWorkout: Workout = {
      id: generateId(),
      exercise: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
    };

    setSelectedExercises(prev => [...prev, newWorkout]);
    setExerciseModalVisible(false);
  };

  const removeExerciseFromTemplate = (workoutId: string) => {
    setSelectedExercises(prev => prev.filter(workout => workout.id !== workoutId));
  };

  const updateWorkout = (workoutId: string, field: keyof Workout, value: number) => {
    setSelectedExercises(prev =>
      prev.map(workout =>
        workout.id === workoutId
          ? { ...workout, [field]: value }
          : workout
      )
    );
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to the template');
      return;
    }

    try {
      setSaving(true);
      
      // Load existing templates
      const existingTemplates = await loadWorkoutTemplates();
      
      // Create new template
      const newTemplate: WorkoutTemplate = {
        id: generateId(),
        name: templateName.trim(),
        exercises: selectedExercises, 
      };

      // Save updated templates
      const updatedTemplates = [...existingTemplates, newTemplate];
      await saveWorkoutTemplates(updatedTemplates);

      Alert.alert(
        'Success',
        'Template created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTemplateName('');
              setSelectedExercises([]);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseListItemContainer}>
      <TouchableOpacity
        style={styles.exerciseListItem}
        onPress={() => addExerciseToTemplate(item)}
      >
        <Text style={styles.exerciseListItemText}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteExerciseButton}
        onPress={() => {
          Alert.alert(
            'Delete Exercise',
            `Are you sure you want to delete "${item.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => removeExercise(item.id) },
            ]
          );
        }}
      >
        <Text style={styles.deleteExerciseButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedExercise = ({ item, index }: { item: Workout; index: number }) => (
    <View style={styles.selectedExerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.exercise}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeExerciseFromTemplate(item.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseInputs}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sets</Text>
          <TextInput
            style={styles.numberInput}
            value={item.sets.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              updateWorkout(item.id, 'sets', num);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={styles.numberInput}
            value={item.reps.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              updateWorkout(item.id, 'reps', num);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (lbs)</Text>
          <TextInput
            style={styles.numberInput}
            value={item.weight.toString()}
            onChangeText={(text) => {
              const num = parseFloat(text) || 0;
              updateWorkout(item.id, 'weight', num);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Workout Template</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Name</Text>
          <TextInput
            style={styles.templateNameInput}
            value={templateName}
            onChangeText={setTemplateName}
            placeholder="Enter template name (e.g., Push Day, Leg Day)"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises ({selectedExercises.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setExerciseModalVisible(true)}
            >
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add Exercise" to get started</Text>
            </View>
          ) : (
            <FlatList
              data={selectedExercises}
              renderItem={renderSelectedExercise}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (saving || !templateName.trim() || selectedExercises.length === 0) && styles.saveButtonDisabled
          ]}
          onPress={saveTemplate}
          disabled={saving || !templateName.trim() || selectedExercises.length === 0}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Template</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={exerciseModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setExerciseModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises..."
              placeholderTextColor="#9ca3af"
            />
          </View>

          {!showAddExerciseForm ? (
            <TouchableOpacity
              style={styles.addNewExerciseButton}
              onPress={() => setShowAddExerciseForm(true)}
            >
              <Text style={styles.addNewExerciseButtonText}>+ Add New Exercise</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addExerciseForm}>
              <TextInput
                style={styles.newExerciseInput}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="Enter exercise name..."
                placeholderTextColor="#9ca3af"
                autoFocus
              />
              <View style={styles.addExerciseButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddExerciseForm(false);
                    setNewExerciseName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !newExerciseName.trim() && styles.confirmButtonDisabled
                  ]}
                  onPress={() => addExercise(newExerciseName)}
                  disabled={!newExerciseName.trim()}
                >
                  <Text style={styles.confirmButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            style={styles.exerciseList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  templateNameInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#212529',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  selectedExerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    fontWeight: '500',
  },
  numberInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#212529',
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  modalPlaceholder: {
    width: 60,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#212529',
  },
  exerciseList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  exerciseListItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  exerciseListItem: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exerciseListItemText: {
    fontSize: 16,
    color: '#212529',
  },
  deleteExerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#dc3545',
    marginRight: 4,
    borderRadius: 4,
  },
  deleteExerciseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addNewExerciseButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNewExerciseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addExerciseForm: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  newExerciseInput: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#212529',
    marginBottom: 12,
  },
  addExerciseButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#28a745',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});