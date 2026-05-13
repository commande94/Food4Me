import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDailyTotals } from "../services/foodService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen({ navigation }) {
    const [token, setToken] = useState(null);
    const [dailyTotals, setDailyTotals] = useState(null);

    // Récupération du token au montage
    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("token");
            setToken(t);
        };
        loadToken();
    }, []);

    const fetchTotals = useCallback(async () => {
        if (!token) return;
        try {
            const data = await getDailyTotals(token);
            setDailyTotals(data);
        } catch (e) {
            console.log("Erreur synthèse jour", e);
        }
    }, [token]);

    useEffect(() => {
        fetchTotals();
    }, [fetchTotals]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userId");
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    };

    return (
        <View style={globalStyles.container}>
            {/* HEADER */}
            <View style={homeStyles.header}>
                <Text style={homeStyles.title}>🍽️ Food4Me</Text>
                <TouchableOpacity style={homeStyles.logoutButton} onPress={handleLogout}>
                    <Text style={homeStyles.logoutButtonText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            <Text style={homeStyles.menuTitle}>Que souhaitez-vous faire ?</Text>

            {/* BOUTONS DU MENU */}
            <TouchableOpacity
                style={[homeStyles.menuButton, { backgroundColor: "#3498db" }]}
                onPress={() => navigation.navigate("Search", { token })}
            >
                <Text style={homeStyles.menuButtonText}>🔍 Ajouter un repas préparé</Text>
                <Text style={homeStyles.menuButtonSub}>Rechercher un produit via OpenFoodFacts</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[homeStyles.menuButton, { backgroundColor: "#2ecc71" }]}
                onPress={() => navigation.navigate("Compose", { token })}
            >
                <Text style={homeStyles.menuButtonText}>🥗 Composer votre repas</Text>
                <Text style={homeStyles.menuButtonSub}>Ajouter vos propres ingrédients</Text>
            </TouchableOpacity>

            {/* SYNTHÈSE DU JOUR */}
            {dailyTotals && (
                <View style={homeStyles.dailyCard}>
                    <Text style={homeStyles.dailyTitle}>📊 Aujourd&apos;hui</Text>
                    <View style={homeStyles.dailyRow}>
                        <Text style={homeStyles.dailyMacro}>🔥 Calories : {dailyTotals.calories} kcal</Text>
                        <Text style={homeStyles.dailyMacro}>🥩 Protéines : {dailyTotals.proteines} g</Text>
                        <Text style={homeStyles.dailyMacro}>🍞 Glucides : {dailyTotals.glucides} g</Text>
                        <Text style={homeStyles.dailyMacro}>🥑 Lipides : {dailyTotals.lipides} g</Text>
                    </View>
                </View>
            )}
        </View>
    );
}