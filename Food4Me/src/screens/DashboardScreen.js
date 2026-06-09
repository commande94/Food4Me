import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/apiConfig";
import { getDailyTotals } from "../services/foodService";

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

    const niveau = p.niveau_activite || p.niveauActivite || "";
    let activityFactor = 1.2;
    if (niveau === "Un peu actif") activityFactor = 1.375;
    else if (niveau === "Actif") activityFactor = 1.55;
    else if (niveau === "Très actif") activityFactor = 1.725;

    const maintenance = Math.round(bmr * activityFactor);
    const objectif = (p.objectif || "Maintien").toLowerCase();
    let target = maintenance;
    if (objectif.includes("perte")) target = Math.round(maintenance * 0.7);
    else if (objectif.includes("prise")) target = Math.round(maintenance * 1.15);
    return target;
};

const computeMacroTargets = (profile, calorieTarget) => {
    if (!profile || !calorieTarget) return null;

    const weight = profile.poids_kg || profile.poids || 70;
    const objectif = (profile.objectif || "Maintien").toLowerCase();
    const niveau = (profile.niveau_activite || profile.niveauActivite || "").toLowerCase();
    const gender = (profile.genre || profile.sexe || "").toLowerCase();
    const isMale = gender.startsWith("h") || gender.startsWith("m") || gender === "homme";

    // ÂGE
    const dob = profile.date_naissance || profile.dateNaissance || null;
    let age = 30;
    if (dob) {
        const b = new Date(dob);
        const today = new Date();
        age = today.getFullYear() - b.getFullYear();
        const m = today.getMonth() - b.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    }

    // PROTÉINES (g/kg) — selon objectif + niveau d'activité
    let proteinPerKg;
    if (objectif.includes("perte")) {
        if (niveau.includes("très")) proteinPerKg = 2.4;
        else if (niveau.includes("actif") && !niveau.includes("peu")) proteinPerKg = 2.2;
        else proteinPerKg = 2.0;
    } else if (objectif.includes("prise")) {
        if (niveau.includes("très")) proteinPerKg = 2.2;
        else if (niveau.includes("actif") && !niveau.includes("peu")) proteinPerKg = 2.0;
        else proteinPerKg = 1.8;
    } else {
        if (niveau.includes("très")) proteinPerKg = 1.8;
        else if (niveau.includes("actif") && !niveau.includes("peu")) proteinPerKg = 1.6;
        else proteinPerKg = 1.4;
    }
    // Ajustement âge : synthèse musculaire diminue avec l'âge
    if (age >= 60) proteinPerKg += 0.3;
    else if (age >= 40) proteinPerKg += 0.2;
    const proteines = Math.round(weight * proteinPerKg);

    // LIPIDES (% calories) — selon objectif + genre + âge
    let fatPercent;
    if (objectif.includes("perte")) fatPercent = 0.22;
    else if (objectif.includes("prise")) fatPercent = 0.28;
    else fatPercent = 0.25;
    if (!isMale) fatPercent += 0.03;
    // Après 50 ans : légèrement plus de lipides (santé hormonale et cardiovasculaire)
    if (age >= 50) fatPercent += 0.02;
    const lipides = Math.round((calorieTarget * fatPercent) / 9);

    // GLUCIDES = calories restantes après protéines et lipides
    const glucides = Math.round(Math.max(calorieTarget - (proteines * 4 + lipides * 9), 0) / 4);

    return { proteines, glucides, lipides };
};

export default function DashboardScreen() {
    const [loading, setLoading] = useState(true);
    const [weekData, setWeekData] = useState([]);
    const [limits, setLimits] = useState({
        calories: 2000,
        proteines: 150,
        glucides: 300,
        lipides: 70,
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("token");

                // Try server weekly endpoint first
                if (token) {
                    try {
                        const res = await fetch(`${API_URL}/repas/semaine`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (Array.isArray(data.week)) {
                                setWeekData(data.week);
                                setLoading(false);
                                return;
                            }
                        }
                    } catch (e) {
                        // ignore and fallback
                    }
                }

                // Fallback: use today totals and create a simple week array
                let today = null;
                try {
                    // Prefer last values saved from HomeScreen
                    const [savedTotals, savedProfile, savedCalorieTarget, savedMacroTargets] = await Promise.all([
                        AsyncStorage.getItem('lastDailyTotals'),
                        AsyncStorage.getItem('lastProfile'),
                        AsyncStorage.getItem('lastCalorieTarget'),
                        AsyncStorage.getItem('lastMacroTargets'),
                    ]);

                    if (savedTotals) {
                        today = JSON.parse(savedTotals);
                    } else {
                        today = await getDailyTotals(token);
                    }

                    const profileFromStorage = savedProfile ? JSON.parse(savedProfile) : null;
                    const calorieTargetFromProfile = savedCalorieTarget ? Number(savedCalorieTarget) : (profileFromStorage ? computeCalorieTarget(profileFromStorage) : null);
                    const macroTargetsFromProfile = savedMacroTargets ? JSON.parse(savedMacroTargets) : (profileFromStorage ? computeMacroTargets(profileFromStorage, calorieTargetFromProfile) : null);

                    const newLimits = {
                        calories: calorieTargetFromProfile || limits.calories,
                        proteines: macroTargetsFromProfile?.proteines || limits.proteines,
                        glucides: macroTargetsFromProfile?.glucides || limits.glucides,
                        lipides: macroTargetsFromProfile?.lipides || limits.lipides,
                    };
                    setLimits(newLimits);

                    // attach macros to today if available
                    if (today) {
                        today.proteines = typeof today.proteines === 'number' ? today.proteines : (macroTargetsFromProfile?.proteines || 0);
                        today.glucides = typeof today.glucides === 'number' ? today.glucides : (macroTargetsFromProfile?.glucides || 0);
                        today.lipides = typeof today.lipides === 'number' ? today.lipides : (macroTargetsFromProfile?.lipides || 0);
                    }
                } catch (e) {
                    today = await getDailyTotals(token);
                }
                const now = new Date();
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(now.getDate() - i);
                    let label;
                    if (i === 0) label = "Aujourd'hui";
                    else if (i === 1) label = "Hier";
                    else if (i === 2) label = "Avant-hier";
                    else {
                        const w = d.toLocaleDateString(undefined, { weekday: "short" });
                        const short = d.toLocaleDateString();
                        label = `${w} ${short}`;
                    }

                    days.push({
                        date: d.toISOString().slice(0, 10),
                        label,
                        calories: i === 0 ? today.calories : 0,
                        proteines: i === 0 ? today.proteines : 0,
                        glucides: i === 0 ? today.glucides : 0,
                        lipides: i === 0 ? today.lipides : 0,
                    });
                }
                // Put today's data first, then yesterday -> older
                const todayISO = new Date().toISOString().slice(0, 10);
                const todayItem = days.find((x) => x.date === todayISO);
                if (todayItem) todayItem.label = "Aujourd'hui";
                const others = days.filter((x) => x.date !== todayISO).reverse();
                const ordered = todayItem ? [todayItem, ...others] : days;
                setWeekData(ordered);
            } catch (err) {
                console.error("Erreur chargement semaine:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4ADE80" />
            </View>
        );
    }

    // use `limits` state (populated from AsyncStorage or defaults)

    const renderProgress = (value, limit) => {
        const percent = limit > 0 ? Math.round((value / limit) * 100) : 0;
        const clamped = Math.min(100, Math.max(0, percent));
        const overflow = Math.max(0, value - limit);
        const overflowPercent = limit > 0 ? Math.min(100, Math.round((overflow / limit) * 100)) : 0;
        return { percent: clamped, overflow, overflowPercent };
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Récapitulatif de la semaine</Text>
            <Text style={styles.subtitle}>Vue quotidienne — calories et macronutriments</Text>

            {weekData.map((d) => {
                const cal = renderProgress(d.calories || 0, limits.calories);
                const prot = renderProgress(d.proteines || 0, limits.proteines);
                const glu = renderProgress(d.glucides || 0, limits.glucides);
                const lip = renderProgress(d.lipides || 0, limits.lipides);

                return (
                    <View key={d.date} style={[styles.row, d.label === "Aujourd'hui" && styles.rowToday]}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={styles.day}>{d.label}</Text>
                                <Text style={styles.value}>{d.calories} kcal</Text>
                            </View>

                            <View style={{ marginTop: 8 }}>
                                <View style={styles.macroRow}>
                                    <Text style={styles.macroLabel}>Calories</Text>
                                    <View style={styles.barBackground}>
                                        <View style={[styles.barFill, { width: cal.percent + "%" }]} />
                                    </View>
                                    <Text style={styles.macroValue}>{d.calories}/{limits.calories}</Text>
                                </View>
                                {cal.overflow > 0 && (
                                    <View style={styles.overflowRow}>
                                        <View style={styles.overflowTrackSmall}>
                                            <View style={[styles.overflowFill, { width: cal.overflowPercent + "%", backgroundColor: "#ef4444" }]} />
                                        </View>
                                        <Text style={styles.overflowText}>Dépassement: -{cal.overflowPercent}% ({cal.overflow} kcal)</Text>
                                    </View>
                                )}

                                <View style={styles.macrosContainer}>
                                    {[{ key: "proteines", label: "Prot.", val: d.proteines, stats: prot, color: "#06b6d4" },
                                    { key: "glucides", label: "Gluc.", val: d.glucides, stats: glu, color: "#f59e0b" },
                                    { key: "lipides", label: "Lip.", val: d.lipides, stats: lip, color: "#f97316" }].map((m) => (
                                        <View key={m.key} style={styles.macroRowSmall}>
                                            <Text style={styles.macroLabelSmall}>{m.label}</Text>
                                            <View style={styles.barBackgroundSmall}>
                                                <View style={[styles.barFillSmall, { width: m.stats.percent + "%", backgroundColor: m.color }]} />
                                            </View>
                                            <Text style={styles.macroValueSmall}>{m.val}/{limits[m.key]}</Text>
                                            {m.stats.overflow > 0 && (
                                                <View style={styles.overflowTrackSmallSmall}>
                                                    <View style={[styles.overflowFill, { width: m.stats.overflowPercent + "%", backgroundColor: "#ef4444" }]} />
                                                    <Text style={[styles.overflowText, { marginLeft: 6, fontSize: 11 }]}>-{m.stats.overflowPercent}%</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}

            <Text style={styles.note}>
                Astuce : la barre principale représente la progression par rapport à la limite. Si tu dépasses la
                limite, la barre principale reste à 100% et l'excès est affiché dans la mini-barre rouge ci‑dessous.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingTop: 56,
        backgroundColor: "#f8fafc",
        minHeight: "100%",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 6,
        color: "#064e3b",
        marginTop: 4,
    },
    subtitle: {
        color: "#475569",
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "#ffffff",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    day: {
        width: 60,
        color: "#0f172a",
        fontWeight: "600",
    },
    barBackground: {
        flex: 1,
        height: 14,
        backgroundColor: "#eef2ff",
        borderRadius: 8,
        marginHorizontal: 12,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        backgroundColor: "#10b981",
    },
    value: {
        width: 80,
        textAlign: "right",
        color: "#0f172a",
        fontWeight: "600",
    },
    note: {
        marginTop: 18,
        color: "#64748b",
        fontSize: 12,
    },
    macroRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    macroLabel: {
        width: 70,
        color: "#0f172a",
        fontWeight: "600",
    },
    macroValue: {
        width: 80,
        textAlign: "right",
        color: "#0f172a",
        fontWeight: "600",
        marginLeft: 8,
    },
    overflowRow: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    overflowText: {
        marginLeft: 8,
        color: "#ef4444",
        fontSize: 12,
    },
    macrosContainer: {
        marginTop: 10,
    },
    macroRowSmall: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    macroLabelSmall: {
        width: 40,
        color: "#0f172a",
        fontWeight: "600",
    },
    barBackgroundSmall: {
        flex: 1,
        height: 8,
        backgroundColor: "#f1f5f9",
        borderRadius: 6,
        marginHorizontal: 10,
        overflow: "hidden",
    },
    barFillSmall: {
        height: "100%",
        backgroundColor: "#34d399",
    },
    macroValueSmall: {
        width: 60,
        textAlign: "right",
        color: "#0f172a",
    },
    overflowTrackSmallSmall: {
        width: 40,
        height: 6,
        backgroundColor: "#fee2e2",
        borderRadius: 6,
        overflow: "hidden",
        marginLeft: 8,
    },
    overflowTrackSmall: {
        width: "60%",
        height: 6,
        backgroundColor: "#fee2e2",
        borderRadius: 6,
        overflow: "hidden",
    },
    overflowFill: {
        height: "100%",
        borderRadius: 10,
    },
    rowToday: {
        backgroundColor: "#ecfdf5",
        borderColor: "#bbf7d0",
        borderWidth: 1,
    },
});
