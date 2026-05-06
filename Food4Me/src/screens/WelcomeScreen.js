import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { welcomeStyles } from "../styles/welcomeStyles";

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={welcomeStyles.container}>

            <Text style={welcomeStyles.title}>
                Food4Me 🍎
            </Text>

            <Text style={welcomeStyles.subtitle}>
                Mange mieux. Vis mieux.
            </Text>

            {/* BOUTON INSCRIPTION */}
            <TouchableOpacity
                style={[welcomeStyles.button, welcomeStyles.register]}
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={welcomeStyles.buttonText}>
                    Créer un compte
                </Text>
            </TouchableOpacity>

            {/* BOUTON LOGIN */}
            <TouchableOpacity
                style={[welcomeStyles.button, welcomeStyles.login]}
                onPress={() => navigation.navigate("Auth")}
            >
                <Text style={welcomeStyles.buttonText}>
                    Se connecter
                </Text>
            </TouchableOpacity>

        </View>
    );
}