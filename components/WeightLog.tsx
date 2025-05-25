import {
    addWeightEntry,
    loadWeightHistory,
    saveWeightHistory
} from "@/localstorage/storage";
import { useTheme } from "@/theme/ThemeContext";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { WeightEntry } from "./types";

export default function WeightLog() {
    const { theme, isDarkMode } = useTheme();
    const isFocused = useIsFocused();
    const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);

    // refresh measurements everytime screen is in focus
    useEffect(() => {
        if (isFocused) { 
        fetchTemplates();
        }
    }, [isFocused]); 

    const fetchTemplates = async () => {
        const loaded = await loadData();
    };

    // Load saved weight history on mount
    const loadData = async () => {
        try {
            const savedHistory = await loadWeightHistory();
            if (savedHistory.length > 0) {
                setWeightEntries(savedHistory);
            } else {
                // Initialize with default if no history exists
                setWeightEntries([{ 
                    id: Date.now().toString(),
                    weight: 80, 
                    date: new Date().toISOString() 
                }]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load weight history");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const currentWeight = weightEntries[weightEntries.length - 1]?.weight || 0;
    const previousWeight = weightEntries.length > 1 ? weightEntries[weightEntries.length - 2].weight : null;
    const weightChange = previousWeight ? currentWeight - previousWeight : null;

    function handlePress() {
        setInputValue(currentWeight.toString());
        setModalVisible(true);
    }

    async function handleSaveWeight() {
        if (!inputValue.trim()) {
            Alert.alert("Error", "Please enter a weight value.");
            return;
        }
        
        const numWeight = parseFloat(inputValue);
        if (isNaN(numWeight)) {
            Alert.alert("Invalid Weight", "Please enter a valid number.");
            return;
        }

        if (numWeight <= 0) {
            Alert.alert("Invalid Weight", "Weight must be greater than 0.");
            return;
        }

        try {
            const newEntry: WeightEntry = {
                id: Date.now().toString(),
                weight: numWeight,
                date: new Date().toISOString()
            };

            const updatedEntries = [...weightEntries, newEntry];
            setWeightEntries(updatedEntries);

            await addWeightEntry(newEntry);
            
            setInputValue("");
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Error", "Failed to save weight entry");
            console.error(error);
        }
    }

    async function clearAllWeights() {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all weight history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setWeightEntries([]);
                            await saveWeightHistory([]);
                        } catch (error) {
                            Alert.alert("Error", "Failed to clear history");
                            console.error(error);
                        }
                    },
                },
            ]
        );
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function getChangeText() {
        if (!weightChange) return "";
        const sign = weightChange > 0 ? "+" : "";
        return `${sign}${weightChange.toFixed(1)} kg`;
    }

    function getChangeColor() {
        if (!weightChange) return theme.text + '80'; // 50% opacity
        return weightChange > 0 ? '#FF6B6B' : '#51CF66'; // Modern red/green
    }

    // Create dynamic styles based on theme
    const dynamicStyles = StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderColor: theme.border,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
        },
        heading: {
            color: theme.text + 'CC', // 80% opacity
        },
        currentWeight: {
            color: theme.primary,
        },
        weightChange: {
            color: getChangeColor(),
        },
        modalContainer: {
            backgroundColor: theme.background,
        },
        modalTitle: {
            color: theme.text,
        },
        closeButton: {
            backgroundColor: theme.primary,
        },
        sectionTitle: {
            color: theme.text,
        },
        textInput: {
            borderColor: theme.border,
            backgroundColor: theme.secondary,
            color: theme.text,
        },
        saveButton: {
            backgroundColor: theme.primary,
        },
        entryWeight: {
            color: theme.text,
        },
        entryDate: {
            color: theme.text + '99', // 60% opacity
        },
        emptyText: {
            color: theme.text + '99',
        },
        loadingText: {
            color: theme.text,
        },
        historyHeader: {
            borderBottomColor: theme.border,
        },
        entryItem: {
            backgroundColor: theme.secondary + '40', // 25% opacity
            borderColor: theme.border,
        },
    });

    if (loading) {
        return (
            <View style={[styles.container, dynamicStyles.container, styles.loadingContainer]}>
                <View style={styles.loadingContent}>
                    <View style={styles.loadingSpinner} />
                    <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
                        Loading weight data...
                    </Text>
                </View>
            </View>
        );
    }

    return(
        <>
            <Pressable 
                onPress={handlePress}
                style={[styles.container, dynamicStyles.container]}
                onLongPress={clearAllWeights}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.heading, dynamicStyles.heading]}>
                        Weight Tracker
                    </Text>
                </View>
                
                <View style={styles.weightDisplay}>
                    <Text style={[styles.currentWeight, dynamicStyles.currentWeight]}>
                        {currentWeight.toFixed(1)}
                    </Text>
                    <Text style={[styles.unit, dynamicStyles.heading]}>kg</Text>
                </View>
                
                {weightChange !== null && (
                    <View style={styles.changeContainer}>
                        <Text style={[styles.changeLabel, dynamicStyles.heading]}>
                            Since last entry:
                        </Text>
                        <Text style={[styles.weightChange, dynamicStyles.weightChange]}>
                            {getChangeText()}
                        </Text>
                    </View>
                )}
                
                <Text style={[styles.tapHint, dynamicStyles.heading]}>
                    Tap to add entry • Long press to clear history
                </Text>
            </Pressable>

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
                    <View style={[styles.modalHeader, dynamicStyles.historyHeader]}>
                        <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
                            Weight Tracker
                        </Text>
                        <Pressable 
                            onPress={() => setModalVisible(false)}
                            style={[styles.closeButton, dynamicStyles.closeButton]}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                            Log new weight (kg)
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={inputValue}
                                onChangeText={setInputValue}
                                placeholder="Enter weight"
                                placeholderTextColor={theme.text + '66'}
                                keyboardType="numeric"
                                style={[styles.textInput, dynamicStyles.textInput]}
                                autoFocus={true}
                            />
                            <Pressable
                                onPress={handleSaveWeight}
                                style={[styles.saveButton, dynamicStyles.saveButton]}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                    
                    <View style={styles.historySection}>
                        <View style={[styles.historyHeader, dynamicStyles.historyHeader]}>
                            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
                                Weight History ({weightEntries.length} entries)
                            </Text>
                            <Pressable
                                onPress={clearAllWeights}
                                style={styles.clearButton}
                            >
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </Pressable>
                        </View>
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            {weightEntries.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                                        No weight entries yet
                                    </Text>
                                    <Text style={[styles.emptySubtext, dynamicStyles.emptyText]}>
                                        Add your first entry to start tracking
                                    </Text>
                                </View>
                            ) : (
                                [...weightEntries]
                                    .reverse()
                                    .map((entry, index) => (
                                        <View key={entry.id} style={[styles.entryItem, dynamicStyles.entryItem]}>
                                            <View style={styles.entryLeft}>
                                                <Text style={[styles.entryWeight, dynamicStyles.entryWeight]}>
                                                    {entry.weight.toFixed(1)} kg
                                                </Text>
                                                <Text style={[styles.entryDate, dynamicStyles.entryDate]}>
                                                    {formatDate(entry.date)}
                                                </Text>
                                            </View>
                                            {index === 0 && (
                                                <View style={styles.currentBadge}>
                                                    <Text style={styles.currentBadgeText}>Current</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 16,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 140,
    },
    loadingContent: {
        alignItems: 'center',
        gap: 12,
    },
    loadingSpinner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderTopColor: 'transparent',
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    weightIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 16,
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
    },
    currentWeight: {
        fontSize: 42,
        fontWeight: '700',
        letterSpacing: -1,
    },
    unit: {
        fontSize: 24,
        fontWeight: '500',
        opacity: 0.7,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    changeLabel: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7,
    },
    weightChange: {
        fontSize: 16,
        fontWeight: '600',
    },
    tapHint: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.6,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    inputSection: {
        padding: 24,
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textInput: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 16,
        padding: 16,
        fontSize: 18,
        fontWeight: '500',
    },
    saveButton: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        minWidth: 80,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    historySection: {
        flex: 1,
        padding: 24,
        paddingTop: 0,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
    },
    clearButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FF6B6B',
        borderRadius: 12,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    entryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    entryLeft: {
        flex: 1,
    },
    entryWeight: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    entryDate: {
        fontSize: 14,
        fontWeight: '500',
    },
    currentBadge: {
        backgroundColor: '#51CF66',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    currentBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
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
    },
});