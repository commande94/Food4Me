import { StyleSheet } from "react-native";

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f2f4f8",
        paddingHorizontal: 20,
        paddingTop: 60,
        justifyContent: "space-between",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    progressWrap: {
        flex: 1,
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 20,
        marginHorizontal: 12,
        overflow: "hidden",
    },

    progress: {
        height: "100%",
        backgroundColor: "#2ecc71",
        borderRadius: 20,
    },

    step: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 5,
        alignItems: "center",
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
        marginBottom: 20,
    },

    input: {
        width: "100%",
        backgroundColor: "#f9fafb",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginTop: 10,
    },

    choiceContainer: {
        width: "100%",
        marginTop: 10,
        gap: 12,
    },

    choiceButton: {
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "transparent",
    },

    choiceSelected: {
        backgroundColor: "#2ecc71",
        borderColor: "#27ae60",
    },

    choiceText: {
        color: "#111",
        fontWeight: "600",
    },

    button: {
        backgroundColor: "#2ecc71",
        padding: 16,
        borderRadius: 50,
        alignItems: "center",
        marginBottom: 30,
        shadowColor: "#2ecc71",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    selectorBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        width: "100%",
        alignSelf: "stretch",
    },

    selectorLabel: {
        fontSize: 30,
        fontWeight: "600",
        marginBottom: 20,
        color: "#333",
    },
});
