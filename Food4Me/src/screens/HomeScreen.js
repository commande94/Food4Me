import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDailyTotals } from "../services/foodService";
import { me as getProfile } from "../services/authService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";
import * as Progress from "react-native-progress";
import { Animated } from "react-native";

export default function HomeScreen({ navigation }) {
    const [token, setToken] = useState(null);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [profile, setProfile] = useState(null);
    const [calorieTarget, setCalorieTarget] = useState(null);
    const animatedValue = useState(new Animated.Value(0))[0];
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
    const progress =
        dailyTotals && calorieTarget
            ? dailyTotals.calories / calorieTarget
            : 0;
    const getProgressColor = () => {
        if (progress < 0.7) return "#3b82f6"; // bleu
        if (progress < 1) return "#f59e0b";   // orange
        return "#ef4444";                      // rouge
    };

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
        }, [token]),
        useEffect(() => {
            if (!calorieTarget) return;

            const value = Math.min(
                (dailyTotals?.calories || 0) / calorieTarget,
                1
            );

            Animated.timing(animatedValue, {
                toValue: value,
                duration: 800,
                useNativeDriver: false,
            }).start();
        }, [dailyTotals, calorieTarget]
        ));

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userId");
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#eefaf1" }} contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 120
        }}>
            {/* HEADER */}
            <View style={homeStyles.header}>

                <View style={homeStyles.logoContainer}>

                    <Text style={homeStyles.logoText}>
                        Food4Me
                    </Text>

                </View>

                <TouchableOpacity
                    style={homeStyles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={homeStyles.logoutButtonText}>
                        Déconnexion
                    </Text>
                </TouchableOpacity>

            </View>

            {/* DASHBOARD HORIZONTAL */}
            <View style={homeStyles.horizontalDashboard}>

                {/* TOP VALUES */}
                <View style={homeStyles.horizontalTopRow}>

                    <View style={homeStyles.horizontalStatBox}>
                        <Text style={homeStyles.horizontalStatLabel}>
                            Consommé
                        </Text>

                        <Text style={homeStyles.horizontalStatValue}>
                            {dailyTotals?.calories || 0}
                        </Text>
                    </View>

                    <View style={homeStyles.horizontalCenterInfos}>

                        <Text style={homeStyles.horizontalCenterSmall}>
                            Objectif journalier
                        </Text>

                        <Text style={homeStyles.horizontalCenterBig}>
                            {calorieTarget || 0}
                        </Text>

                        <Text style={homeStyles.horizontalCenterSub}>
                            kcal
                        </Text>

                    </View>

                    <View style={homeStyles.horizontalStatBox}>
                        <Text style={homeStyles.horizontalStatLabel}>
                            Restant
                        </Text>

                        <Text style={homeStyles.horizontalStatValue}>
                            {remainingCalories ?? 0}
                        </Text>
                    </View>

                </View>

                {/* BARRE PRINCIPALE */}
                <View style={homeStyles.mainBarBackground}>

                    <Animated.View
                        style={[
                            homeStyles.mainBarFill,
                            {
                                width: `${calorieTarget
                                    ? Math.min(
                                        (
                                            (dailyTotals?.calories || 0) /
                                            calorieTarget
                                        ) * 100,
                                        100
                                    )
                                    : 0
                                    }%`,
                                backgroundColor: getProgressColor(),
                                opacity: animatedValue,
                            }
                        ]}
                    />

                </View>

                {/* POURCENTAGE */}
                <Text style={homeStyles.progressPercent}>
                    {
                        calorieTarget
                            ? Math.round(
                                (
                                    (dailyTotals?.calories || 0) /
                                    calorieTarget
                                ) * 100
                            )
                            : 0
                    }%
                </Text>

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
        </ScrollView>
    );
}
