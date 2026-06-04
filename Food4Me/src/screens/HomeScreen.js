import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDailyTotals, getTodayMeals, deleteMeal } from "../services/foodService";
import { me as getProfile } from "../services/authService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";
import * as Progress from "react-native-progress";
import { Animated } from "react-native";

export default function HomeScreen({ navigation }) {
    const [token, setToken] = useState(null);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [todayMeals, setTodayMeals] = useState([]);
    const [loadingMeals, setLoadingMeals] = useState(false);
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

    const refreshMeals = async () => {
        if (!token) return;
        try {
            const [totals, meals] = await Promise.all([
                getDailyTotals(token),
                getTodayMeals(token),
            ]);
            setDailyTotals(totals);
            setTodayMeals(meals);
        } catch (e) {
            console.error("❌ Erreur refresh:", e);
        }
    };

    const handleDelete = (meal) => {
        Alert.alert(
            "Supprimer ce repas",
            `Supprimer « ${meal.nom_repas} » ?`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMeal(token, meal.id_repas);
                            await refreshMeals();
                        } catch (e) {
                            Alert.alert("Erreur", "Impossible de supprimer ce repas.");
                        }
                    },
                },
            ]
        );
    };

    const formatMealTime = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Charger totals + repas du jour quand l'écran est affiché
    useFocusEffect(
        useCallback(() => {
            if (!token) return;

            (async () => {
                setLoadingMeals(true);
                try {
                    const [totals, meals] = await Promise.all([
                        getDailyTotals(token),
                        getTodayMeals(token),
                    ]);
                    setDailyTotals(totals);
                    setTodayMeals(meals);
                } catch (e) {
                    console.error("❌ Erreur chargement journal:", e);
                } finally {
                    setLoadingMeals(false);
                }
            })();
        }, [token])
    );

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
    }, [dailyTotals, calorieTarget, animatedValue]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userId");
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }} contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 120
        }}>
            {/* HEADER */}
            <View style={homeStyles.header}>
                <Text style={homeStyles.title}>Food4Me</Text>
                <TouchableOpacity style={homeStyles.logoutButton} onPress={handleLogout}>
                    <Text style={homeStyles.logoutButtonText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            {(dailyTotals || calorieTarget) && (
                <View style={homeStyles.dashboardWrapper}>
                    <View style={homeStyles.modernDashboard}>

                        {/* HEADER MINI */}
                        <View style={homeStyles.topBar}>
                            <Text style={homeStyles.dateText}>
                                📅 AUJOURD’HUI
                            </Text>

                            <View style={homeStyles.topIcons}>
                                <Text>🔔</Text>
                                <Text>👤</Text>
                            </View>
                        </View>

                        {/* GAUGE CENTRAL */}
                        <View style={homeStyles.gaugeSection}>

                            {/* LEFT STATS */}
                            <View style={homeStyles.sideStat}>
                                <Text style={homeStyles.statLabel}>Consommé</Text>
                                <Text style={homeStyles.statValue}>
                                    {dailyTotals?.calories || 0}
                                </Text>
                            </View>

                            {/* GAUGE */}
                            <View
                                style={[
                                    homeStyles.gaugeCircle,
                                    { borderColor: getProgressColor() }
                                ]}
                            >
                                <Animated.View
                                    pointerEvents="none"
                                    style={{
                                        position: "relative",
                                        position: "absolute",
                                        width: 160,
                                        height: 160,
                                        borderRadius: 80,
                                        borderWidth: 12,
                                        borderColor: getProgressColor(),
                                        opacity: animatedValue,
                                    }}
                                />
                                <View style={homeStyles.gaugeInner}>

                                    <Text style={homeStyles.gaugeSmallText}>
                                        Objectif
                                    </Text>

                                    <Text style={homeStyles.gaugeBigText}>
                                        {calorieTarget || 0}
                                    </Text>

                                    <Text style={homeStyles.gaugeSubText}>
                                        kcal
                                    </Text>

                                </View>
                            </View>

                            {/* RIGHT STATS */}
                            <View style={homeStyles.sideStat}>
                                <Text style={homeStyles.statLabel}>Restant</Text>
                                <Text style={homeStyles.statValue}>
                                    {remainingCalories ?? 0}
                                </Text>
                            </View>
                        </View>

                        {/* OBJECTIF BADGE */}
                        <View style={homeStyles.goalBadge}>
                            <Text style={homeStyles.goalBadgeText}>
                                🎯 {profile?.objectif || "Maintien"}
                            </Text>
                        </View>

                        {/* CONSEIL */}
                        <Text style={homeStyles.dashboardHintModern}>
                            {profile?.objectif === "Perte de poids"
                                ? "Déficit léger + protéines élevées pour optimiser la perte."
                                : profile?.objectif === "Prise de masse"
                                    ? "Augmente progressivement ton apport calorique."
                                    : "Maintien stable : équilibre tes apports quotidiennement."
                            }
                        </Text>

                        {/* BOTTOM CARDS */}
                        <View style={homeStyles.bottomCards}>

                            <View style={homeStyles.miniCard}>
                                <Text style={homeStyles.miniTitle}>Protéines</Text>
                                <Text style={homeStyles.miniValue}>
                                    {dailyTotals?.proteines || 0} g
                                </Text>
                                <View style={homeStyles.bar} />
                            </View>

                            <View style={homeStyles.miniCard}>
                                <Text style={homeStyles.miniTitle}>Glucides</Text>
                                <Text style={homeStyles.miniValue}>
                                    {dailyTotals?.glucides || 0} g
                                </Text>
                                <View style={homeStyles.bar} />
                            </View>

                            <View style={homeStyles.miniCard}>
                                <Text style={homeStyles.miniTitle}>Lipides</Text>
                                <Text style={homeStyles.miniValue}>
                                    {dailyTotals?.lipides || 0} g
                                </Text>
                                <View style={homeStyles.bar} />
                            </View>

                        </View>

                    </View></View>
            )}
            <Text style={[homeStyles.menuTitle, { paddingHorizontal: 16 }]}>Que souhaitez-vous faire ?</Text>

            <View style={{ paddingHorizontal: 16 }}>
                <TouchableOpacity
                    style={[homeStyles.menuButton, { backgroundColor: "#2ecc71" }]}
                    onPress={() => navigation.navigate("Compose", { token })}
                >
                    <Text style={homeStyles.menuButtonText}>➕ Ajouter un repas</Text>
                    <Text style={homeStyles.menuButtonSub}>Rechercher un aliment et composer votre repas</Text>
                </TouchableOpacity>
            </View>

            <View style={homeStyles.mealsSection}>
                <Text style={homeStyles.mealsSectionTitle}>🍽️ Repas enregistrés aujourd&apos;hui</Text>

                {loadingMeals ? (
                    <View style={homeStyles.mealsEmpty}>
                        <Text style={homeStyles.mealsEmptyText}>Chargement...</Text>
                    </View>
                ) : todayMeals.length === 0 ? (
                    <View style={homeStyles.mealsEmpty}>
                        <Text style={homeStyles.mealsEmptyText}>
                            Aucun repas enregistré aujourd&apos;hui. Ajoutez votre premier repas ci-dessus.
                        </Text>
                    </View>
                ) : (
                    todayMeals.map((meal) => (
                        <View key={meal.id_repas} style={homeStyles.mealCard}>
                            <View style={homeStyles.mealHeader}>
                                <Text style={homeStyles.mealName} numberOfLines={2}>
                                    {meal.nom_repas}
                                </Text>
                                <Text style={homeStyles.mealTime}>
                                    {formatMealTime(meal.date_repas)}
                                </Text>
                            </View>
                            <Text style={homeStyles.mealCalories}>
                                🔥 {meal.calories} kcal
                            </Text>
                            <Text style={homeStyles.mealMacros}>
                                P: {meal.proteines}g · G: {meal.glucides}g · L: {meal.lipides}g
                            </Text>
                            <View style={homeStyles.mealActions}>
                                <TouchableOpacity
                                    style={homeStyles.mealActionBtn}
                                    onPress={() => navigation.navigate("Compose", { token, editMealId: meal.id_repas })}
                                >
                                    <Text style={homeStyles.mealActionEdit}>✏️ Modifier</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={homeStyles.mealActionBtn}
                                    onPress={() => handleDelete(meal)}
                                >
                                    <Text style={homeStyles.mealActionDelete}>🗑️ Supprimer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
