import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f2f4f8",
        padding: 20,
        justifyContent: "space-between",
    },

    /* HEADER */
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },

    progressWrap: {
        flex: 1,
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 20,
        marginHorizontal: 10,
        overflow: "hidden",
    },

    progress: {
        height: "100%",
        backgroundColor: "#22c55e",
        borderRadius: 20,
    },

    step: {
        fontSize: 12,
        color: "#666",
    },

    /* CARD CENTER */
    card: {
        backgroundColor: "#fff",
        borderRadius: 25,
        padding: 25,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 5,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111",
    },

    subtitle: {
        fontSize: 14,
        color: "#888",
        marginBottom: 20,
    },

    /* INPUT */
    input: {
        backgroundColor: "#f9fafb",
        padding: 15,
        borderRadius: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#eee",
    },

    /* BUTTON */
    button: {
        backgroundColor: "#22c55e",
        padding: 16,
        borderRadius: 50,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#22c55e",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 3,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});