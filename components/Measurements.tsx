import {
    loadCurrentMeasurements,
    loadMeasurementsHistory,
    saveCurrentMeasurements,
    saveMeasurementsHistory
} from "@/localstorage/storage";
import { useTheme } from "@/theme/ThemeContext";
import { useIsFocused } from "@react-navigation/native";
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
    const { theme, isDarkMode } = useTheme();
    const isFocused = useIsFocused();
    const newMeasureInput = useRef<TextInput>(null);
    
    // Current measurements state
    const [measures, setMeasures] = useState<CurrentMeasurement[]>([
        { part: "Height", measure: "180" },
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

    // Create dynamic styles based on theme
    const dynamicStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.background,
        },
        title: {
            color: theme.text,
        },
        entryItem: {
            backgroundColor: theme.secondary,
            borderColor: theme.border,
            shadowColor: isDarkMode ? '#000' : '#000',
        },
        entryPart: {
            color: theme.text,
        },
        newInput: {
            borderColor: theme.border,
            backgroundColor: theme.background,
            color: theme.text,
        },
        entryInput: {
            borderColor: theme.border,
            backgroundColor: theme.background,
            color: theme.text,
        },
        saveButton: {
            backgroundColor: theme.primary,
        },
        addButton: {
            backgroundColor: theme.secondary,
            borderColor: theme.primary,
        },
        addButtonText: {
            color: theme.primary,
        },
        historyTitle: {
            color: theme.text,
        },
        historyItem: {
            backgroundColor: theme.secondary,
            borderColor: theme.border,
            shadowColor: isDarkMode ? '#000' : '#000',
        },
        historyDate: {
            color: theme.text + '99', // 60% opacity
        },
        historyPart: {
            color: theme.text,
        },
        historyValue: {
            color: theme.text + 'CC', // 80% opacity
        },
        loadingText: {
            color: theme.text + '99',
        },
        emptyText: {
            color: theme.text + '99',
        },
        statsCard: {
            backgroundColor: theme.secondary,
            borderColor: theme.border,
        },
        statsTitle: {
            color: theme.text,
        },
        statsValue: {
            color: theme.primary,
        },
        sectionHeader: {
            backgroundColor: theme.background,
            borderColor: theme.border,
        },
        sectionHeaderText: {
            color: theme.text,
        },
    });

    // refresh measurements everytime screen is in focus
    useEffect(() => {
        if (isFocused) { 
            fetchTemplates();
        }
    }, [isFocused]); 

    const fetchTemplates = async () => {
        await loadData(); 
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const savedMeasurements = await loadCurrentMeasurements();
            if (savedMeasurements.length > 0) {
                setMeasures(savedMeasurements);
            }
            
            const history = await loadMeasurementsHistory();
            const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMeasurementHistory(sortedHistory);
            
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
        }, 500);
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
            
            setMeasurementHistory(updatedHistory);
            
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

    const confirmClearHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all measurement history?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Clear", 
                    style: "destructive",
                    onPress: clearHistory
                }
            ]
        );
    };

    const clearHistory = async () => {
        try {
            await saveMeasurementsHistory([]);
            setMeasurementHistory([]);
            setDisplayedHistory([]);
            setCurrentPage(0);
            setHasMoreData(false);
        } catch (error) {
            Alert.alert("Error", "Failed to clear history");
            console.error(error);
        }
    };

    const renderCurrentMeasurement = ({ item, index }: { item: CurrentMeasurement; index: number }) => (
        <TouchableOpacity
            onLongPress={() => deleteMeasurement(index)}
            delayLongPress={300}
            style={[styles.entryItem, dynamicStyles.entryItem]}
        >
            <View style={styles.measurementRow}>
                <View style={styles.measurementLeft}>
                    <Text style={[styles.entryPart, dynamicStyles.entryPart]}>{item.part}</Text>
                </View>
                <View style={styles.measurementRight}>
                    <TextInput
                        style={[styles.entryInput, dynamicStyles.entryInput]}
                        value={item.measure}
                        keyboardType="numeric"
                        onChangeText={(text) => updateMeasure(index, text)}
                        placeholder="0"
                        placeholderTextColor={theme.text + '66'}
                    />
                    <Text style={[styles.unitText, dynamicStyles.historyValue]}>cm</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHistoryItem = ({ item }: { item: MeasurementEntry }) => (
        <View style={[styles.historyItem, dynamicStyles.historyItem]}>
            <View style={styles.historyHeader}>
                <Text style={[styles.historyDate, dynamicStyles.historyDate]}>
                    {formatDate(item.date)}
                </Text>
                <View style={styles.entryCount}>
                    <Text style={[styles.entryCountText, dynamicStyles.historyValue]}>
                        {item.measurements.length} measurements
                    </Text>
                </View>
            </View>
            <View style={styles.measurementsList}>
                {item.measurements.map((measurement, index) => (
                    <View key={index} style={styles.historyMeasurement}>
                        <View style={styles.historyMeasurementLeft}>
                            <Text style={[styles.historyPart, dynamicStyles.historyPart]}>
                                {measurement.part}
                            </Text>
                        </View>
                        <Text style={[styles.historyValue, dynamicStyles.historyValue]}>
                            {measurement.measure} cm
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading more...</Text>
            </View>
        );
    };

    const ListEmptyComponent = (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No measurements saved yet</Text>
            <Text style={[styles.emptySubtext, dynamicStyles.emptyText]}>
                Add measurements above and save to history
            </Text>
        </View>
    );

    const StatsCard = () => (
        <View style={[styles.statsCard, dynamicStyles.statsCard]}>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={[styles.statsValue, dynamicStyles.statsValue]}>
                        {measures.length}
                    </Text>
                    <Text style={[styles.statsLabel, dynamicStyles.historyValue]}>
                        Current Measurements
                    </Text>
                </View>
                <View style={styles.statsDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statsValue, dynamicStyles.statsValue]}>
                        {measurementHistory.length}
                    </Text>
                    <Text style={[styles.statsLabel, dynamicStyles.historyValue]}>
                        History Entries
                    </Text>
                </View>
            </View>
        </View>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <View style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>
            <Text style={[styles.sectionHeaderText, dynamicStyles.sectionHeaderText]}>{title}</Text>
        </View>
    );

    const ListHeaderComponent = (
        <View>
            <SectionHeader title="Body Measurements" />
            <StatsCard />
            
            <Text style={[styles.title, dynamicStyles.title]}>Current Measurements (cm)</Text>
            
            {/* Current Measurements */}
            <FlatList
                data={measures}
                renderItem={renderCurrentMeasurement}
                keyExtractor={(item, index) => `current-${item.part}-${index}`}
                scrollEnabled={false}
            />

            {/* Add new measurement form */}
            <View style={[styles.addForm, dynamicStyles.entryItem]}>
                <View style={styles.addFormHeader}>
                    <Text style={[styles.addFormTitle, dynamicStyles.entryPart]}>Add New Measurement</Text>
                </View>
                <View style={styles.addFormInputs}>
                    <TextInput
                        placeholder="Body part (e.g., Chest, Waist)"
                        placeholderTextColor={theme.text + '66'}
                        style={[styles.newInput, dynamicStyles.newInput]}
                        value={newPart}
                        onChangeText={setNewPart}
                        onSubmitEditing={() => newMeasureInput.current?.focus()}
                        returnKeyType="next"
                    />
                    <View style={styles.measureInputContainer}>
                        <TextInput
                            placeholder="0"
                            placeholderTextColor={theme.text + '66'}
                            style={[styles.measureInput, dynamicStyles.entryInput]}
                            value={newMeasure}
                            keyboardType="numeric"
                            onChangeText={setNewMeasure}
                            ref={newMeasureInput}
                            onSubmitEditing={addMeasurement}
                            returnKeyType="done"
                        />
                        <Text style={[styles.inputUnit, dynamicStyles.historyValue]}>cm</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                onPress={addMeasurement} 
                style={[styles.addButton, dynamicStyles.addButton]}
            >
                <Text style={[styles.addButtonText, dynamicStyles.addButtonText]}>
                    Add Measurement
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={saveMeasurementsToHistory} style={[styles.saveButton, dynamicStyles.saveButton]}>
                <Text style={styles.saveButtonText}> Save to History</Text>
            </TouchableOpacity>

            {/* History Header */}
            {measurementHistory.length > 0 && (
                <View style={styles.historyHeaderContainer}>
                    <SectionHeader title="Measurement History"/>
                    <View style={styles.historyActions}>
                        <TouchableOpacity 
                            onPress={confirmClearHistory}
                            style={styles.clearButton}
                        >
                            <Text style={styles.clearButtonText}> Clear All</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, dynamicStyles.container, styles.centered]}>
                <View style={styles.loadingContent}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
                        Loading measurements...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            <FlatList
                data={displayedHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeaderComponent}
                ListFooterComponent={renderFooter}
                onEndReached={loadMoreData}
                ListEmptyComponent={ListEmptyComponent}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContent: {
        alignItems: 'center',
        gap: 16,
    },
    listContainer: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    sectionIcon: {
        fontSize: 24,
    },
    sectionHeaderText: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statsCard: {
        marginBottom: 24,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    statsRow: {
        flexDirection: 'row',
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statsDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 20,
    },
    statsValue: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    statsLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        paddingHorizontal: 4,
        letterSpacing: 0.3,
    },
    entryItem: {
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    measurementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    measurementLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    measurementIcon: {
        fontSize: 20,
    },
    entryPart: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    measurementRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    entryInput: {
        width: 80,
        borderWidth: 2,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    unitText: {
        fontSize: 14,
        fontWeight: '500',
        minWidth: 24,
    },
    addForm: {
        marginBottom: 16,
        padding: 20,
        gap: 16,
    },
    addFormHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    addFormIcon: {
        fontSize: 18,
    },
    addFormTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    addFormInputs: {
        gap: 12,
    },
    newInput: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    measureInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    measureInput: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    inputUnit: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 30,
    },
    addButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    historyHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyActions: {
        marginLeft: 12,
    },
    clearButton: {
        backgroundColor: '#FF6B6B',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    historyItem: {
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    historyDate: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    entryCount: {
        backgroundColor: '#007AFF20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    entryCountText: {
        fontSize: 12,
        fontWeight: '600',
    },
    measurementsList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
    },
    historyMeasurement: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#00000008',
        borderRadius: 8,
    },
    historyMeasurementLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    historyIcon: {
        fontSize: 16,
    },
    historyPart: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    historyValue: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 60,
        textAlign: 'right',
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
        paddingHorizontal: 32,
    },
});