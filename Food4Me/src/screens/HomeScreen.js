import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDailyTotals } from "../services/foodService";
import { me as getProfile } from "../services/authService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen({ navigation }) {
    const [token, setToken] = useState(null);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [profile, setProfile] = useState(null);
    const [calorieTarget, setCalorieTarget] = useState(null);

    // Récupération du token au montage
    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("token");
            setToken(t);
            if (t) {
                try {
                    const user = await getProfile(t);
                    if (user && user.profil) {
                        setProfile(user.profil);
                        const target = computeCalorieTarget(user.profil);
                        setCalorieTarget(target);
                    }
                } catch (e) {
                    console.log("Erreur récupération profil", e);
                }
            }
        };
        loadToken();
    }, []);

    const computeCalorieTarget = (p) => {
        if (!p) return null;
        const weight = p.poids_kg || p.poids || 70;
        const height = p.taille_cm || p.taille || 170;
        const dob = p.date_naissance || p.dateNaissance || null;
        let age = 30;
        if (dob) {
            const b = new Date(dob);
            const today = new Date();
            age = today.getFullYear() - b.getFullYear();
            const m = today.getMonth() - b.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
        }

        const gender = (p.genre || p.sexe || "").toLowerCase();
        const isMale = gender.startsWith("h") || gender.startsWith("m") || gender === "homme";

        const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161));

        // NIVEAU D'ACTIVITÉ
        const niveau =
            p.niveau_activite ||
            p.niveauActivite ||
            "";

        let activityFactor = 1.2;

        if (niveau === "Un peu actif") {

            activityFactor = 1.375;
        }

        else if (niveau === "Actif") {

            activityFactor = 1.55;
        }

        else if (niveau === "Très actif") {

            activityFactor = 1.725;
        }

        // MAINTENANCE
        const maintenance = Math.round(
            bmr * activityFactor
        );

        // OBJECTIF
        const objectif =
            (
                p.objectif ||
                "Maintien"
            ).toLowerCase();

        let target = maintenance;
        // PERTE = -30%
        if (objectif.includes("perte")) {
            target = Math.round(
                maintenance * 0.70
            );
        }
        // PRISE = +15%
        else if (objectif.includes("prise")) {
            target = Math.round(
                maintenance * 1.15
            );
        }
        // MAINTIEN
        else {
            target = maintenance;
        }
        return target;
    };

    const remainingCalories = dailyTotals && calorieTarget ? calorieTarget - dailyTotals.calories : null;

    // Charger les totals quand l'écran est affiché
    useFocusEffect(
        useCallback(() => {
            if (!token) return;
            (async () => {
                try {
                    console.log("📊 Chargement des totals du jour...");
                    const data = await getDailyTotals(token);
                    console.log("✅ Totals chargés:", data);
                    setDailyTotals(data);
                } catch (e) {
                    console.error("❌ Erreur synthèse jour:", e);
                }
            })();
        }, [token])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userId");
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }} contentContainerStyle={{ padding: 20 }}>
            {/* HEADER */}
            <View style={homeStyles.header}>
                <Text style={homeStyles.title}>Food4Me</Text>
                <TouchableOpacity style={homeStyles.logoutButton} onPress={handleLogout}>
                    <Text style={homeStyles.logoutButtonText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            {(dailyTotals || calorieTarget) && (
                <View style={homeStyles.summaryCard}>
                    <View style={homeStyles.summaryTop}>
                        <View>
                            <Text style={homeStyles.summaryLabel}>Calories consommées</Text>
                            <Text style={homeStyles.summaryNumber}>{dailyTotals ? dailyTotals.calories : 0}</Text>
                        </View>
                        {calorieTarget && (
                            <View style={homeStyles.summaryTargetBox}>
                                <Text style={homeStyles.summaryTargetLabel}>Objectif calorique</Text>
                                <Text style={homeStyles.summaryTargetNumber}>{calorieTarget} kcal</Text>
                            </View>
                        )}
                    </View>
                    {remainingCalories !== null && (
                        <Text style={homeStyles.summaryHint}>
                            {remainingCalories >= 0
                                ? `Il vous reste ${remainingCalories} kcal pour atteindre votre objectif`
                                : `Objectif dépassé de ${Math.abs(remainingCalories)} kcal`}
                        </Text>
                    )}
                </View>
            )}

            {profile?.objectif && (
                <View style={homeStyles.objectiveCard}>
                    <Text style={homeStyles.objectiveTitle}>Votre objectif</Text>
                    <Text style={homeStyles.objectiveText}>{profile.objectif}</Text>
                    <Text style={homeStyles.objectiveHint}>
                        {profile.objectif === "Perte de poids"
                            ? "En douceur : réduisez légèrement les calories et privilégiez les protéines."
                            : profile.objectif === "Prise de masse"
                                ? "Ajoutez des repas riches et équilibrés pour soutenir la croissance musculaire."
                                : "Conservez votre niveau actuel et surveillez votre apport quotidien."
                        }
                    </Text>
                </View>
            )}

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
        </ScrollView>
    );
}
