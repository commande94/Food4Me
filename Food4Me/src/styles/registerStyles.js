import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
    },

    /* PROGRESS */
    progressContainer: {
        marginTop: 20,
    },

    progressText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
    },

    progressBar: {
        height: 6,
        backgroundColor: "#e5e5e5",
        borderRadius: 10,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        backgroundColor: "#2ecc71",
    },

    /* BACK */
    backButton: {
        position: "absolute",
        top: 50,
        left: 15,
    },

    /* CONTENT */
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    card: {
        width: "100%",
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        alignItems: "center",
    },

    label: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 20,
        color: "#222",
    },

    input: {
        width: "100%",
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
    },

    /* CHOICES */
    choice: {
        width: "100%",
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        marginBottom: 10,
        alignItems: "center",
    },

    choiceActive: {
        backgroundColor: "#2ecc71",
    },

    choiceText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },

    /* NEXT BUTTON */
    nextButton: {
        backgroundColor: "#2ecc71",
        padding: 18,
        borderRadius: 50,
        alignItems: "center",
        marginBottom: 20,
    },

    nextText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});