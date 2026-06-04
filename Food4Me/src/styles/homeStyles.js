import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({

    // CARD PRODUIT
    card: {
        marginTop: 25,
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
    },

    // HEADER
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 7,
        marginTop: 10,
        paddingTop: 30,
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2ecc71",
    },

    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#e74c3c",
        borderRadius: 8,
    },

    logoutButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },

    // MENU
    menuTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 22,
        marginTop: 16,
    },

    menuButton: {
        width: "100%",

        paddingVertical: 16,

        borderRadius: 12,
        marginBottom: 12,

        alignItems: "center",
    },

    menuButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 4,
    },

    menuButtonSub: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 12,
    },

    // DAILY CARD
    dailyCard: {
        width: "100%",

        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },

        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    dailyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2c3e50",
        marginBottom: 10,
        textAlign: "center",
    },

    dailyRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
    },

    dailyMacro: {
        fontSize: 13,
        color: "#555",
        marginVertical: 3,
        width: "45%",
        textAlign: "center",
    },

    // SUMMARY
    summaryCard: {
        width: "100%",

        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4
        },

        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },

    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        flexWrap: "wrap",
    },

    summaryLabel: {
        fontSize: 16,
        color: "#7f8c8d",
        marginBottom: 6,
    },

    summaryNumber: {
        fontSize: 42,
        fontWeight: "900",
        color: "#e67e22",
    },

    summaryTargetBox: {
        backgroundColor: "#f1c40f",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 120,
    },

    summaryTargetLabel: {
        fontSize: 12,
        color: "#34495e",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },

    summaryTargetNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: "#34495e",
    },

    summaryHint: {
        color: "#2c3e50",
        fontSize: 14,
        textAlign: "center",
    },

    // OBJECTIF
    objectiveCard: {
        width: "100%",

        backgroundColor: "#ecf0f1",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,

        borderWidth: 1,
        borderColor: "#dfe6e9",
    },

    objectiveTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: 8,
    },

    objectiveText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0984e3",
        marginBottom: 10,
    },

    objectiveHint: {
        fontSize: 14,
        color: "#636e72",
        lineHeight: 20,
    },

    // BIG CALORIES
    bigCaloriesCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 18,
        marginTop: 10,
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },

        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },

    bigCaloriesNumber: {
        fontSize: 44,
        fontWeight: "900",
        color: "#e67e22",
    },

    bigCaloriesLabel: {
        fontSize: 14,
        color: "#777",
        marginTop: 6,
        marginBottom: 8,
    },

    dailyRowSmall: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    dashboardCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 28,
        paddingVertical: 30,
        paddingHorizontal: 24,
        marginBottom: 20,
        alignItems: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 6,
    },

    calorieBigNumber: {
        fontSize: 54,
        fontWeight: "900",
        color: "#ff7a00",
        lineHeight: 58,
    },

    calorieSubText: {
        fontSize: 16,
        color: "#7f8c8d",
        marginTop: 4,
    },

    goalBadge: {
        backgroundColor: "#eef6ff",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 999,
        marginBottom: 14,
    },

    goalBadgeText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0984e3",
    },

    remainingCalories: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2d3436",
        marginBottom: 12,
    },

    dashboardHintModern: {
        textAlign: "center",
        color: "#636e72",
        lineHeight: 22,
        fontSize: 14,
        paddingHorizontal: 10,
    },

    modernDashboard: {
        backgroundColor: "transparent",
        borderRadius: 30,
        padding: 20,
        marginTop: 20,
    },
    gaugeSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    sideStat: {
        alignItems: "center",
        width: 80,
    },

    statLabel: {
        fontSize: 12,
        color: "#666",
    },

    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2c3e50",
    },

    gaugeCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 18,
        borderColor: "#2ecc71",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.4)",
    },

    gaugeInner: {
        alignItems: "center",
    },

    gaugeSmallText: {
        fontSize: 12,
        color: "#555",
    },

    gaugeBigText: {
        fontSize: 28,
        fontWeight: "900",
        color: "#2c3e50",
    },

    gaugeSubText: {
        fontSize: 12,
        color: "#888",
    },

    goalBadge: {
        marginTop: 15,
        backgroundColor: "#2ecc71",
        padding: 10,
        borderRadius: 20,
        alignSelf: "center",
    },

    goalBadgeText: {
        color: "#fff",
        fontWeight: "bold",
    },

    dashboardHintModern: {
        marginTop: 10,
        textAlign: "center",
        color: "#555",
        fontSize: 13,
    },

    bottomCards: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    miniCard: {
        flex: 1,
        backgroundColor: "#fff",
        marginHorizontal: 4,
        borderRadius: 16,
        padding: 10,
        alignItems: "center",
        elevation: 2,
    },

    miniTitle: {
        fontSize: 12,
        color: "#777",
    },

    miniValue: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 6,
    },

    bar: {
        width: "80%",
        height: 4,
        backgroundColor: "#2ecc71",
        borderRadius: 10,
    },
    dashboardWrapper: {
        backgroundColor: "#d4fee6",
        borderRadius: 30,
        padding: 10,
        width: "100%",
        marginTop: 0,
        marginBottom: 20,

        overflow: "hidden",

        // effet premium
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    mealsSection: {
        width: "100%",
        marginTop: 8,
        paddingHorizontal: 16,
    },

    mealsSectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: 12,
    },

    mealCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },

    mealHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
    },

    mealName: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: "#2c3e50",
        marginRight: 8,
    },

    mealTime: {
        fontSize: 12,
        color: "#888",
    },

    mealCalories: {
        fontSize: 15,
        fontWeight: "600",
        color: "#e67e22",
        marginBottom: 4,
    },

    mealMacros: {
        fontSize: 12,
        color: "#666",
    },

    mealActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 8,
    },

    mealActionBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },

    mealActionEdit: {
        fontSize: 13,
        color: "#3498db",
        fontWeight: "600",
    },

    mealActionDelete: {
        fontSize: 13,
        color: "#e74c3c",
        fontWeight: "600",
    },

    mealsEmpty: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },

    mealsEmptyText: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
    horizontalDashboard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginTop: 10,
    },

    mainCard: {
        flex: 2,
        backgroundColor: "#1e1e1e",
        borderRadius: 16,
        padding: 16,
    },

    sideCard: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    bigCalories: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },

    caloriesSub: {
        color: "#aaa",
        marginBottom: 10,
    },

    progressBackground: {
        height: 8,
        backgroundColor: "#333",
        borderRadius: 10,
        overflow: "hidden",
        marginVertical: 10,
    },

    progressFill: {
        height: "100%",
        borderRadius: 10,
    },

    progressText: {
        color: "#aaa",
        fontSize: 12,
        textAlign: "right",
    },

    statLabel: {
        color: "#aaa",
        fontSize: 12,
        marginBottom: 6,
        textAlign: "center",
    },

    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
});