import { WorkoutTemplate } from '@/components/types';
import { loadWorkoutTemplates, saveWorkoutTemplates } from '@/localstorage/storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simple FAB component 
interface FABProps {
  style?: any;
  icon?: string;
  label: string;
  onPress: () => void;
}

const FAB: React.FC<FABProps> = ({ style, icon, label, onPress }) => (
  <TouchableOpacity style={[styles.fabButton, style]} onPress={onPress}>
    <Text style={styles.fabText}>{label}</Text>
  </TouchableOpacity>
);

export default function Logsession() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplatesFromStorage();
  }, []);

  const loadTemplatesFromStorage = async () => {
    try {
      setLoading(true);
      const savedTemplates = await loadWorkoutTemplates();
      
      // If no saved templates, use default ones
      if (savedTemplates.length === 0) {
        const defaultTemplates: WorkoutTemplate[] = [
          {
            id: '1',
            name: 'Full Body Workout',
            exercises: [
              { id: '1', name: 'Squats', defaultSets: 3, defaultReps: 12, restTime: 60 },
              { id: '2', name: 'Push-ups', defaultSets: 3, defaultReps: 15, restTime: 45 },
            ],
            lastUsed: '2023-05-20',
          },
          {
            id: '2',
            name: 'Push Day',
            exercises: [
              { id: '3', name: 'Bench Press', defaultSets: 4, defaultReps: 8, restTime: 90 },
              { id: '4', name: 'Shoulder Press', defaultSets: 3, defaultReps: 10, restTime: 60 },
            ],
            lastUsed: '2023-05-18',
          },
        ];
        await saveWorkoutTemplates(defaultTemplates);
        setTemplates(defaultTemplates);
      } else {
        setTemplates(savedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToActiveSession = async (template: WorkoutTemplate) => {
    // Update last used date
    const updatedTemplate = {
      ...template,
      lastUsed: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    // Update templates array
    const updatedTemplates = templates.map(t => 
      t.id === template.id ? updatedTemplate : t
    );
    
    // Save to storage
    await saveWorkoutTemplates(updatedTemplates);
    setTemplates(updatedTemplates);

    router.push({
      pathname: '/(tabs)/(logsession)/Activesession',
      params: { template: JSON.stringify(updatedTemplate) },
    });
  };

  const navigateToTemplateCreator = () => {
    router.push('/(tabs)/(logsession)/Createtemplate');
  };

  const refreshTemplates = () => {
    loadTemplatesFromStorage();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading templates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Start New Session</Text>
          <TouchableOpacity onPress={refreshTemplates} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>
        
        {/* Saved Templates Section */}
        <Text style={styles.sectionTitle}>Your Templates</Text>
        {templates.length > 0 ? (
          <FlatList
            horizontal
            data={templates}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.templateCard}
                onPress={() => navigateToActiveSession(item)}
              >
                <Text style={styles.templateName}>{item.name}</Text>
                <Text style={styles.templateDetail}>
                  {item.exercises.length} {item.exercises.length === 1 ? 'exercise' : 'exercises'}
                </Text>
                <Text style={styles.templateDetail}>
                  Last used: {item.lastUsed}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No templates yet</Text>
        )}

        {/* Quick Start Option */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <TouchableOpacity 
          style={styles.quickStartCard}
          onPress={() => navigateToActiveSession({
            id: 'quick-' + Date.now(),
            name: 'Custom Session',
            exercises: [],
            lastUsed: new Date().toISOString().split('T')[0],
          })}
        >
          <Text style={styles.quickStartTitle}>Blank Session</Text>
          <Text style={styles.quickStartSubtitle}>Add exercises as you go</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create Template Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Create New Template"
        onPress={navigateToTemplateCreator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
    color: '#3f51b5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  templateList: {
    paddingBottom: 8,
  },
  templateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickStartCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3f51b5',
  },
  fabButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});