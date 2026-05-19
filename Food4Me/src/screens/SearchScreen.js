import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert,
    Image, ActivityIndicator, ScrollView, KeyboardAvoidingView,
    Platform
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { searchProducts } from "../services/openFoodService";
import { warmupBackend } from "../services/warmupService";
import { ajouterRepas } from "../services/foodService";
import { globalStyles } from "../styles/globalStyles";
import { searchStyles } from "../styles/searchStyles";

export default function SearchScreen({ navigation, route }) {
    const token = route.params?.token;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState("100");
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [loadingMsg, setLoadingMsg] = useState("Recherche dans la base de données...");

    const abortController = useRef(null);
    const warmupFired = useRef(false);

    useFocusEffect(
        React.useCallback(() => {
            warmupFired.current = false;
            warmupBackend();
        }, [])
    );

    const handleChangeText = (text) => {
        setSearchQuery(text);
        if (!warmupFired.current && text.length >= 1) {
            warmupFired.current = true;
            warmupBackend();
        }
    };

    const handleSearch = async () => {
        const query = searchQuery.trim();
        if (!query || loading) return;

        if (abortController.current) abortController.current.abort();

        setLoading(true);
        setSearchError(null);
        setSearchResults([]);
        setSelectedProduct(null);
        setLoadingMsg("Recherche dans la base de données...");

        const controller = new AbortController();
        abortController.current = controller;

        const slowTimer = setTimeout(() => {
            if (abortController.current === controller) {
                setLoadingMsg("Le serveur se réveille, encore quelques secondes...");
            }
        }, 5000);

        try {
            const data = await searchProducts(token, query, controller.signal);
            if (abortController.current !== controller) return;

            if (data.products && data.products.length > 0) {
                setSearchResults(data.products);
            } else {
                setSearchError({ message: data.message || "Aucun résultat pour cette recherche." });
            }
        } catch (error) {
            if (error.name === "AbortError") return;
            if (abortController.current !== controller) return;
            setSearchError({ message: error.message || "Impossible de contacter le serveur." });
        } finally {
            clearTimeout(slowTimer);
            if (abortController.current === controller) {
                setLoading(false);
                setLoadingMsg("Recherche dans la base de données...");
            }
        }
    };

    const handleAdd = async () => {
        if (!selectedProduct) return;

        const grams = parseFloat(quantity);
        if (!grams || grams <= 0) {
            Alert.alert("Erreur", "Entre une quantité valide en grammes.");
            return;
        }

        const ratio = grams / 100;
        const nutriments = selectedProduct.nutriments || {};

        const produitAvecQuantite = {
            ...selectedProduct,
            quantite_g: grams,
            nutriments: {
                ...nutriments,
                "energy-kcal_100g": (nutriments["energy-kcal_100g"] || 0) * ratio,
                proteins_100g: (nutriments.proteins_100g || 0) * ratio,
                carbohydrates_100g: (nutriments.carbohydrates_100g || 0) * ratio,
                fat_100g: (nutriments.fat_100g || 0) * ratio,
            }
        };

        try {
            const res = await ajouterRepas(token, produitAvecQuantite);
            if (res.message) {
                Alert.alert("Succès !", "Données nutritionnelles sauvegardées !");
                setSelectedProduct(null);
                setSearchResults([]);
                setQuantity("100");
                navigation.goBack();
            } else {
                Alert.alert("Erreur", res.error || "Vérifie que le profil existe en base.");
            }
        } catch (error) {
            Alert.alert("Erreur", "Le serveur ne répond pas");
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
                    {/* HEADER */}
                    <View style={searchStyles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={searchStyles.backLink}>← Retour</Text>
                        </TouchableOpacity>
                        <Text style={searchStyles.title}>Chercher un aliment</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    {/* CHAMP DE RECHERCHE */}
                    <TextInput
                        style={globalStyles.input}
                        placeholder="Ex: Nutella, pomme, steak..."
                        value={searchQuery}
                        onChangeText={handleChangeText}
                        onSubmitEditing={handleSearch}
                        editable={!loading}
                    />

                    <TouchableOpacity
                        style={[globalStyles.button, { backgroundColor: loading ? "#bdc3c7" : "#3498db", marginBottom: 15 }]}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        <Text style={globalStyles.buttonText}>
                            {loading ? "⌛ Recherche..." : "🔍 Rechercher"}
                        </Text>
                    </TouchableOpacity>

                    {loading && (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 }}>
                            <ActivityIndicator color="#3498db" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#7f8c8d" }}>{loadingMsg}</Text>
                        </View>
                    )}

                    {searchError && !loading && (
                        <View style={searchStyles.errorCard}>
                            <Text style={searchStyles.errorText}>{searchError.message}</Text>
                        </View>
                    )}

                    {/* LISTE DES RÉSULTATS */}
                    {searchResults.length > 0 && !selectedProduct && !loading && (
                        <View style={searchStyles.resultsList}>
                            <Text style={searchStyles.resultsTitle}>Produits trouvés :</Text>
                            {searchResults.map((product, index) => (
                                <TouchableOpacity
                                    key={product.code || index.toString()}
                                    style={searchStyles.resultItem}
                                    onPress={() => { setSelectedProduct(product); setQuantity("100"); }}
                                >
                                    {product.image_front_url && (
                                        <Image source={{ uri: product.image_front_url }} style={searchStyles.resultImg} />
                                    )}
                                    <View style={searchStyles.resultTextContainer}>
                                        <Text style={searchStyles.resultName} numberOfLines={2}>{product.product_name || "Sans nom"}</Text>
                                        <Text style={searchStyles.resultBrand}>{product.brands || "Marque inconnue"}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* FICHE PRODUIT */}
                    {selectedProduct && (
                        <View style={searchStyles.productCard}>
                            <TouchableOpacity style={searchStyles.backToListButton} onPress={() => setSelectedProduct(null)}>
                                <Text style={searchStyles.backLink}>← Retour à la liste</Text>
                            </TouchableOpacity>
                            {selectedProduct.image_front_url && (
                                <Image source={{ uri: selectedProduct.image_front_url }} style={searchStyles.productImg} />
                            )}
                            <Text style={searchStyles.productName}>{selectedProduct.product_name || "Produit inconnu"}</Text>
                            <Text style={searchStyles.brandText}>{selectedProduct.brands || "Marque inconnue"}</Text>

                            <View style={searchStyles.statsContainer}>
                                <Text style={{ marginBottom: 6, fontWeight: "600" }}>
                                    Valeurs pour {quantity || "100"} g
                                </Text>
                                <Text>
                                    🔥 Calories: {Math.round((selectedProduct.nutriments?.["energy-kcal_100g"] || 0) * (parseFloat(quantity || 100) / 100))} kcal
                                </Text>
                                <Text>
                                    🥩 Protéines: {((selectedProduct.nutriments?.proteins_100g || 0) * (parseFloat(quantity || 100) / 100)).toFixed(1)}g
                                </Text>
                                <Text>
                                    🍞 Glucides: {((selectedProduct.nutriments?.carbohydrates_100g || 0) * (parseFloat(quantity || 100) / 100)).toFixed(1)}g
                                </Text>
                                <Text>
                                    🥑 Lipides: {((selectedProduct.nutriments?.fat_100g || 0) * (parseFloat(quantity || 100) / 100)).toFixed(1)}g
                                </Text>
                            </View>

                            {/* QUANTITÉ */}
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ marginBottom: 5, fontWeight: "bold" }}>Quantité (g)</Text>
                                <TextInput
                                    style={globalStyles.input}
                                    keyboardType="numeric"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    placeholder="Ex: 150"
                                />
                            </View>

                            <TouchableOpacity
                                style={[globalStyles.button, { backgroundColor: "#3498db", marginTop: 15 }]}
                                onPress={handleAdd}
                            >
                                <Text style={globalStyles.buttonText}>✓ Ajouter ce repas</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}