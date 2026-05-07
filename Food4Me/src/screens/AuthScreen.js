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

export default function RegisterScreen({ navigation }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = () => {
        Alert.alert("Inscription", "Compte créé !");
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
                <Text style={styles.title}>Food4me</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                >
                    <Text style={styles.buttonText}>Se connecter</Text>
                </TouchableOpacity>

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