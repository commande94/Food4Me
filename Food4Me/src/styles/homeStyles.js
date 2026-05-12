import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({

    card: {
        marginTop: 25,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 18,
        alignItems: "center",
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    image: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 15,
        backgroundColor: "#f2f2f2",
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },

    calories: {
        fontSize: 15,
        color: "#444",
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderRadius: 10,
        width: "100%",
        textAlign: "center",
        marginBottom: 15,
    }

});