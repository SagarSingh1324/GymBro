import { Workout, WorkoutSession } from "@/components/types";
import { clearWorkoutSessions, loadWorkoutSessions } from "@/localstorage/storage";
import { Theme, useTheme } from "@/theme/ThemeContext";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const ITEMS_PER_PAGE = 10;

export default function History() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const isFocused = useIsFocused();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [displayedSessions, setDisplayedSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  // refresh templates everytime screen is in focus
  useEffect(() => {
    if (isFocused) { 
      fetchTemplates();
    }
  }, [isFocused]); 

  const fetchTemplates = async () => {
    const loaded = await loadWorkoutSessions(); 
    loadInitialSessions(); 
  };

  const loadInitialSessions = async () => {
    try {
      setLoading(true);
      const sessions = await loadWorkoutSessions();

      // Filter out sessions with missing or invalid exercises
      const validSessions = sessions.filter(
        (s): s is WorkoutSession => Array.isArray(s.exercises)
      );

      // Sort sessions by date (most recent first)
      const sortedSessions = validSessions.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setWorkoutSessions(sortedSessions);
      setDisplayedSessions(sortedSessions.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(1);
      setHasMoreData(sortedSessions.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading workout sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSessions = () => {
    if (loadingMore || !hasMoreData) return;

    setLoadingMore(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;

      const newSessions = workoutSessions.slice(startIndex, endIndex);

      if (newSessions.length > 0) {
        setDisplayedSessions(prev => [...prev, ...newSessions]);
        setCurrentPage(nextPage);
        setHasMoreData(endIndex < workoutSessions.length);
      } else {
        setHasMoreData(false);
      }

      setLoadingMore(false);
    }, 500);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialSessions();
    setRefreshing(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  };

  const getTotalSets = (exercises: Workout[] = []) =>
    exercises.reduce((total, ex) => total + (ex.sets || 0), 0);

  const renderWorkoutSession = ({ item }: { item: WorkoutSession }) => {
    const exercises = item.exercises ?? [];

    return (
      <TouchableOpacity style={styles.sessionCard} activeOpacity={0.7}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionName}>{item.name}</Text>
          <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalSets(exercises)}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        <View style={styles.exercisesList}>
          {exercises.slice().map((exercise, index) => (
            <Text key={index} style={styles.exerciseItem}>
              {exercise.exercise} • {exercise.sets} sets × {exercise.reps} reps × {exercise.weight} Kg
            </Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={styles.loadingText}>Loading more sessions...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No workout sessions yet</Text>
      <Text style={styles.emptyMessage}>
        Start your first workout to see your history here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading workout history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Workout History</Text>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          {workoutSessions.length} session{workoutSessions.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity onPress={async () => {
          await clearWorkoutSessions();
          await loadInitialSessions();
        }}
        style={styles.clearButton}>
          <Text style={styles.clearText}>Clear History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedSessions}
        renderItem={renderWorkoutSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreSessions}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
            progressBackgroundColor={theme.secondary}
          />
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
    backgroundColor: theme.secondary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: theme.text,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  sessionCard: {
    backgroundColor: theme.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    shadowColor: theme.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: theme.text,
    opacity: 0.6,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.text,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  exercisesList: {
    gap: 4,
  },
  exerciseItem: {
    fontSize: 14,
    color: theme.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  moreExercises: {
    fontSize: 14,
    color: theme.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: theme.text,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: theme.text,
    opacity: 0.6,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: theme.text,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 24,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});