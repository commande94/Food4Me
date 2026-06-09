import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDailyTotals, getTodayMeals, deleteMeal } from "../services/foodService";
import { me as getProfile } from "../services/authService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";
import { Animated } from "react-native";

const computeMacroTargets = (profile, calorieTarget) => {
    if (!profile || !calorieTarget) return null;

    const weight =
        profile.poids_kg || profile.poids || 70;

    // PROTEINES (1.8g/kg moyen)
    const proteines = Math.round(weight * 1.8);

    // LIPIDES (25% calories)
    const lipides = Math.round((calorieTarget * 0.25) / 9);

    // GLUCIDES (reste des calories)
    const remainingCalories =
        calorieTarget - (proteines * 4 + lipides * 9);

    const glucides = Math.round(remainingCalories / 4);

    return {
        proteines,
        glucides,
        lipides,
    };
};

export default function HomeScreen({ navigation }) {
    const [token, setToken] = useState(null);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [todayMeals, setTodayMeals] = useState([]);
    const [loadingMeals, setLoadingMeals] = useState(false);
    const [profile, setProfile] = useState(null);
    const [calorieTarget, setCalorieTarget] = useState(null);
    const animatedValue = useState(new Animated.Value(0))[0];


    const macroTargets = computeMacroTargets(profile, calorieTarget) || {
        proteines: 0,
        glucides: 0,
        lipides: 0,
    };

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
                        try { await AsyncStorage.setItem('lastProfile', JSON.stringify(user.profil)); } catch (e) { }
                        const target = computeCalorieTarget(user.profil);
                        setCalorieTarget(target);
                        try {
                            if (target) await AsyncStorage.setItem('lastCalorieTarget', String(target));
                        } catch (e) { }
                        try {
                            const mt = computeMacroTargets(user.profil, target) || { proteines: 0, glucides: 0, lipides: 0 };
                            await AsyncStorage.setItem('lastMacroTargets', JSON.stringify(mt));
                        } catch (e) { }
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
    const calorieRatio = calorieTarget ? (dailyTotals?.calories || 0) / calorieTarget : 0;
    const proteinesRatio = macroTargets.proteines ? (dailyTotals?.proteines || 0) / macroTargets.proteines : 0;
    const glucidesRatio = macroTargets.glucides ? (dailyTotals?.glucides || 0) / macroTargets.glucides : 0;
    const lipidesRatio = macroTargets.lipides ? (dailyTotals?.lipides || 0) / macroTargets.lipides : 0;
    const exceeded = calorieRatio > 1;
    const overAmount = exceeded ? Math.max(0, (dailyTotals?.calories || 0) - calorieTarget) : 0;
    const getProgressColor = (ratio = calorieRatio) => {
        const cappedRatio = Math.min(ratio, 1);
        if (cappedRatio < 0.7) return "#16a34a";
        return "#15803d";
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
                    try { await AsyncStorage.setItem('lastDailyTotals', JSON.stringify(totals)); } catch (e) { }
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

    return (
        <>
            <View style={homeStyles.pageSplitWrapper} pointerEvents="none">
                <View style={homeStyles.pageSplitTop} />
                <View style={homeStyles.pageSplitBottom} />
            </View>
            <View style={homeStyles.topWrapper}>
                <View style={homeStyles.topGradient} pointerEvents="none">
                    <View style={homeStyles.gradLeft} />
                    <View style={homeStyles.gradRight} />
                </View>

                <View style={[homeStyles.containerTop, { backgroundColor: 'transparent', zIndex: 2 }]}>
                    <View style={homeStyles.topBox}>
                        <View style={homeStyles.topLogoBg}>
                            <Image
                                source={require("../../assets/logo.png")}
                                style={homeStyles.topLogo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }} contentContainerStyle={{
                paddingTop: 100,
                paddingBottom: 120
            }}>
                {(dailyTotals || calorieTarget) && (
                    <View style={homeStyles.dashboardWrapper}>
                        <View style={homeStyles.modernDashboard}>

                            {/* ===================== CALORIES ===================== */}
                            <View style={homeStyles.calorieBox}>

                                <View style={homeStyles.calorieTopRow}>
                                    <Text style={homeStyles.calorieConsumed}>
                                        {dailyTotals?.calories || 0}
                                    </Text>

                                    <Text style={homeStyles.calorieTarget}>
                                        / {calorieTarget || 0} kcal
                                    </Text>
                                </View>

                                {/* BARRE CALORIES */}
                                <View style={homeStyles.calorieTrack}>
                                    <View
                                        style={[
                                            homeStyles.calorieFill,
                                            {
                                                width: `${Math.min(calorieRatio, 1) * 100}%`,
                                                backgroundColor: "#22c55e",
                                            },
                                        ]}
                                    />
                                </View>
                                {calorieRatio > 1 && (
                                    <View style={homeStyles.overflowTrack}>
                                        <View
                                            style={[
                                                homeStyles.overflowFill,
                                                {
                                                    width: `${Math.min((calorieRatio - 1) * 100, 100)}%`,
                                                    backgroundColor: "#dc2626",
                                                },
                                            ]}
                                        />
                                    </View>
                                )}

                                <Text style={homeStyles.calorieHint}>
                                    {Math.round(
                                        calorieTarget
                                            ? ((dailyTotals?.calories || 0) / calorieTarget) * 100
                                            : 0
                                    )}% de ton objectif
                                </Text>
                                <Text style={homeStyles.analysisText}>
                                    {profile?.objectif === "Perte de poids"
                                        ? "Tu gardes un bon rythme, reste sous ton seuil sans sacrifier les protéines."
                                        : profile?.objectif === "Prise de masse"
                                            ? "Tu dépasses légèrement ton objectif, c’est utile si tu veux construire de la masse."
                                            : "Ton apport est proche de l’équilibre idéal : surveille simplement les macros pour rester stable."
                                    }
                                </Text>
                            </View>

                            {/* ===================== BADGE ===================== */}
                            <View style={homeStyles.goalBadge}>
                                <Text style={homeStyles.goalBadgeText}>
                                    🎯 {profile?.objectif || "Maintien"}
                                </Text>
                            </View>
                            <Text style={homeStyles.analysisText}>
                                {profile?.objectif === "Perte de poids"
                                    ? "Tendance forte : privilégie les aliments volumineux pour te sentir rassasié sans dépasser."
                                    : profile?.objectif === "Prise de masse"
                                        ? "Ton objectif est de monter en calories, garde les glucides stables et choisis des lipides de qualité."
                                        : "Pour le maintien, fixe-toi une fourchette calorique et reste cohérent chaque jour."
                                }
                            </Text>

                            {/* ===================== CONSEIL ===================== */}
                            <Text style={homeStyles.dashboardHintModern}>
                                {profile?.objectif === "Perte de poids"
                                    ? "Déficit léger + protéines élevées pour optimiser la perte."
                                    : profile?.objectif === "Prise de masse"
                                        ? "Augmente progressivement ton apport calorique."
                                        : "Maintien stable : équilibre tes apports quotidiennement."
                                }
                            </Text>

                            {/* ===================== MACROS ===================== */}
                            <View style={homeStyles.bottomCards}>

                                {/* PROTEINES */}
                                <View style={homeStyles.macroBox}>
                                    <Text style={homeStyles.macroTitle}>Protéines</Text>

                                    <Text style={homeStyles.macroText}>
                                        {dailyTotals?.proteines || 0}g / {macroTargets?.proteines || 0}g
                                    </Text>

                                    <View style={homeStyles.macroTrack}>
                                        <View
                                            style={[
                                                homeStyles.macroFill,
                                                {
                                                    width: `${Math.min(proteinesRatio, 1) * 100}%`,
                                                    backgroundColor: "#3b82f6",
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={homeStyles.analysisText}>
                                        {proteinesRatio >= 1
                                            ? "Objectif protéines atteint, bon maintien musculaire."
                                            : "Tu peux encore gagner en protéines pour soutenir la récupération."
                                        }
                                    </Text>
                                    {proteinesRatio > 1 && (
                                        <View style={homeStyles.overflowTrackSmall}>
                                            <View
                                                style={[
                                                    homeStyles.overflowFill,
                                                    {
                                                        width: `${Math.min((proteinesRatio - 1) * 100, 100)}%`,
                                                        backgroundColor: "#dc2626",
                                                    },
                                                ]}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* GLUCIDES */}
                                <View style={homeStyles.macroBox}>
                                    <Text style={homeStyles.macroTitle}>Glucides</Text>

                                    <Text style={homeStyles.macroText}>
                                        {dailyTotals?.glucides || 0}g / {macroTargets?.glucides || 0}g
                                    </Text>

                                    <View style={homeStyles.macroTrack}>
                                        <View
                                            style={[
                                                homeStyles.macroFill,
                                                {
                                                    width: `${Math.min(glucidesRatio, 1) * 100}%`,
                                                    backgroundColor: "#f59e0b",
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={homeStyles.analysisText}>
                                        {glucidesRatio >= 1
                                            ? "Glucides couverts : énergie disponible pour tes entraînements."
                                            : "Encore un peu de glucides pour soutenir l’effort sans te fatiguer."
                                        }
                                    </Text>
                                    {glucidesRatio > 1 && (
                                        <View style={homeStyles.overflowTrackSmall}>
                                            <View
                                                style={[
                                                    homeStyles.overflowFill,
                                                    {
                                                        width: `${Math.min((glucidesRatio - 1) * 100, 100)}%`,
                                                        backgroundColor: "#dc2626",
                                                    },
                                                ]}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* LIPIDES */}
                                <View style={homeStyles.macroBox}>
                                    <Text style={homeStyles.macroTitle}>Lipides</Text>

                                    <Text style={homeStyles.macroText}>
                                        {dailyTotals?.lipides || 0}g / {macroTargets?.lipides || 0}g
                                    </Text>

                                    <View style={homeStyles.macroTrack}>
                                        <View
                                            style={[
                                                homeStyles.macroFill,
                                                {
                                                    width: `${Math.min(lipidesRatio, 1) * 100}%`,
                                                    backgroundColor: "#a855f7",
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={homeStyles.analysisText}>
                                        {lipidesRatio >= 1
                                            ? "Lipides suffisants : excellent pour la santé hormonale."
                                            : "Ajoute quelques graisses de qualité pour stabiliser ton apport."
                                        }
                                    </Text>
                                    {lipidesRatio > 1 && (
                                        <View style={homeStyles.overflowTrackSmall}>
                                            <View
                                                style={[
                                                    homeStyles.overflowFill,
                                                    {
                                                        width: `${Math.min((lipidesRatio - 1) * 100, 100)}%`,
                                                        backgroundColor: "#dc2626",
                                                    },
                                                ]}
                                            />
                                        </View>
                                    )}
                                </View>

                            </View>

                        </View>
                    </View>
                )}
                <Text style={[homeStyles.menuTitle, { paddingHorizontal: 16 }]}>Que souhaitez-vous faire ?</Text>

                <View style={{ paddingHorizontal: 16 }}>
                    <TouchableOpacity
                        style={[homeStyles.menuButton, { backgroundColor: "#2ecc71" }]}
                        onPress={() => navigation.navigate("Compose", { token })}
                    >
                        <Text style={homeStyles.menuButtonText}>Ajouter un repas</Text>
                        <Text style={homeStyles.menuButtonSub}>Rechercher un aliment et composer votre repas</Text>
                    </TouchableOpacity>
                </View>

                <View style={homeStyles.mealsSection}>
                    <Text style={homeStyles.mealsSectionTitle}>Repas enregistrés aujourd&apos;hui</Text>

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
                                    {meal.calories} kcal
                                </Text>
                                <Text style={homeStyles.mealMacros}>
                                    P: {meal.proteines}g · G: {meal.glucides}g · L: {meal.lipides}g
                                </Text>
                                <View style={homeStyles.mealActions}>
                                    <TouchableOpacity
                                        style={homeStyles.mealActionBtn}
                                        onPress={() => navigation.navigate("Compose", { token, editMealId: meal.id_repas })}
                                    >
                                        <Text style={homeStyles.mealActionEdit}>Modifier</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={homeStyles.mealActionBtn}
                                        onPress={() => handleDelete(meal)}
                                    >
                                        <Text style={homeStyles.mealActionDelete}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView >
        </>
    );
}