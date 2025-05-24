import {
    addWeightEntry,
    loadWeightHistory,
    saveWeightHistory
} from "@/localstorage/storage";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { WeightEntry } from "./types";

export default function WeightLog() {
    const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);

    // Load saved weight history on mount
    useEffect(() => {
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
        
        loadData();
    }, []);

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
                id: Date.now().toString(), // Generate unique ID
                weight: numWeight,
                date: new Date().toISOString()
            };

            // Update local state
            const updatedEntries = [...weightEntries, newEntry];
            setWeightEntries(updatedEntries);

            // Save to storage using addWeightEntry
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
        if (!weightChange) return "#666";
        return weightChange > 0 ? "#ff4444" : "#44aa44";
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text>Loading weight data...</Text>
            </View>
        );
    }

    return(
        <>
            <Pressable 
                onPress={handlePress}
                style={styles.container}
                onLongPress={clearAllWeights}
            >
                <Text style={styles.heading}>
                    Weight
                </Text>
                <Text style={styles.currentWeight}>
                    {currentWeight.toFixed(1)} kg
                </Text>
                {weightChange !== null && (
                    <Text style={[styles.weightChange, { color: getChangeColor() }]}>
                        {getChangeText()}
                    </Text>
                )}
            </Pressable>

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Weight Tracker</Text>
                        <Pressable 
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.sectionTitle}>
                            Log new weight (kg):
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={inputValue}
                                onChangeText={setInputValue}
                                placeholder="Enter weight"
                                keyboardType="numeric"
                                style={styles.textInput}
                                autoFocus={true}
                            />
                            <Pressable
                                onPress={handleSaveWeight}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                    
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.sectionTitle}>
                                Weight History
                            </Text>
                            <Pressable
                                onPress={clearAllWeights}
                                style={styles.clearButton}
                            >
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </Pressable>
                        </View>
                        <ScrollView style={styles.scrollView}>
                            {weightEntries.length === 0 ? (
                                <Text style={styles.emptyText}>No weight saved entries yet</Text>
                            ) : (
                                [...weightEntries]
                                    .reverse()
                                    .map((entry) => (
                                        <View key={entry.id} style={styles.entryItem}>
                                            <Text style={styles.entryWeight}>
                                                {entry.weight.toFixed(1)} kg
                                            </Text>
                                            <Text style={styles.entryDate}>
                                                {formatDate(entry.date)}
                                            </Text>
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
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'flex-start',
        minHeight: 80,
        justifyContent: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 16,
    },
    currentWeight: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'black',
    },
    weightChange: {
        fontSize: 16,
        marginTop: 4,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 8,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inputSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    historySection: {
        flex: 1,
        padding: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    clearButton: {
        padding: 8,
        backgroundColor: '#ff4444',
        borderRadius: 6,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    entryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    entryWeight: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    entryDate: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
});