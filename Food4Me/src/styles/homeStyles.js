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
        backgroundColor: "#ffffff",
        borderRadius: 32,
        padding: 18,
        marginTop: 20,
        shadowColor: "#0b3d91",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 8,
    },
    screen: {
        flex: 1,
        backgroundColor: "transparent",
    },

    pageSplitWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "column",
        zIndex: 0,
    },

    pageSplitTop: {
        flex: 0.6,
        position: "relative",
        overflow: "hidden",
    },

    pageBlendGreen: {
        position: "absolute",
        top: -10,
        left: -40,
        right: -20,
        height: 300,
        backgroundColor: "#7EE7B1",
        opacity: 0.92,
        transform: [{ rotate: "-6deg" }],
        borderBottomRightRadius: 56,
    },

    pageBlendOrange: {
        position: "absolute",
        top: -8,
        right: -40,
        left: -20,
        height: 290,
        backgroundColor: "#FFB78B",
        opacity: 0.9,
        transform: [{ rotate: "6deg" }],
        borderBottomLeftRadius: 56,
    },

    pageSplitBottom: {
        flex: 0.4,
        backgroundColor: "#f5f0e1", // beige en bas
    },

    dashboardBackground: {
        width: "100%",
        borderRadius: 12,
        padding: 12,
        backgroundColor: "transparent",
        marginTop: 12,
        marginBottom: 20,
        marginHorizontal: 0,
    },

    dashboardCard: {
        backgroundColor: "#ffffff",
        borderRadius: 28,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 6,
    },

    cardHeader: {
        marginBottom: 18,
    },

    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingTop: 18,
    },

    logoContainer: {
        width: 64,
        alignItems: "center",
        justifyContent: "center",
    },

    logoBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#e6f5e8",
        borderWidth: 1,
        borderColor: "#cfe8d6",
    },

    cardHeaderText: {
        flex: 1,
    },

    brandTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#166534",
    },
    topContainer: {
        width: "100%",
        backgroundColor: "transparent",
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 8,
        zIndex: 10,
    },

    topBox: {
        width: "100%",
        height: 72,
        borderRadius: 0,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        paddingLeft: 6,
        paddingRight: 12,
    },

    topLogo: {
        width: 60,
        height: 80,
        borderRadius: 0,
        backgroundColor: "transparent",
        marginLeft: 0,
    },

    topLogoBg: {
        backgroundColor: "#f9f9f9",
        padding: 6,
        borderRadius: 12,
        marginLeft: 0,
        zIndex: 3,
    },

    topBoxText: {
        fontSize: 22,
        fontWeight: "900",
        color: "#f9f9f9",
    },
    topWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },

    containerTop: {
        flexDirection: "row",
        backgroundColor: "transparent",
        borderBottomWidth: 0.5,
        borderBottomColor: "#f9f9f9",
        height: 120,
        shadowOpacity: 0.12,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingTop: 10,
        paddingBottom: 10,
        overflow: "hidden",
        shadowOpacity: 0.08,
        shadowRadius: 15,
        shadowOffset: {
            width: 0,
            height: 5
        },

        elevation: 8,
    },

    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        flexDirection: "row",
        zIndex: 1,
    },
    cardMainGauge: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        marginBottom: 14,
    },

    bigCalValue: {
        fontSize: 52,
        fontWeight: "900",
        color: "#0f3c1f",
        lineHeight: 56,
    },

    bigCalUnit: {
        fontSize: 14,
        color: "#6b8f6e",
        marginTop: 4,
    },

    exceededColor: {
        color: "#b91c1c",
    },

    exceededText: {
        marginTop: 8,
        fontSize: 13,
        color: "#b91c1c",
        fontWeight: "700",
    },

    withinText: {
        marginTop: 8,
        fontSize: 13,
        color: "#2f6f3a",
        fontWeight: "700",
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#0f3c1f",
        marginBottom: 4,
    },

    inlineCalorieTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0f3c1f",
        marginBottom: 4,
    },

    inlineCalorieValue: {
        fontSize: 38,
        fontWeight: "900",
        color: "#15803d",
        marginBottom: 4,
    },

    inlineCalorieUnit: {
        fontSize: 16,
        color: "#444",
        marginLeft: 6,
        marginBottom: 8,
    },

    inlineCalorieText: {
        fontSize: 14,
        color: "#166534",
        marginBottom: 4,
    },

    inlineCalorieOk: {
        fontSize: 14,
        fontWeight: "700",
        color: "#15803d",
        marginBottom: 16,
    },

    inlineCalorieAlert: {
        fontSize: 14,
        fontWeight: "700",
        color: "#dc2626",
        marginBottom: 16,
    },

    cardSubtitle: {
        fontSize: 13,
        color: "#4b6b45",
    },

    cardStatsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },

    cardStatItem: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#f3fbf4",
        borderRadius: 20,
        marginRight: 10,
    },

    cardStatLabel: {
        fontSize: 12,
        color: "#5a7a5d",
        marginBottom: 4,
    },

    cardStatValue: {
        fontSize: 26,
        fontWeight: "900",
        color: "#1d4224",
    },

    cardStatUnit: {
        fontSize: 12,
        color: "#8aa485",
        marginTop: 2,
    },

    progressPanel: {
        marginBottom: 16,
    },

    progressTrack: {
        width: "100%",
        height: 12,
        backgroundColor: "#def0d9",
        borderRadius: 999,
        overflow: "hidden",
        marginBottom: 8,
    },

    progressFill: {
        height: "100%",
        borderRadius: 999,
    },

    progressText: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "right",
    },

    cardHintText: {
        fontSize: 13,
        color: "#556f53",
        lineHeight: 20,
        marginBottom: 16,
    },

    macroSummaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    macroCard: {
        flex: 1,
        backgroundColor: "#f7fdf7",
        borderRadius: 18,
        padding: 12,
        alignItems: "center",
    },

    macroLabel: {
        fontSize: 11,
        color: "#4f6b51",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    macroValue: {
        fontSize: 18,
        fontWeight: "800",
        color: "#284b29",
    },

    dashboardOverview: {
        width: "100%",
    },

    overviewCard: {
        backgroundColor: "#f9fbff",
        borderRadius: 28,
        padding: 20,
        marginBottom: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 4,
    },

    overviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    overviewTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1f2937",
    },

    overviewStatus: {
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },

    overviewNumbers: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 18,
    },

    overviewColumn: {
        width: "48%",
    },

    overviewAmount: {
        fontSize: 32,
        fontWeight: "900",
        color: "#111827",
    },

    overviewSubtitle: {
        fontSize: 12,
        color: "#667085",
        marginTop: 4,
    },

    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },

    progressTrack: {
        flex: 1,
        height: 14,
        backgroundColor: "#e7efff",
        borderRadius: 999,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        borderRadius: 999,
    },

    progressPercent: {
        fontSize: 13,
        fontWeight: "800",
    },

    summaryCardsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },

    summaryCard: {
        flex: 1,
        borderRadius: 22,
        padding: 16,
        minHeight: 110,
        justifyContent: "space-between",
    },

    summaryCardLeft: {
        backgroundColor: "#ffffff",
    },

    summaryCardRight: {
        backgroundColor: "#eef5ff",
    },

    summaryLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    summaryValue: {
        fontSize: 22,
        fontWeight: "900",
        color: "#0f172a",
        marginVertical: 8,
    },

    summaryNote: {
        fontSize: 12,
        color: "#64748b",
        lineHeight: 18,
    },

    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    dateText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2ecc71",
    },

    topIcons: {
        flexDirection: "row",
        gap: 10,
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
        backgroundColor: "#f8fbff",
        marginHorizontal: 4,
        borderRadius: 18,
        padding: 12,
        alignItems: "flex-start",
        elevation: 2,
    },

    miniTitle: {
        fontSize: 12,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.4,
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
        backgroundColor: "#eef4ff",
        borderRadius: 34,
        padding: 12,
        marginBottom: 20,
        width: "100%",
        alignSelf: "stretch",
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
    calorieBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginVertical: 14,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },

    calorieTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 10,
    },

    calorieConsumed: {
        fontSize: 30,
        fontWeight: "900",
        color: "#15803d",
    },

    calorieTarget: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "600",
    },

    calorieTrack: {
        width: "100%",
        height: 12,
        backgroundColor: "#e5e7eb",
        borderRadius: 999,
        overflow: "hidden",
    },

    calorieFill: {
        height: "100%",
        borderRadius: 999,
    },

    calorieHint: {
        marginTop: 8,
        fontSize: 13,
        color: "#374151",
        fontWeight: "600",
        textAlign: "right",
    },
    calorieBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginVertical: 14,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },

    calorieTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 10,
    },

    calorieConsumed: {
        fontSize: 30,
        fontWeight: "900",
        color: "#15803d",
    },

    calorieTarget: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "600",
    },

    calorieTrack: {
        width: "100%",
        height: 12,
        backgroundColor: "#e5e7eb",
        borderRadius: 999,
        overflow: "hidden",
    },

    calorieFill: {
        height: "100%",
        borderRadius: 999,
    },

    calorieHint: {
        marginTop: 8,
        fontSize: 13,
        color: "#374151",
        fontWeight: "600",
        textAlign: "right",
    },

    macroContainer: {
        flexDirection: "column",
        gap: 10,
    },

    macroBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    macroTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 6,
        textTransform: "uppercase",
    },

    macroText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 8,
    },

    macroTrack: {
        width: "100%",
        height: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 999,
        overflow: "hidden",
    },

    macroFill: {
        height: "100%",
        borderRadius: 999,
    },
    dashboardWrapper: {
        paddingHorizontal: 16,
        marginTop: 10,
    },

    modernDashboard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        elevation: 3,
    },

    /* ================= CALORIES ================= */

    calorieBox: {
        marginBottom: 12,
    },

    calorieTopRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },

    calorieConsumed: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#111",
    },

    calorieTarget: {
        fontSize: 16,
        color: "#777",
        marginLeft: 6,
    },

    calorieTrack: {
        height: 14,
        backgroundColor: "#eee",
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 10,
        position: "relative",
    },

    calorieFill: {
        height: "100%",
        borderRadius: 10,
    },

    overflowTrack: {
        width: "100%",
        height: 8,
        backgroundColor: "#fee2e2",
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 8,
    },

    overflowTrackSmall: {
        width: "100%",
        height: 6,
        backgroundColor: "#fee2e2",
        borderRadius: 6,
        overflow: "hidden",
        marginTop: 6,
    },

    overflowFill: {
        height: "100%",
        borderRadius: 10,
    },

    analysisText: {
        fontSize: 12,
        color: "#475569",
        marginTop: 8,
        lineHeight: 18,
    },

    calorieHint: {
        fontSize: 12,
        color: "#666",
        marginTop: 6,
    },

    /* ================= BADGE ================= */

    goalBadge: {
        backgroundColor: "#111",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginTop: 10,
    },

    goalBadgeText: {
        color: "#fff",
        fontSize: 12,
    },

    /* ================= CONSEIL ================= */

    dashboardHintModern: {
        fontSize: 12,
        color: "#666",
        marginTop: 10,
        lineHeight: 16,
    },

    /* ================= MACROS ================= */

    bottomCards: {
        marginTop: 16,
        gap: 12,
    },

    macroBox: {
        backgroundColor: "#fafafa",
        borderRadius: 14,
        padding: 12,
    },

    macroTitle: {
        fontSize: 13,
        fontWeight: "bold",
        marginBottom: 4,
    },

    macroText: {
        fontSize: 12,
        color: "#666",
        marginBottom: 6,
    },

    macroTrack: {
        height: 10,
        backgroundColor: "#eaeaea",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
    },

    macroFill: {
        height: "100%",
        borderRadius: 8,
    },
});