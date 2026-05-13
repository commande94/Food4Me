import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert, ScrollView
} from "react-native";
import { searchIngredients } from "../services/ingredientService";
import { saveComposedMeal, getDailyTotals } from "../services/foodService";
import { globalStyles } from "../styles/globalStyles";
import { composeStyles } from "../styles/composeStyles";

export default function ComposeScreen({ navigation, route }) {
    const token = route.params?.token;
    const [composeItems, setComposeItems] = useState([]);
    const [composeNomRepas, setComposeNomRepas] = useState("");
    const [composeSearch, setComposeSearch] = useState("");
    const [composeFoundList, setComposeFoundList] = useState([]);
    const [composeFound, setComposeFound] = useState(null);
    const [composeGrams, setComposeGrams] = useState("100");
    const debounceRef = useRef(null);

    const handleSearchIngredient = async () => {
        const name = composeSearch.trim();
        if (!name) {
            setComposeFoundList([]);
            return;
        }
        try {
            const data = await searchIngredients(name);
            if (data.ingredients && data.ingredients.length > 0) {
                setComposeFoundList(data.ingredients);
                setComposeFound(null);
            } else {
                setComposeFoundList([]);
            }
        } catch (err) {
            setComposeFoundList([]);
        }
    };

    // Recherche en temps réel avec debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            handleSearchIngredient();
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [composeSearch]);

    const selectIngredient = (ingredient) => {
        setComposeFound(ingredient);
        setComposeFoundList([]);
    };

    const addIngredient = () => {
        if (!composeFound || !composeGrams) return;
        const grams = parseFloat(composeGrams);
        if (isNaN(grams) || grams <= 0) {
            Alert.alert("Quantité invalide");
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
        if (!composeNomRepas || composeItems.length === 0) {
            Alert.alert("Erreur", "Donnez un nom au repas et ajoutez au moins un ingrédient.");
            return;
        }

        try {
            const mealData = {
                nom_produit: composeNomRepas,
                nutriments: {
                    cal: Math.round(totals.cal),
                    prot: totals.prot,
                    glu: totals.glu,
                    lip: totals.lip,
                },
                quantite: 100,
            };
            const res = await saveComposedMeal(token, mealData);
            if (res.message) {
                Alert.alert("Succès !", "Repas sauvegardé avec ses valeurs nutritionnelles !");
                setComposeItems([]);
                setComposeNomRepas("");
                navigation.goBack();
            } else {
                Alert.alert("Erreur", res.error || "Sauvegarde impossible.");
            }
        } catch (err) {
            Alert.alert("Erreur", "Le serveur ne répond pas.");
        }
    };

    return (
        <View style={globalStyles.container}>
            <View style={composeStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={composeStyles.backLink}>← Retour</Text>
                </TouchableOpacity>
                <Text style={composeStyles.title}>Composer mon repas</Text>
                <View style={{ width: 60 }} />
            </View>

            <TextInput
                style={globalStyles.input}
                placeholder="Nom du repas (ex: Lasagnes maison)"
                value={composeNomRepas}
                onChangeText={setComposeNomRepas}
            />

            <View style={composeStyles.row}>
                <TextInput
                    style={[globalStyles.input, { flex: 2, marginBottom: 0 }]}
                    placeholder="Ingrédient (ex: poulet)"
                    value={composeSearch}
                    onChangeText={setComposeSearch}
                />
                <TouchableOpacity style={[globalStyles.button, { flex: 1, marginLeft: 10 }]} onPress={handleSearchIngredient}>
                    <Text style={globalStyles.buttonText}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Suggestions */}
            {composeFoundList.length > 0 && !composeFound && (
                <ScrollView style={composeStyles.suggestionsContainer} nestedScrollEnabled={true}>
                    {composeFoundList.map((ing) => (
                        <TouchableOpacity
                            key={ing.id_ingredient}
                            style={composeStyles.suggestionItem}
                            onPress={() => selectIngredient(ing)}
                        >
                            <Text style={composeStyles.suggestionText}>{ing.nom}</Text>
                            <Text style={composeStyles.suggestionSub}>
                                {ing.calories_pour_100g} kcal · P{ing.proteines_pour_100g} G{ing.glucides_pour_100g} L{ing.lipides_pour_100g}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {composeFound && (
                <View style={composeStyles.foundCard}>
                    <Text style={composeStyles.productName}>{composeFound.nom}</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Grammes"
                        value={composeGrams}
                        onChangeText={setComposeGrams}
                        keyboardType="numeric"
                    />
                    <View style={composeStyles.row}>
                        <TouchableOpacity style={[globalStyles.button, { flex: 1, backgroundColor: "#27ae60" }]} onPress={addIngredient}>
                            <Text style={globalStyles.buttonText}>Ajouter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.button, { flex: 1, backgroundColor: "#95a5a6", marginLeft: 10 }]} onPress={() => setComposeFound(null)}>
                            <Text style={globalStyles.buttonText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {composeItems.length > 0 && (
                <View style={composeStyles.listContainer}>
                    <Text style={composeStyles.subtitle}>Ingrédients ajoutés :</Text>
                    {composeItems.map((item, idx) => (
                        <View key={idx} style={composeStyles.ingredientRow}>
                            <Text style={composeStyles.ingredientItem}>🥄 {item.name} - {item.grams}g</Text>
                            <TouchableOpacity onPress={() => removeIngredient(idx)}>
                                <Text style={composeStyles.removeText}>❌</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <View style={composeStyles.statsContainer}>
                <Text>🔥 Calories: {Math.round(totals.cal)} kcal</Text>
                <Text>🥩 Protéines: {totals.prot.toFixed(1)}g</Text>
                <Text>🍞 Glucides: {totals.glu.toFixed(1)}g</Text>
                <Text>🥑 Lipides: {totals.lip.toFixed(1)}g</Text>
            </View>

            <TouchableOpacity style={[globalStyles.button, { backgroundColor: "#2ecc71" }]} onPress={handleSave}>
                <Text style={globalStyles.buttonText}>💾 Sauvegarder ce repas</Text>
            </TouchableOpacity>
        </View>
    );
}