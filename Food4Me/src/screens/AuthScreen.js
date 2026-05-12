import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert
} from "react-native";

import styles from "../styles/authStyles";
import { API_URL } from "../config/apiConfig";

export default function AuthScreen({ navigation }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // 🔐 VALIDATIONS
    const isEmailValid = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const isPasswordValid = (password) => {
        return password.length >= 6;
    };

    // 🔐 LOGIN
    const handleLogin = async () => {

        setError("");

        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        if (!isEmailValid(email)) {
            setError("Email invalide");
            return;
        }

        if (!isPasswordValid(password)) {
            setError("Mot de passe trop court (6 caractères min)");
            return;
        }

        try {

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {

                Alert.alert("Succès", "Connexion réussie !");

                navigation.replace("Home");

            } else {

                setError(data.message || "Erreur de connexion");
            }

        } catch (err) {

            console.log(err);

            setError("Erreur serveur");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                enableOnAndroid
                extraScrollHeight={20}
                keyboardShouldPersistTaps="handled"
            >

                <Text style={styles.title}>Food4Me 🍎</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {error ? (
                    <Text style={{ color: "red", marginBottom: 10 }}>
                        {error}
                    </Text>
                ) : null}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                >
                    <Text style={styles.buttonText}>
                        Se connecter
                    </Text>
                </TouchableOpacity>

                {/* 👉 REGISTER LINK (on garde comme tu veux) */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                >
                    <Text style={styles.link}>
                        Pas de compte ? S'inscrire
                    </Text>
                </TouchableOpacity>

            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );
}