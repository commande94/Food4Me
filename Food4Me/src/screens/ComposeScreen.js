import React, { useState, useEffect, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
    ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { searchIngredients } from "../services/ingredientService";
import { createComposedMeal, getMealDetail, updateMealComposition } from "../services/foodService";
import { warmupBackend } from "../services/warmupService";
import { globalStyles } from "../styles/globalStyles";
import { composeStyles } from "../styles/composeStyles";

function generateMealName(items) {
    if (items.length === 0) return "Repas";
    if (items.length === 1) return items[0].name;
    if (items.length === 2) return `${items[0].name} + ${items[1].name}`;
    return `${items[0].name} + ${items.length - 1} autres`;
}

export default function ComposeScreen({ navigation, route }) {
    const token = route.params?.token;
    const editMealId = route.params?.editMealId ?? null;   // null = création, number = édition

    const [composeItems, setComposeItems] = useState([]);
    const [composeNomRepas, setComposeNomRepas] = useState("");
    const [composeSearch, setComposeSearch] = useState("");
    const [composeFoundList, setComposeFoundList] = useState([]);
    const [composeFound, setComposeFound] = useState(null);
    const [composeGrams, setComposeGrams] = useState("100");
    const [searching, setSearching] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    // mode édition : inline edit quantité
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingGrams, setEditingGrams] = useState("");

    const abortController = useRef(null);

    // Chargement initial en mode édition
    useEffect(() => {
        if (!editMealId) return;
        setLoadingDetail(true);
        getMealDetail(token, editMealId)
            .then((data) => {
                setComposeNomRepas(data.nom_repas || "");
                setComposeItems(
                    data.items.map((i) => ({
                        id: i.id_ingredient,
                        name: i.nom,
                        grams: Number(i.quantite_grammes),
                        cal: Number(i.calories_pour_100g),
                        prot: Number(i.proteines_pour_100g),
                        glu: Number(i.glucides_pour_100g),
                        lip: Number(i.lipides_pour_100g),
                    }))
                );
            })
            .catch(() => Alert.alert("Erreur", "Impossible de charger les ingrédients du repas."))
            .finally(() => setLoadingDetail(false));
    }, [editMealId]);

    useFocusEffect(
        React.useCallback(() => {
            if (!editMealId) warmupBackend();
        }, [editMealId])
    );

    useEffect(() => {
        const query = composeSearch.trim();

        if (!query) {
            setComposeFoundList([]);
            setSearching(false);
            if (abortController.current) {
                abortController.current.abort();
            }
            return;
        }

        if (composeFound) return;

        const delayDebounceFn = setTimeout(() => {
            performSearch(query);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [composeSearch, composeFound]);

    const performSearch = async (query) => {
        if (abortController.current) {
            abortController.current.abort();
        }

        setSearching(true);
        const controller = new AbortController();
        abortController.current = controller;

        try {
            const data = await searchIngredients(query, controller.signal);

            if (abortController.current === controller) {
                setComposeFoundList(data.ingredients?.length > 0 ? data.ingredients : []);
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setComposeFoundList([]);
            }
        } finally {
            if (abortController.current === controller) {
                setSearching(false);
            }
        }
    };

    const handleSearchChangeText = (text) => {
        setComposeSearch(text);
        if (composeFound) {
            setComposeFound(null);
        }
    };

    const selectIngredient = (ingredient) => {
        setComposeFound(ingredient);
        setComposeSearch(ingredient.nom);
        setComposeFoundList([]);
    };

    const addIngredient = () => {
        if (!composeFound || !composeGrams) return;

        const grams = parseFloat(composeGrams);
        if (isNaN(grams) || grams <= 0) {
            Alert.alert("Erreur", "Veuillez entrer une quantité valide supérieure à 0.");
            return;
        }

        const newItem = {
            id: composeFound.id_ingredient,
            name: composeFound.nom,
            grams,
            cal: parseFloat(composeFound.calories_pour_100g),
            prot: parseFloat(composeFound.proteines_pour_100g),
            glu: parseFloat(composeFound.glucides_pour_100g),
            lip: parseFloat(composeFound.lipides_pour_100g),
        };

        setComposeItems([...composeItems, newItem]);
        setComposeSearch("");
        setComposeFound(null);
        setComposeFoundList([]);
        setComposeGrams("100");
    };

    const removeIngredient = (index) => {
        setComposeItems(composeItems.filter((_, i) => i !== index));
        if (editingIndex === index) setEditingIndex(null);
    };

    const startEditGrams = (index) => {
        setEditingIndex(index);
        setEditingGrams(String(composeItems[index].grams));
    };

    const confirmEditGrams = (index) => {
        const g = parseFloat(editingGrams);
        if (!isNaN(g) && g > 0) {
            const updated = [...composeItems];
            updated[index] = { ...updated[index], grams: g };
            setComposeItems(updated);
        }
        setEditingIndex(null);
    };

    const totals = composeItems.reduce((acc, item) => {
        const ratio = item.grams / 100;
        return {
            cal: acc.cal + item.cal * ratio,
            prot: acc.prot + item.prot * ratio,
            glu: acc.glu + item.glu * ratio,
            lip: acc.lip + item.lip * ratio,
        };
    }, { cal: 0, prot: 0, glu: 0, lip: 0 });

    const handleSave = async () => {
        if (composeItems.length === 0) {
            Alert.alert("Erreur", "Ajoutez au moins un aliment.");
            return;
        }

        const mealName = composeNomRepas.trim() || generateMealName(composeItems);

        try {
            if (editMealId) {
                // MODE ÉDITION — remplace la composition existante
                await updateMealComposition(token, editMealId, {
                    nom_repas: mealName,
                    items: composeItems,
                });
                Alert.alert("Succès !", "Repas modifié !");
            } else {
                // MODE CRÉATION — chaque ingrédient est stocké séparément
                await createComposedMeal(token, {
                    nom_repas: mealName,
                    items: composeItems,
                });
                Alert.alert("Succès !", "Repas enregistré !");
            }
            setComposeItems([]);
            setComposeNomRepas("");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Erreur", "Le serveur est injoignable ou ne répond pas.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="always"
            >
                <View style={globalStyles.container}>
                    <View style={composeStyles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={composeStyles.backLink}>← Retour</Text>
                        </TouchableOpacity>
                        <Text style={composeStyles.title}>
                            {editMealId ? "Modifier le repas" : "Ajouter un repas"}
                        </Text>
                        <View style={{ width: 60 }} />
                    </View>

                    {loadingDetail && (
                        <View style={{ alignItems: "center", marginVertical: 20 }}>
                            <ActivityIndicator color="#2ecc71" />
                            <Text style={{ color: "#7f8c8d", marginTop: 8 }}>Chargement des ingrédients...</Text>
                        </View>
                    )}

                    <TextInput
                        style={globalStyles.input}
                        placeholder="Nom du repas (optionnel)"
                        value={composeNomRepas}
                        onChangeText={setComposeNomRepas}
                    />

                    <TextInput
                        style={globalStyles.input}
                        placeholder="Chercher un aliment (ex: nutella, riz, poulet...)"
                        value={composeSearch}
                        onChangeText={handleSearchChangeText}
                    />

                    {searching && (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 8 }}>
                            <ActivityIndicator color="#3498db" size="small" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#7f8c8d" }}>Recherche en cours...</Text>
                        </View>
                    )}

                    {composeFoundList.length > 0 && !composeFound && (
                        <ScrollView style={composeStyles.suggestionsContainer} nestedScrollEnabled={true}>
                            {composeFoundList.map((ing) => (
                                <TouchableOpacity
                                    key={ing.id_ingredient}
                                    style={composeStyles.suggestionItem}
                                    onPress={() => selectIngredient(ing)}
                                >
                                    <View style={composeStyles.suggestionRow}>
                                        {ing.image_front_url ? (
                                            <Image source={{ uri: ing.image_front_url }} style={composeStyles.suggestionImg} />
                                        ) : null}
                                        <View style={composeStyles.suggestionTextWrap}>
                                            <Text style={composeStyles.suggestionText}>{ing.nom}</Text>
                                            {ing.brands ? (
                                                <Text style={composeStyles.suggestionBrand}>{ing.brands}</Text>
                                            ) : null}
                                            <Text style={composeStyles.suggestionSub}>
                                                {Math.round(ing.calories_pour_100g)} kcal · P: {ing.proteines_pour_100g}g | G: {ing.glucides_pour_100g}g | L: {ing.lipides_pour_100g}g
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {composeFound && (
                        <View style={composeStyles.foundCard}>
                            {composeFound.image_front_url ? (
                                <Image source={{ uri: composeFound.image_front_url }} style={composeStyles.foundImg} />
                            ) : null}
                            <Text style={composeStyles.productName}>{composeFound.nom}</Text>
                            {composeFound.brands ? (
                                <Text style={composeStyles.brandText}>{composeFound.brands}</Text>
                            ) : null}
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Quantité en grammes"
                                value={composeGrams}
                                onChangeText={setComposeGrams}
                                keyboardType="numeric"
                            />
                            <View style={composeStyles.row}>
                                <TouchableOpacity
                                    style={[globalStyles.button, { flex: 1, backgroundColor: "#27ae60" }]}
                                    onPress={addIngredient}
                                >
                                    <Text style={globalStyles.buttonText}>Ajouter à la liste</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[globalStyles.button, { flex: 1, backgroundColor: "#95a5a6", marginLeft: 10 }]}
                                    onPress={() => {
                                        setComposeFound(null);
                                        setComposeSearch("");
                                    }}
                                >
                                    <Text style={globalStyles.buttonText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {composeItems.length > 0 && (
                        <View style={composeStyles.listContainer}>
                            <Text style={composeStyles.subtitle}>Aliments ajoutés :</Text>
                            {composeItems.map((item, idx) => (
                                <View key={idx} style={composeStyles.ingredientRow}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={composeStyles.ingredientItem}>🥄 {item.name}</Text>
                                        {editingIndex === idx ? (
                                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                                                <TextInput
                                                    style={[globalStyles.input, { flex: 1, marginBottom: 0, paddingVertical: 4 }]}
                                                    value={editingGrams}
                                                    onChangeText={setEditingGrams}
                                                    keyboardType="numeric"
                                                    autoFocus
                                                    onSubmitEditing={() => confirmEditGrams(idx)}
                                                />
                                                <Text style={{ marginLeft: 4, color: "#555" }}>g</Text>
                                                <TouchableOpacity
                                                    style={{ marginLeft: 8, backgroundColor: "#2ecc71", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}
                                                    onPress={() => confirmEditGrams(idx)}
                                                >
                                                    <Text style={{ color: "#fff", fontWeight: "600" }}>OK</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity onPress={() => startEditGrams(idx)}>
                                                <Text style={{ color: "#3498db", fontSize: 13, marginTop: 2 }}>
                                                    ✏️ {item.grams}g — toucher pour modifier
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TouchableOpacity onPress={() => removeIngredient(idx)}>
                                        <Text style={composeStyles.removeText}>❌</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {composeItems.length > 0 && (
                        <View style={composeStyles.statsContainer}>
                            <Text>🔥 Calories totales : {Math.round(totals.cal)} kcal</Text>
                            <Text>🥩 Protéines : {totals.prot.toFixed(1)}g</Text>
                            <Text>🍞 Glucides : {totals.glu.toFixed(1)}g</Text>
                            <Text>🥑 Lipides : {totals.lip.toFixed(1)}g</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            globalStyles.button,
                            { backgroundColor: composeItems.length > 0 ? "#2ecc71" : "#bdc3c7", marginTop: 15 }
                        ]}
                        onPress={handleSave}
                        disabled={composeItems.length === 0}
                    >
                        <Text style={globalStyles.buttonText}>
                            {editMealId ? "💾 Enregistrer les modifications" : "💾 Enregistrer ce repas"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
