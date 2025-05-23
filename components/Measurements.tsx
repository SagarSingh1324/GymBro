import {
    loadCurrentMeasurements,
    loadMeasurementsHistory,
    saveCurrentMeasurements,
    saveMeasurementsHistory
} from "@/localstorage/storage";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { CurrentMeasurement, MeasurementEntry } from './types';

export default function Measurements() {
    const newMeasureInput = useRef<TextInput>(null);
    // Current measurements state
    const [measures, setMeasures] = useState<CurrentMeasurement[]>([
        { part: "Height", measure: "180" },
        { part: "Bicep", measure: "30" },
        { part: "Waist", measure: "70" },
    ]);

    // History state
    const [measurementHistory, setMeasurementHistory] = useState<MeasurementEntry[]>([]);
    const [displayedHistory, setDisplayedHistory] = useState<MeasurementEntry[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    // Form state
    const [newPart, setNewPart] = useState("");
    const [newMeasure, setNewMeasure] = useState("");

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load current measurements with proper error handling
            const savedMeasurements = await loadCurrentMeasurements();
            if (savedMeasurements.length > 0) {
                setMeasures(savedMeasurements);
            }

            // Load measurements history with proper error handling
            const history = await loadMeasurementsHistory();
            // Sort by date (newest first)
            const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMeasurementHistory(sortedHistory);
            
            // Load first page
            const firstPage = sortedHistory.slice(0, ITEMS_PER_PAGE);
            setDisplayedHistory(firstPage);
            setCurrentPage(1);
            setHasMoreData(sortedHistory.length > ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert("Error", "Failed to load measurements data");
        } finally {
            setLoading(false);
        }
    };

    const loadMoreData = () => {
        if (loadingMore || !hasMoreData) return;

        setLoadingMore(true);
        setTimeout(() => {
            const startIndex = currentPage * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const moreItems = measurementHistory.slice(startIndex, endIndex);
            
            if (moreItems.length > 0) {
                setDisplayedHistory(prev => [...prev, ...moreItems]);
                setCurrentPage(prev => prev + 1);
                setHasMoreData(endIndex < measurementHistory.length);
            } else {
                setHasMoreData(false);
            }
            setLoadingMore(false);
        }, 500); // Small delay to show loading indicator
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadData();
        } catch (error) {
            console.error('Error refreshing data:', error);
            Alert.alert("Error", "Failed to refresh data");
        } finally {
            setRefreshing(false);
        }
    };

    const updateMeasure = async (index: number, newValue: string) => {
        try {
            const updated = [...measures];
            updated[index].measure = newValue;
            setMeasures(updated);
            await saveCurrentMeasurements(updated);
        } catch (error) {
            console.error('Error updating measurement:', error);
            Alert.alert("Error", "Failed to save measurement update");
        }
    };

    const addMeasurement = async () => {
        if (!newPart.trim() || !newMeasure.trim()) {
            Alert.alert("Error", "Please fill in both fields");
            return;
        }

        try {
            const updated = [...measures, { part: newPart.trim(), measure: newMeasure.trim() }];
            setMeasures(updated);
            await saveCurrentMeasurements(updated);
            setNewPart("");
            setNewMeasure("");
        } catch (error) {
            console.error('Error adding measurement:', error);
            Alert.alert("Error", "Failed to add measurement");
        }
    };

    const deleteMeasurement = (index: number) => {
        Alert.alert(
            "Delete Measurement",
            `Are you sure you want to delete "${measures[index].part}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updated = measures.filter((_, i) => i !== index);
                            setMeasures(updated);
                            await saveCurrentMeasurements(updated);
                        } catch (error) {
                            console.error('Error deleting measurement:', error);
                            Alert.alert("Error", "Failed to delete measurement");
                        }
                    },
                },
            ]
        );
    };

    const saveMeasurementsToHistory = async () => {
        try {
            const newEntry: MeasurementEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                measurements: [...measures],
            };

            const updatedHistory = [newEntry, ...measurementHistory];
            await saveMeasurementsHistory(updatedHistory);
            
            // Update local state
            setMeasurementHistory(updatedHistory);
            
            // Refresh displayed history
            const firstPage = updatedHistory.slice(0, ITEMS_PER_PAGE);
            setDisplayedHistory(firstPage);
            setCurrentPage(1);
            setHasMoreData(updatedHistory.length > ITEMS_PER_PAGE);

            Alert.alert("Success", "Measurements saved to history!");
        } catch (error) {
            Alert.alert("Error", "Failed to save measurements to history");
            console.error('Error saving to history:', error);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const renderCurrentMeasurement = ({ item, index }: { item: CurrentMeasurement; index: number }) => (
        <TouchableOpacity
            onLongPress={() => deleteMeasurement(index)}
            delayLongPress={300}
        >
            <View style={styles.entryItem}>
                <Text style={styles.entryPart}>{item.part}</Text>
                <TextInput
                    style={styles.entryInput}
                    value={item.measure}
                    keyboardType="numeric"
                    onChangeText={(text) => updateMeasure(index, text)}
                    placeholder="0"
                />
            </View>
        </TouchableOpacity>
    );

    const renderHistoryItem = ({ item }: { item: MeasurementEntry }) => (
        <View style={styles.historyItem}>
            <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
            {item.measurements.map((measurement, index) => (
                <View key={index} style={styles.historyMeasurement}>
                    <Text style={styles.historyPart}>{measurement.part}:</Text>
                    <Text style={styles.historyValue}>{measurement.measure} cm</Text>
                </View>
            ))}
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#3f51b5" />
                <Text style={styles.loadingText}>Loading more...</Text>
            </View>
        );
    };

    // Function to handle clear confirmation
    const confirmClearHistory = () => {
    Alert.alert(
        "Clear History",
        "Are you sure you want to delete all measurement history?",
        [
        {
            text: "Cancel",
            style: "cancel"
        },
        { 
            text: "Clear", 
            style: "destructive",
            onPress: clearHistory
        }
        ]
    );
    };

    // Function to clear history
    const clearHistory = async () => {
    try {
        await saveMeasurementsHistory([]); // Save empty array to storage
        setMeasurementHistory([]); // Clear local state
        setDisplayedHistory([]); // Clear displayed history
        setCurrentPage(0); // Reset pagination
        setHasMoreData(false); // No more data to load
    } catch (error) {
        Alert.alert("Error", "Failed to clear history");
        console.error(error);
    }
    };

    const ListHeaderComponent = (
        <View>
            <Text style={styles.title}>Set your measurements (cm):</Text>
            
            {/* Current Measurements */}
            <FlatList
                data={measures}
                renderItem={renderCurrentMeasurement}
                keyExtractor={(item, index) =>  `current-${item.part}-${index}`}
                scrollEnabled={false}
            />

            {/* Add new measurement form */}
            <View style={styles.entryItem}>
                <TextInput
                placeholder="Add body part"
                style={styles.newInput}
                value={newPart}
                onChangeText={setNewPart}
                onSubmitEditing={() => newMeasureInput.current?.focus()}
                returnKeyType="next"
                />
                <TextInput
                placeholder="0"
                style={styles.entryInput}
                value={newMeasure}
                keyboardType="numeric"
                onChangeText={setNewMeasure}
                ref={newMeasureInput}
                onSubmitEditing={addMeasurement}
                returnKeyType="done"
                />
            </View>

            <TouchableOpacity onPress={addMeasurement} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>+ Add Measurement</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={saveMeasurementsToHistory} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>📊 Save to History</Text>
            </TouchableOpacity>

        {/* Updated History Header with Clear Button */}
        <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Measurement History:</Text>
        <TouchableOpacity 
            onPress={confirmClearHistory}
            style={styles.clearButton}
        >
            <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
        </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3f51b5" />
                <Text style={styles.loadingText}>Loading measurements...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={displayedHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={renderFooter}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3f51b5']}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

// You'll need to add these styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    entryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    entryPart: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    newInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: 'white',
    },
    entryInput: {
    width: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: '#3f51b5',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 16,
        color: '#333',
    },
    historyItem: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    historyDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    historyMeasurement: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    historyPart: {
        fontSize: 14,
        color: '#333',
    },
    historyValue: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingText: {
        marginLeft: 8,
        color: '#666',
    },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
});