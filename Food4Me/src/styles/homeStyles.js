import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f4f7fb",
    },

    // HEADER
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        paddingHorizontal: 22,
        paddingTop: 40,
        marginBottom: 20,
    },

    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#111827",
        letterSpacing: -1,
    },

    logoutButton: {
        backgroundColor: "#111827",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
    },

    logoutButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 13,
    },

    // DASHBOARD HORIZONTAL
    horizontalDashboard: {

        marginHorizontal: 1,

        paddingVertical: 30,
        paddingHorizontal: 22,

        borderRadius: 0,

        backgroundColor: "#16a34a",

        shadowColor: "#16a34a",
        shadowOffset: {
            width: 0,
            height: 14,
        },
        shadowOpacity: 0.28,
        shadowRadius: 24,

        elevation: 12,
    },

    horizontalTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        marginBottom: 30,
    },

    horizontalStatBox: {
        width: 90,
        alignItems: "center",
    },

    horizontalStatLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        marginBottom: 10,
        fontWeight: "500",
    },

    horizontalStatValue: {
        fontSize: 26,
        fontWeight: "900",
        color: "#fff",
    },

    horizontalCenterInfos: {
        alignItems: "center",
        justifyContent: "center",
    },

    horizontalCenterSmall: {
        fontSize: 13,
        color: "rgba(255,255,255,0.7)",
        marginBottom: 6,
        fontWeight: "500",
    },

    horizontalCenterBig: {
        fontSize: 52,
        fontWeight: "900",
        color: "#fff",
        lineHeight: 58,
        letterSpacing: -2,
    },

    horizontalCenterSub: {
        fontSize: 15,
        color: "rgba(255,255,255,0.7)",
        marginTop: -4,
    },

    // BARRE PRINCIPALE
    mainBarBackground: {

        width: "100%",
        height: 36,

        borderRadius: 40,

        backgroundColor: "rgba(255,255,255,0.18)",

        overflow: "hidden",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.12,
        shadowRadius: 10,
    },

    mainBarFill: {

        height: "100%",

        borderRadius: 40,

        shadowColor: "#fff",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 12,
    },

    progressPercent: {

        marginTop: 18,

        alignSelf: "center",

        fontSize: 28,
        fontWeight: "900",

        color: "#fff",
    },

    // MENU
    menuTitle: {

        fontSize: 24,
        fontWeight: "800",

        color: "#111827",

        marginTop: 30,
        marginBottom: 18,

        paddingHorizontal: 22,
    },

    menuButton: {

        marginHorizontal: 18,

        borderRadius: 24,

        paddingVertical: 22,
        paddingHorizontal: 20,

        marginBottom: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.08,
        shadowRadius: 14,

        elevation: 4,
    },

    menuButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 6,
    },

    menuButtonSub: {
        color: "rgba(255,255,255,0.88)",
        fontSize: 13,
        lineHeight: 18,
    },

    // DAILY CARD
    dailyCard: {

        marginHorizontal: 18,

        backgroundColor: "#fff",

        borderRadius: 28,

        paddingVertical: 24,
        paddingHorizontal: 20,

        marginTop: 14,
        marginBottom: 40,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.06,
        shadowRadius: 18,

        elevation: 5,
    },

    dailyTitle: {

        fontSize: 20,
        fontWeight: "800",

        color: "#111827",

        marginBottom: 20,
        textAlign: "center",
    },

    dailyRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    dailyMacro: {

        width: "48%",

        backgroundColor: "#f9fafb",

        paddingVertical: 18,

        borderRadius: 18,

        marginBottom: 14,

        textAlign: "center",

        fontSize: 14,
        fontWeight: "700",

        color: "#374151",

        overflow: "hidden",
    },
});