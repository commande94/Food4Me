import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#f9f9f9",
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2ecc71",
        marginBottom: 40,
        textAlign: "center",
    },

    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    button: {
        backgroundColor: "#2ecc71",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

    link: {
        marginTop: 20,
        textAlign: "center",
        color: "#3498db",
    },

});

export default styles;