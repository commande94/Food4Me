import React, { useState, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Alert,
    Image, ActivityIndicator, ScrollView
} from "react-native";
import { searchProducts } from "../services/openFoodService";
import { ajouterRepas, getDailyTotals } from "../services/foodService";
import { globalStyles } from "../styles/globalStyles";
import { searchStyles } from "../styles/searchStyles";

export default function SearchScreen({ navigation, route }) {
    const token = route.params?.token;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searchKey, setSearchKey] = useState(0);
    const abortController = useRef(null);

    const handleSearch = (autoRetry = false) => {
        const query = searchQuery.trim();
        if (!query || loading) return;

        if (abortController.current) abortController.current.abort();

        setLoading(true);
        setSearchError(null);
        setSearchResults([]);
        setSelectedProduct(null);
        setSearchKey(prev => prev + 1);

        const controller = new AbortController();
        abortController.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        searchProducts(token, query, controller.signal)
            .then(data => {
                clearTimeout(timeoutId);
                if (data.products && data.products.length > 0) {
                    setSearchResults(data.products);
                } else {
                    setSearchError({ message: "Aucun résultat pour cette recherche." });
                }
                setLoading(false);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                if (error.message === "RATE_LIMIT") {
                    setSearchError({ message: "Trop de requêtes, veuillez patienter 1 minute." });
                } else if (error.message === "SERVICE_UNAVAILABLE") {
                    setSearchError({ message: "Service Open Food Facts momentanément indisponible. Nouvelle tentative automatique dans 5 secondes..." });
                    setTimeout(() => handleSearch(true), 5000);
                } else if (error.name === "AbortError") {
                    setSearchError({ message: "Délai dépassé. Le serveur ne répond pas." });
                } else {
                    setSearchError({ message: "Impossible de contacter le serveur." });
                    if (!autoRetry) setTimeout(() => handleSearch(true), 5000);
                }
                setLoading(false);
            });
    };

    const handleAdd = async () => {
        if (!selectedProduct) return;
        try {
            const res = await ajouterRepas(token, selectedProduct);
            if (res.message) {
                Alert.alert("Succès !", "Données nutritionnelles sauvegardées !");
                setSelectedProduct(null);
                setSearchResults([]);
                navigation.goBack(); // retour au menu
            } else {
                Alert.alert("Erreur BDD", res.error || "Vérifie que le profil existe en base.");
            }
        } catch (error) {
            Alert.alert("Erreur", "Le serveur ne répond pas");
        }
    };

    return (
        <View style={globalStyles.container}>
            <View style={searchStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={searchStyles.backLink}>← Retour</Text>
                </TouchableOpacity>
                <Text style={searchStyles.title}>Recherche</Text>
                <View style={{ width: 60 }} />
            </View>

            <TextInput
                style={globalStyles.input}
                placeholder="Ex: Nutella, pomme, steak..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch(false)}
            />

            <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: loading ? "#95a5a6" : "#2ecc71" }]}
                onPress={() => handleSearch(false)}
                disabled={loading}
            >
                {loading ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                        <Text style={globalStyles.buttonText}>Recherche...</Text>
                    </View>
                ) : (
                    <Text style={globalStyles.buttonText}>Chercher sur OpenFoodFacts</Text>
                )}
            </TouchableOpacity>

            {searchError && (
                <View style={searchStyles.errorCard}>
                    <Text style={searchStyles.errorText}>{searchError.message}</Text>
                    <TouchableOpacity onPress={() => handleSearch(false)}>
                        <Text style={searchStyles.retryButton}>↻ Réessayer</Text>
                    </TouchableOpacity>
                </View>
            )}

            {searchResults.length > 0 && !selectedProduct && (
                <ScrollView key={searchKey} style={searchStyles.resultsList}>
                    <Text style={searchStyles.resultsTitle}>Produits trouvés :</Text>
                    {searchResults.map((product, index) => (
                        <TouchableOpacity
                            key={product.code || index.toString()}
                            style={searchStyles.resultItem}
                            onPress={() => setSelectedProduct(product)}
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
                </ScrollView>
            )}

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
                        <Text>🔥 Calories: {Math.round(selectedProduct.nutriments?.["energy-kcal_100g"] || 0)} kcal</Text>
                        <Text>🥩 Protéines: {selectedProduct.nutriments?.proteins_100g || 0}g</Text>
                        <Text>🍞 Glucides: {selectedProduct.nutriments?.carbohydrates_100g || 0}g</Text>
                        <Text>🥑 Lipides: {selectedProduct.nutriments?.fat_100g || 0}g</Text>
                    </View>
                    <TouchableOpacity style={[globalStyles.button, { backgroundColor: "#3498db", marginTop: 15 }]} onPress={handleAdd}>
                        <Text style={globalStyles.buttonText}>✓ Ajouter ce repas</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}