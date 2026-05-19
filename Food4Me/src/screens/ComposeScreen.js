import React, { useState, useEffect, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator
} from "react-native";
import { searchIngredients } from "../services/ingredientService";
import { saveComposedMeal } from "../services/foodService";
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
    const [searching, setSearching] = useState(false);

    // Référence persistante pour stocker l'AbortController actuel
    const abortController = useRef(null);

    // Effet principal de recherche en temps réel (Debounce de 400ms)
    useEffect(() => {
        const query = composeSearch.trim();

        // Si la barre de recherche est vidée
        if (!query) {
            setComposeFoundList([]);
            setSearching(false);
            if (abortController.current) {
                abortController.current.abort();
            }
            return;
        }

        // Si un ingrédient est déjà sélectionné et affiché, on bloque la recherche automatique
        if (composeFound) return;

        // Déclenche le chrono d'anti-rebond (debounce)
        const delayDebounceFn = setTimeout(() => {
            performSearch(query);
        }, 400);

        // Nettoyage si l'utilisateur tape une autre lettre avant la fin des 400ms
        return () => clearTimeout(delayDebounceFn);
    }, [composeSearch]);

    // Fonction qui exécute l'appel API de recherche
    const performSearch = async (query) => {
        // Annule la requête précédente en cours si elle existe
        if (abortController.current) {
            abortController.current.abort();
        }

        setSearching(true);
        const controller = new AbortController();
        abortController.current = controller;

        try {
            const data = await searchIngredients(query, controller.signal);

            // On vérifie que la réponse correspond bien à notre dernière saisie
            if (abortController.current === controller) {
                if (data.ingredients && data.ingredients.length > 0) {
                    setComposeFoundList(data.ingredients);
                } else {
                    setComposeFoundList([]);
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            setComposeFoundList([]);
        } finally {
            if (abortController.current === controller) {
                setSearching(false);
            }
        }
    };

    // Gestion de la modification du texte de recherche
    const handleSearchChangeText = (text) => {
        setComposeSearch(text);
        if (composeFound) {
            // Si on modifie le texte alors qu'un ingrédient était sélectionné, on réinitialise la sélection
            setComposeFound(null);
        }
    };

    // Sélection d'un ingrédient dans la liste des suggestions
    const selectIngredient = (ingredient) => {
        setComposeFound(ingredient);
        setComposeSearch(ingredient.nom); // Remplit l'input avec le nom exact sélectionné
        setComposeFoundList([]);          // Masque la liste de suggestions
    };

    // Ajout de l'ingrédient sélectionné au repas en cours de composition
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

        // Réinitialisation des champs de recherche pour l'ingrédient suivant
        setComposeSearch("");
        setComposeFound(null);
        setComposeFoundList([]);
        setComposeGrams("100");
    };

    // Suppression d'un ingrédient de la liste locale
    const removeIngredient = (index) => {
        setComposeItems(composeItems.filter((_, i) => i !== index));
    };

    // Calcul des totaux nutritionnels cumulés en temps réel
    const totals = composeItems.reduce((acc, item) => {
        const ratio = item.grams / 100;
        return {
            cal: acc.cal + item.cal * ratio,
            prot: acc.prot + item.prot * ratio,
            glu: acc.glu + item.glu * ratio,
            lip: acc.lip + item.lip * ratio,
        };
    }, { cal: 0, prot: 0, glu: 0, lip: 0 });

    // Sauvegarde finale du repas complet sur le serveur
    const handleSave = async () => {
        if (!composeNomRepas.trim() || composeItems.length === 0) {
            Alert.alert("Erreur", "Donnez un nom au repas et ajoutez au moins un ingrédient.");
            return;
        }

        try {
            const mealData = {
                nom_produit: composeNomRepas.trim(),
                nutriments: {
                    cal: Math.round(totals.cal),
                    prot: parseFloat(totals.prot.toFixed(1)),
                    glu: parseFloat(totals.glu.toFixed(1)),
                    lip: parseFloat(totals.lip.toFixed(1)),
                },
                quantite: 100, // Ajustable selon les exigences de ton API globale
            };

            const res = await saveComposedMeal(token, mealData);
            if (res.message) {
                Alert.alert("Succès !", "Repas sauvegardé avec succès !");
                setComposeItems([]);
                setComposeNomRepas("");
                navigation.goBack();
            } else {
                Alert.alert("Erreur", res.error || "Impossible de sauvegarder le repas.");
            }
        } catch (err) {
            Alert.alert("Erreur", "Le serveur est injoignable ou ne répond pas.");
        }
    };

    return (
        <View style={globalStyles.container}>
            {/* Barre d'en-tête */}
            <View style={composeStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={composeStyles.backLink}>← Retour</Text>
                </TouchableOpacity>
                <Text style={composeStyles.title}>Composer mon repas</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Input : Nom de la recette globale */}
            <TextInput
                style={globalStyles.input}
                placeholder="Nom du repas (ex: Lasagnes maison)"
                value={composeNomRepas}
                onChangeText={setComposeNomRepas}
            />

            {/* Input : Recherche automatique d'ingrédient */}
            <View style={composeStyles.row}>
                <TextInput
                    style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Chercher un ingrédient (ex: riz, poulet...)"
                    value={composeSearch}
                    onChangeText={handleSearchChangeText}
                />
            </View>

            {/* Indicateur de chargement asynchrone */}
            {searching && (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 8 }}>
                    <ActivityIndicator color="#3498db" size="small" style={{ marginRight: 8 }} />
                    <Text style={{ color: "#7f8c8d" }}>Recherche en cours...</Text>
                </View>
            )}

            {/* Liste des suggestions d'ingrédients trouvés */}
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
                                {Math.round(ing.calories_pour_100g)} kcal · P: {ing.proteines_pour_100g}g | G: {ing.glucides_pour_100g}g | L: {ing.lipides_pour_100g}g
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Formulaire d'ajout de quantité pour l'ingrédient sélectionné */}
            {composeFound && (
                <View style={composeStyles.foundCard}>
                    <Text style={composeStyles.productName}>{composeFound.nom}</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Quantité en grammes"
                        value={composeGrams}
                        onChangeText={setComposeGrams}
                        keyboardType="numeric"
                    />
                    <View style={composeStyles.row}>
                        <TouchableOpacity style={[globalStyles.button, { flex: 1, backgroundColor: "#27ae60" }]} onPress={addIngredient}>
                            <Text style={globalStyles.buttonText}>Ajouter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.button, { flex: 1, backgroundColor: "#95a5a6", marginLeft: 10 }]} onPress={() => {
                            setComposeFound(null);
                            setComposeSearch("");
                        }}>
                            <Text style={globalStyles.buttonText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Liste visuelle des ingrédients déjà ajoutés à la composition */}
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

            {/* Tableau récapitulatif des valeurs nutritionnelles totales */}
            <View style={composeStyles.statsContainer}>
                <Text>🔥 Calories totales: {Math.round(totals.cal)} kcal</Text>
                <Text>🥩 Protéines: {totals.prot.toFixed(1)}g</Text>
                <Text>🍞 Glucides: {totals.glu.toFixed(1)}g</Text>
                <Text>🥑 Lipides: {totals.lip.toFixed(1)}g</Text>
            </View>

            {/* Bouton de soumission global */}
            <TouchableOpacity style={[globalStyles.button, { backgroundColor: "#2ecc71" }]} onPress={handleSave}>
                <Text style={globalStyles.buttonText}>💾 Sauvegarder ce repas</Text>
            </TouchableOpacity>
        </View>
    );
}