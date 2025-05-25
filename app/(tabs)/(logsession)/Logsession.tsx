import { WorkoutTemplate } from '@/components/types';
import FAB from '@/components/ui/fab';
import { loadWorkoutTemplates, saveWorkoutTemplates } from '@/localstorage/storage';
import { Theme, useTheme } from '@/theme/ThemeContext';
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
  const { theme } = useTheme();
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

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading templates...
          </Text>
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: theme.text }]}>
            Start New Session
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Templates
        </Text>

        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.templateList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.templateCard, { 
                backgroundColor: theme.secondary,
                borderColor: theme.border 
              }]}
              onPress={() => navigateToActiveSession(item)}
              onLongPress={() => handleDeleteTemplate(item.id)}
            >
              <Text style={[styles.templateName, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.templateDetail, { color: theme.text }]}>
                {item.exercises?.length || 0} {(item.exercises?.length || 0) === 1 ? 'workout' : 'workouts'}
              </Text>

              {item.exercises?.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  {item.exercises.map((exercise) => (
                    <Text 
                      key={exercise.id} 
                      style={[styles.exerciseBullet, { color: theme.text }]}
                    >
                      • {exercise.exercise}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No templates yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.text }]}>
                Create your first template to get started
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
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

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
  },
  refreshText: {
    fontSize: 20,
    color: theme.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  templateList: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  templateCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  templateDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  quickStartCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    backgroundColor: theme.secondary,
    borderColor: theme.border,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: theme.text,
    marginTop: 4,
  },
  exerciseBullet: {
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
});