import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { login, register } from "../services/authService";

export default function AuthScreen({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        try {
            const data = isLogin
                ? await login(email, password)
                : await register(email, password);

            if (data?.token) {
                onLogin(
                    data.token,
                    data.userId || "93308442-16ea-4838-920a-a45fae6627ec"
                );
            } else {
                Alert.alert("Erreur", "Login incorrect");
            }
        } catch (e) {
            Alert.alert("Erreur serveur");
        }
    };

    return (
        <View>
            <Text>Food4Me</Text>

            <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity onPress={handleAuth}>
                <Text>{isLogin ? "Login" : "Register"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text>Changer mode</Text>
            </TouchableOpacity>
        </View>
    );
}