import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { searchProduct } from "../services/openFoodService";
import { ajouterRepas } from "../services/foodService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen({ navigation, route }) {

    const userId = route?.params?.userId;

    const [query, setQuery] = useState("");
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {

        if (!query) {
            Alert.alert("Erreur", "Tape un produit");
            return;
        }

        setLoading(true);

        const result = await searchProduct(query);

        setProduct(result);

        setLoading(false);
    };

    const handleAdd = async () => {

        const res = await ajouterRepas(product, userId);

        if (res?.ok) {
            Alert.alert("Succès", "Repas ajouté !");
        } else {
            Alert.alert("Erreur");
        }
    };

    return (
        <View style={globalStyles.container}>

            {/* HEADER */}
            <Text style={globalStyles.title}>
                Food4Me 🍎
            </Text>

            <Text style={{ color: "#666", marginBottom: 20 }}>
                Rechercher un aliment et analyser ses valeurs nutritionnelles
            </Text>

            {/* SEARCH */}
            <TextInput
                style={globalStyles.input}
                placeholder="Ex: Nutella, banane..."
                value={query}
                onChangeText={setQuery}
            />

            <TouchableOpacity style={globalStyles.button} onPress={handleSearch}>
                <Text style={globalStyles.buttonText}>
                    {loading ? "Recherche..." : "Rechercher"}
                </Text>
            </TouchableOpacity>

            {/* LOADING */}
            {loading && (
                <ActivityIndicator
                    size="large"
                    color="#2ecc71"
                    style={{ marginTop: 20 }}
                />
            )}

            {/* RESULT */}
            {product && (
                <View style={homeStyles.card}>

                    <Image
                        source={{ uri: product.image_front_url }}
                        style={homeStyles.image}
                    />

                    <Text style={homeStyles.name}>
                        {product.product_name || "Produit inconnu"}
                    </Text>

                    <Text style={homeStyles.calories}>
                        🔥 Calories : {product.nutriments?.["energy-kcal_100g"] || "N/A"}
                    </Text>

                    <TouchableOpacity
                        style={globalStyles.button}
                        onPress={handleAdd}
                    >
                        <Text style={globalStyles.buttonText}>
                            Ajouter au journal
                        </Text>
                    </TouchableOpacity>

                </View>
            )}

            {/* EMPTY STATE */}
            {!product && !loading && (
                <Text style={{ marginTop: 40, color: "#aaa", textAlign: "center" }}>
                    Aucun produit recherché
                </Text>
            )}

        </View>
    );
}