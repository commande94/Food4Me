import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/registerStyles";

export default function RegisterScreen({ navigation }) {
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({});

    const updateField = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const nextStep = () => step < 11 && setStep(step + 1);
    const prevStep = () => step > 1 ? setStep(step - 1) : navigation.goBack();

    const renderStep = () => {
        return (
            <TextInput
                placeholder="Remplir le champ..."
                style={styles.input}
            />
        );
    };

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={prevStep}>
                    <Ionicons name="chevron-back" size={28} color="#111" />
                </TouchableOpacity>

                <View style={styles.progressWrap}>
                    <View style={[styles.progress, { width: `${(step / 11) * 100}%` }]} />
                </View>

                <Text style={styles.step}>{step}/11</Text>
            </View>

            {/* CARD */}
            <View style={styles.card}>
                <Text style={styles.title}>Création du profil</Text>
                <Text style={styles.subtitle}>Étape {step}</Text>

                {renderStep()}
            </View>

            {/* BUTTON */}
            <TouchableOpacity style={styles.button} onPress={nextStep}>
                <Text style={styles.buttonText}>
                    {step === 11 ? "Terminer" : "Continuer"}
                </Text>
            </TouchableOpacity>

        </View>
    );
}