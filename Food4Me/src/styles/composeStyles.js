import { StyleSheet } from "react-native";

export const composeStyles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2ecc71",
    },
    backLink: {
        color: "#3498db",
        fontSize: 16,
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    foundCard: {
        marginTop: 10,
        padding: 15,
        backgroundColor: "#e8f8f5",
        borderRadius: 10,
        width: "100%",
        marginBottom: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    foundImg: {
        width: 80,
        height: 80,
        borderRadius: 8,
        alignSelf: "center",
        marginBottom: 8,
    },
    brandText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 10,
    },
    suggestionsContainer: {
        maxHeight: 220,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    suggestionRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    suggestionImg: {
        width: 44,
        height: 44,
        borderRadius: 6,
        marginRight: 10,
    },
    suggestionTextWrap: {
        flex: 1,
    },
    suggestionBrand: {
        fontSize: 12,
        color: "#888",
        marginTop: 1,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    suggestionText: {
        fontSize: 16,
        fontWeight: "500",
    },
    suggestionSub: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    listContainer: {
        marginTop: 10,
        width: "100%",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    ingredientRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 5,
    },
    ingredientItem: {
        fontSize: 16,
    },
    removeText: {
        fontSize: 18,
        color: "#e74c3c",
    },
    statsContainer: {
        marginTop: 15,
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        width: "100%",
    },
});