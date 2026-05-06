import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/registerStyles";

export default function RegisterScreen({ navigation }) {
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        prenom: "",
        age: "",
        genre: "",
        objectif: "",
    });

    const update = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const next = () => {
        if (step < 4) setStep(step + 1);
    };

    const back = () => {
        if (step === 1) navigation.goBack();
        else setStep(step - 1);
    };

    const renderStep = () => {
        switch (step) {

            case 1:
                return (
                    <View style={styles.card}>
                        <Text style={styles.label}>Ton prénom</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Alex"
                            value={form.prenom}
                            onChangeText={(v) => update("prenom", v)}
                        />
                    </View>
                );

            case 2:
                return (
                    <View style={styles.card}>
                        <Text style={styles.label}>Ton âge</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 25"
                            keyboardType="numeric"
                            value={form.age}
                            onChangeText={(v) => update("age", v)}
                        />
                    </View>
                );

            case 3:
                return (
                    <View style={styles.card}>
                        <Text style={styles.label}>Ton genre</Text>

                        {["Homme", "Femme", "Autre"].map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.choice,
                                    form.genre === item && styles.choiceActive
                                ]}
                                onPress={() => update("genre", item)}
                            >
                                <Text style={styles.choiceText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 4:
                return (
                    <View style={styles.card}>
                        <Text style={styles.label}>Ton objectif</Text>

                        {[
                            "Perte de poids",
                            "Maintien",
                            "Prise de masse"
                        ].map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.choice,
                                    form.objectif === item && styles.choiceActive
                                ]}
                                onPress={() => update("objectif", item)}
                            >
                                <Text style={styles.choiceText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    Étape {step} / 4
                </Text>

                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        { width: `${(step / 4) * 100}%` }
                    ]} />
                </View>
            </View>

            {/* BACK BUTTON */}
            <TouchableOpacity style={styles.backButton} onPress={back}>
                <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>

            {/* CONTENT */}
            <View style={styles.content}>
                {renderStep()}
            </View>

            {/* NEXT BUTTON */}
            <TouchableOpacity style={styles.nextButton} onPress={next}>
                <Text style={styles.nextText}>
                    {step === 4 ? "Terminer" : "Continuer"}
                </Text>
            </TouchableOpacity>

        </View>
    );
}