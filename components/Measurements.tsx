import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Measurements() {
    const [measures, setMeasures] = useState([
        { part: "Height", measure: "180" },
        { part: "Bicep", measure: "30" },
        { part: "Waist", measure: "70" },
        { part: "Thigh", measure: "50" },
        { part: "Neck", measure: "30" },
        { part: "Forearm", measure: "25" }, 
    ]);

    
    const [newPart, setNewPart] = useState("");
    const [newMeasure, setNewMeasure] = useState("");

    const updateMeasure = (index: number, newValue: string) => {
        const updated = [...measures];
        updated[index].measure = newValue;
        setMeasures(updated);
    };

    const addMeasurement = () => {
        const newIndex = measures.length + 1;
        setMeasures(prev => [...prev, { part: newPart, measure: newMeasure }]);
        setNewPart("");
        setNewMeasure("");
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
                onPress: () => {
                const updated = measures.filter((_, i) => i !== index);
                setMeasures(updated);
                },
            },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Set your measurements (cm) :</Text>

            <ScrollView style={styles.scrollView}>
                {measures.map((entry, index) => (
                <TouchableOpacity
                    key={entry.part + index}
                    onLongPress={() => deleteMeasurement(index)}
                    delayLongPress={300} 
                >
                    <View style={styles.entryItem}>
                        <Text style={styles.entryPart}>{entry.part}</Text>
                        <TextInput
                        style={styles.entryInput}
                        value={entry.measure}
                        keyboardType="numeric"
                        onChangeText={(text) => updateMeasure(index, text)}
                        />
                    </View>
                    </TouchableOpacity>
                ))}

            <View style={styles.entryItem}>
            <TextInput
                placeholder="Add body part"
                style={styles.newInput}
                value={newPart}
                onChangeText={setNewPart}
            />
            <TextInput
                placeholder="0"
                style={styles.entryInput}
                value={newMeasure}
                keyboardType="numeric"
                onChangeText={setNewMeasure}
            />
            </View>

            <TouchableOpacity onPress={addMeasurement} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Measurement</Text>
            </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'black',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scrollView: {
        maxHeight: 240, 
    },
    entryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingHorizontal: 4,
    },
    entryInput: {
        width: 60,
        fontSize: 16,
        color: "#333",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        textAlign: "right",
        padding: 4,
    },
    entryPart: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    entryMeasure: {
        fontSize: 14,
        color: '#666',
    },
    addButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    newInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        padding: 4,
        marginRight: 10,
    },
});
