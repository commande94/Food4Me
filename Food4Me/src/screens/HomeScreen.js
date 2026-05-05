import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import { searchProduct } from "../services/openFoodService";
import { ajouterRepas } from "../services/foodService";
import { globalStyles } from "../styles/globalStyles";
import { homeStyles } from "../styles/homeStyles";

export default function HomeScreen({ userId }) {
    const [query, setQuery] = useState("");
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        const result = await searchProduct(query);
        setProduct(result);
        setLoading(false);
    };

    const handleAdd = async () => {
        const res = await ajouterRepas(product, userId);

        if (res.ok) {
            Alert.alert("OK", "Repas ajouté !");
        } else {
            Alert.alert("Erreur");
        }
    };

    return (
        <View styles={globalStyles.container}>
            <Text>Recherche produit</Text>

            <TextInput
                placeholder="ex: nutella"
                value={query}
                onChangeText={setQuery}
            />

            <TouchableOpacity onPress={handleSearch}>
                <Text>{loading ? "..." : "Rechercher"}</Text>
            </TouchableOpacity>

            {product && (
                <View>
                    <Image
                        source={{ uri: product.image_front_url }}
                        style={{ width: 100, height: 100 }}
                    />

                    <Text>{product.product_name}</Text>

                    <Text>
                        Calories: {product.nutriments?.["energy-kcal_100g"]}
                    </Text>

                    <TouchableOpacity onPress={handleAdd}>
                        <Text>Ajouter repas</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}