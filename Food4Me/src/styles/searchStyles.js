import { StyleSheet } from "react-native";

export const searchStyles = StyleSheet.create({
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
    productCard: {
        marginTop: 20,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 15,
        alignItems: "center",
        width: "100%",
    },
    productImg: {
        width: 120,
        height: 120,
        marginBottom: 10,
        borderRadius: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    brandText: {
        fontSize: 14,
        color: "#666",
        marginVertical: 5,
    },
    statsContainer: {
        marginTop: 15,
        padding: 15,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        width: "100%",
    },
    errorCard: {
        marginTop: 15,
        padding: 15,
        backgroundColor: "#ffeaa7",
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
    },
    errorText: {
        color: "#d63031",
        fontSize: 14,
        marginBottom: 10,
        textAlign: "center",
    },
    retryButton: {
        color: "#0984e3",
        fontWeight: "bold",
        fontSize: 16,
        paddingVertical: 5,
        paddingHorizontal: 15,
    },
    resultsList: {
        width: "100%",
        marginTop: 15,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#2c3e50",
    },
    resultItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: "center",
    },
    resultImg: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultName: {
        fontSize: 14,
        fontWeight: "600",
    },
    resultBrand: {
        fontSize: 12,
        color: "#666",
    },
    backToListButton: {
        alignSelf: "flex-start",
        marginBottom: 10,
    },
});