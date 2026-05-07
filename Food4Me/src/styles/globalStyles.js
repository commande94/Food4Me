import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#2ecc71",
        marginBottom: 20,
    },

    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },

    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#2ecc71",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});