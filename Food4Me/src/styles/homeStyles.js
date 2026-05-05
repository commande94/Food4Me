import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
    productCard: {
        marginTop: 30,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 15,
        alignItems: "center",
        width: "100%",
    },

    productImg: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },

    productName: {
        fontSize: 18,
        fontWeight: "bold",
    },

    statsContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        width: "100%",
    },
});