import { WorkoutTemplate } from '@/components/types';
import FAB from '@/components/ui/fab';
import { loadWorkoutTemplates, saveWorkoutTemplates } from '@/localstorage/storage';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Logsession() {
  const isFocused = useIsFocused();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // refresh templates everytime screen is in focus
  useEffect(() => {
    if (isFocused) { 
      fetchTemplates();
    }
  }, [isFocused]); 

  const fetchTemplates = async () => {
    const loaded = await loadTemplates(); 
    loadTemplates(); 
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const loadedTemplates = await loadWorkoutTemplates();
      // Ensure we always have an array
      setTemplates(Array.isArray(loadedTemplates) ? loadedTemplates : []);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to active session with selected template
  const navigateToActiveSession = (template: WorkoutTemplate) => {
    router.push({
      pathname: '/(tabs)/(logsession)/Activesession',
      params: { 
        templateId: template.id,
        templateName: template.name 
      }
    });
  };

  // Navigate to create template screen
  const navigateToTemplateCreator = () => {
    router.push('/(tabs)/(logsession)/Createtemplate');
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

  // Function to delete any particular template
  const handleDeleteTemplate = (templateId: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(updatedTemplates);
            await saveWorkoutTemplates(updatedTemplates);
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
        await loadTemplates();
    } catch (error) {
        console.error('Error refreshing data:', error);
        Alert.alert("Error", "Failed to refresh data");
    } finally {
        setRefreshing(false);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Start New Session</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Templates</Text>

        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.templateList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.templateCard}
              onPress={() => navigateToActiveSession(item)}
              onLongPress={() => handleDeleteTemplate(item.id)}
            >
              <Text style={styles.templateName}>{item.name}</Text>
              <Text style={styles.templateDetail}>
                {item.exercises?.length || 0} {(item.exercises?.length || 0) === 1 ? 'workout' : 'workouts'}
              </Text>

              {item.exercises?.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  {item.exercises.map((exercise) => (
                    <Text key={exercise.id} style={styles.exerciseBullet}>
                      • {exercise.exercise}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No templates yet</Text>
              <Text style={styles.emptySubtext}>Create your first template to get started</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3f51b5']}
            />
          }
        />

        {/* Create Template Button */}
        <FAB
          icon="plus"
          label="Create New Template"
          onPress={navigateToTemplateCreator}
        />
      </SafeAreaView>
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
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 12,
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
    marginTop: 12,
    color: '#333',
  },
  templateList: {
    paddingBottom: 100,
  },
  templateCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  templateDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
      textAlign: 'center',
      marginTop: 24,
      color: '#666',
      fontStyle: 'italic',
      fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#bbb',
    fontSize: 16,
    marginTop: 4,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  exerciseBullet: {
    fontSize: 12,
    color: '#777',
    marginLeft: 8,
    marginTop: 2,
  },
});