import { StyleSheet } from "react-native";

export const welcomeStyles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 20,
    },

    title: {
        fontSize: 34,
        fontWeight: "bold",
        color: "#2ecc71",
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 16,
        color: "#777",
        marginBottom: 40,
        textAlign: "center",
    },

    button: {
        width: "100%",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginVertical: 10,
    },

    register: {
        backgroundColor: "#2ecc71",
    },

    login: {
        backgroundColor: "#3498db",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

});