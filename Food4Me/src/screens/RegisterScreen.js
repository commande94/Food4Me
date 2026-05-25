import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Picker } from "@react-native-picker/picker";

import { supabase } from "../services/supabase";
import styles from "../styles/registerStyles";

export default function RegisterScreen({ navigation }) {

    const [step, setStep] = useState(1);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nom: "",
        prenom: "",
        objectif: "",
        genre: "",
        dateNaissance: new Date(),
        poids: 70,
        taille: 170,
    });

    const totalSteps = 8;

    const updateField = (key, value) => {

        setForm({
            ...form,
            [key]: value
        });

        setError("");
    };

    const isEmailValid = (email) => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const isPasswordValid = (password) => {
        return password.length >= 6;
    };

    const isValidNumber = (value, min, max) => {
        return value >= min && value <= max;
    };

    const getStepTitle = () => {

        switch (step) {

            case 1:
                return "Quel est votre email ?";

            case 2:
                return "Créez votre mot de passe";

            case 3:
                return "Veuillez entrer votre nom et prénom";

            case 4:
                return "Quel est votre objectif ?";

            case 5:
                return "Quel est votre sexe ?";

            case 6:
                return "Quelle est votre date de naissance ?";

            case 7:
                return "Quel est votre poids ?";

            case 8:
                return "Quelle est votre taille ?";

            default:
                return "";
        }
    };

    const nextStep = async () => {

        console.log("➡️ Étape actuelle :", step);

        setError("");

        // VALIDATIONS

        if (step === 1 && !isEmailValid(form.email)) {

            console.log("❌ Email invalide");

            setError("Email invalide");

            return;
        }

        if (step === 2) {

            if (!isPasswordValid(form.password)) {

                console.log("❌ Mot de passe trop court");

                setError(
                    "Le mot de passe doit contenir au moins 6 caractères"
                );

                return;
            }

            if (form.password !== form.confirmPassword) {

                console.log("❌ Les mots de passe ne correspondent pas");

                setError(
                    "Les mots de passe ne correspondent pas"
                );

                return;
            }
        }

        if (step === 3 && (!form.nom || !form.prenom)) {

            console.log("❌ Nom ou prénom manquant");

            setError(
                "Veuillez remplir votre nom et prénom"
            );

            return;
        }

        if (step === 4 && !form.objectif) {

            console.log("❌ Objectif manquant");

            setError(
                "Veuillez choisir un objectif"
            );

            return;
        }

        if (step === 5 && !form.genre) {

            console.log("❌ Genre manquant");

            setError(
                "Veuillez choisir votre sexe"
            );

            return;
        }

        if (step === 7 && !isValidNumber(form.poids, 30, 300)) {

            console.log("❌ Poids invalide");

            setError("Poids invalide");

            return;
        }

        if (step === 8 && !isValidNumber(form.taille, 120, 250)) {

            console.log("❌ Taille invalide");

            setError("Taille invalide");

            return;
        }

        // ÉTAPE SUIVANTE

        if (step < totalSteps) {

            console.log("➡️ Passage étape suivante");

            setStep(step + 1);

            return;
        }

        // INSCRIPTION SUPABASE

        setLoading(true);

        try {

            console.log("📡 Vérification email existant...");

            const {
                data: existingUser,
                error: existingError
            } = await supabase
                .from("utilisateur")
                .select("*")
                .eq("email", form.email)
                .single();

            console.log("📥 Résultat vérification :", existingUser);

            if (existingUser) {

                console.log("❌ Email déjà utilisé");

                setError("Cet email existe déjà");

                setLoading(false);

                return;
            }

            if (
                existingError &&
                existingError.code !== "PGRST116"
            ) {

                console.log(
                    "❌ Erreur vérification email :",
                    existingError
                );

                setError("Erreur vérification email");

                setLoading(false);

                return;
            }

            console.log("🔐 Hash mot de passe...");

            const hashedPassword =
                await bcrypt.hash(form.password, 10);

            console.log("✅ Hash créé");

            console.log("📡 Création utilisateur...");

            const {
                data: userData,
                error: userError
            } = await supabase
                .from("utilisateur")
                .insert([
                    {
                        email: form.email,
                        mot_de_passe_hash: hashedPassword
                    }
                ])
                .select()
                .single();

            console.log("📥 Utilisateur créé :", userData);

            if (userError) {

                console.log(
                    "❌ Erreur création utilisateur :",
                    userError
                );

                setError(
                    "Erreur création utilisateur"
                );

                setLoading(false);

                return;
            }

            console.log("📡 Création profil...");

            const age =
                new Date().getFullYear()
                - form.dateNaissance.getFullYear();

            const {
                data: profileData,
                error: profileError
            } = await supabase
                .from("profil")
                .insert([
                    {
                        id_utilisateur:
                            userData.id_utilisateur,

                        nom: form.nom,

                        prenom: form.prenom,

                        age: age,

                        genre: form.genre,

                        taille_cm: parseInt(form.taille),

                        poids_kg: parseInt(form.poids),

                        objectif: form.objectif,

                        date_naissance:
                            form.dateNaissance
                    }
                ])
                .select();

            console.log("📥 Profil créé :", profileData);

            if (profileError) {

                console.log(
                    "❌ Erreur création profil :",
                    profileError
                );

                setError(
                    "Erreur création profil"
                );

                setLoading(false);

                return;
            }

            console.log("✅ Compte créé avec succès");

            await AsyncStorage.setItem(
                "user",
                JSON.stringify(userData)
            );

            Alert.alert(
                "Succès",
                "Compte créé avec succès !"
            );

            navigation.replace("Home");

        } catch (err) {

            console.log("❌ Erreur générale :", err);

            setError("Erreur serveur");

        } finally {

            console.log("🏁 Fin inscription");

            setLoading(false);
        }
    };

    const prevStep = () => {

        if (step > 1) {

            setStep(step - 1);

        } else {

            navigation.goBack();
        }
    };

    const renderStep = () => {

        switch (step) {

            case 1:

                return (
                    <TextInput
                        placeholder="Ton email"
                        value={form.email}
                        onChangeText={(v) =>
                            updateField("email", v)
                        }
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                );

            case 2:

                return (
                    <>
                        <TextInput
                            placeholder="Mot de passe"
                            secureTextEntry
                            value={form.password}
                            onChangeText={(v) =>
                                updateField("password", v)
                            }
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Confirmation"
                            secureTextEntry
                            value={form.confirmPassword}
                            onChangeText={(v) =>
                                updateField(
                                    "confirmPassword",
                                    v
                                )
                            }
                            style={[
                                styles.input,
                                { marginTop: 10 }
                            ]}
                        />
                    </>
                );

            case 3:

                return (
                    <>
                        <TextInput
                            placeholder="Nom"
                            value={form.nom}
                            onChangeText={(v) =>
                                updateField("nom", v)
                            }
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Prénom"
                            value={form.prenom}
                            onChangeText={(v) =>
                                updateField("prenom", v)
                            }
                            style={[
                                styles.input,
                                { marginTop: 10 }
                            ]}
                        />
                    </>
                );

            case 4:

                return (
                    <View style={styles.choiceContainer}>
                        {[
                            "Perte de poids",
                            "Maintien",
                            "Prise de masse"
                        ].map((item) => (

                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.choiceButton,
                                    form.objectif === item &&
                                    styles.choiceSelected
                                ]}
                                onPress={() =>
                                    updateField(
                                        "objectif",
                                        item
                                    )
                                }
                            >
                                <Text style={styles.choiceText}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 5:

                return (
                    <View style={styles.choiceContainer}>
                        {["Homme", "Femme"].map((item) => (

                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.choiceButton,
                                    form.genre === item &&
                                    styles.choiceSelected
                                ]}
                                onPress={() =>
                                    updateField("genre", item)
                                }
                            >
                                <Text style={styles.choiceText}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 6:

                return (
                    <View style={{ alignItems: "center" }}>

                        <Text style={{ marginBottom: 10 }}>
                            {form.dateNaissance.toLocaleDateString(
                                "fr-FR",
                                {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                }
                            )}
                        </Text>

                        <DateTimePicker
                            value={form.dateNaissance}
                            mode="date"
                            display="spinner"
                            maximumDate={new Date()}
                            onChange={(e, date) => {

                                if (date) {

                                    updateField(
                                        "dateNaissance",
                                        date
                                    );
                                }
                            }}
                        />
                    </View>
                );

            case 7:

                return (
                    <View style={styles.selectorBox}>

                        <Text>Poids (kg)</Text>

                        <Picker
                            selectedValue={form.poids}
                            onValueChange={(v) =>
                                updateField("poids", v)
                            }
                        >
                            {Array.from(
                                { length: 200 },
                                (_, i) => i + 30
                            ).map((v) => (

                                <Picker.Item
                                    key={v}
                                    label={`${v} kg`}
                                    value={v}
                                />
                            ))}
                        </Picker>
                    </View>
                );

            case 8:

                return (
                    <View style={styles.selectorBox}>

                        <Text>Taille (cm)</Text>

                        <Picker
                            selectedValue={form.taille}
                            onValueChange={(v) =>
                                updateField("taille", v)
                            }
                        >
                            {Array.from(
                                { length: 120 },
                                (_, i) => i + 120
                            ).map((v) => (

                                <Picker.Item
                                    key={v}
                                    label={`${v} cm`}
                                    value={v}
                                />
                            ))}
                        </Picker>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : "height"
            }
        >
            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="always"
            >

                <View style={styles.header}>

                    <TouchableOpacity onPress={prevStep}>
                        <Ionicons
                            name="chevron-back"
                            size={28}
                        />
                    </TouchableOpacity>

                    <View style={styles.progressWrap}>
                        <View
                            style={[
                                styles.progress,
                                {
                                    width:
                                        `${(step / totalSteps) * 100}%`
                                }
                            ]}
                        />
                    </View>

                    <Text>
                        {step}/{totalSteps}
                    </Text>

                </View>

                <View style={styles.card}>

                    <Text style={styles.title}>
                        {getStepTitle()}
                    </Text>

                    {error ? (
                        <Text style={{ color: "red" }}>
                            {error}
                        </Text>
                    ) : null}

                    {renderStep()}

                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={nextStep}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {
                            loading
                                ? "⏳ Création du compte..."
                                : (
                                    step === totalSteps
                                        ? "✅ Terminer"
                                        : "Continuer"
                                )
                        }
                    </Text>
                </TouchableOpacity>

            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
}