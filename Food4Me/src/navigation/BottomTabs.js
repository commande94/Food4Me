import React from "react";

import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Image
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    createBottomTabNavigator
} from "@react-navigation/bottom-tabs";

import {
    Ionicons
} from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, navigation }) {

    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userId");
        navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
    };

    return (

        <View style={styles.wrapper}>

            <View style={[
                styles.container,
                { paddingBottom: insets.bottom + 6 }
            ]}>

                {state.routes.map((route, index) => {

                    const isFocused =
                        state.index === index;

                    const onPress = async () => {

                        if (route.name === "Profile") {
                            handleLogout();
                            return;
                        }

                        if (route.name === "Add") {
                            const token = await AsyncStorage.getItem("token");
                            navigation.navigate("Compose", { token });
                            return;
                        }

                        if (route.name !== "Home" && route.name !== "Dashboard") {
                            return;
                        }

                        const event =
                            navigation.emit({
                                type: "tabPress",
                                target: route.key,
                            });

                        if (
                            !isFocused &&
                            !event.defaultPrevented
                        ) {
                            navigation.navigate(route.name);
                        }
                    };

                    let iconName;
                    let label;

                    if (route.name === "Home") {
                        iconName = isFocused ? "book" : "book-outline";
                        label = "Journal";
                    }

                    else if (route.name === "Dashboard") {
                        iconName = isFocused ? "bar-chart" : "bar-chart-outline";
                        label = "Progrès";
                    }

                    else if (route.name === "Add") {
                        iconName = "add";
                    }

                    else if (route.name === "Meals") {
                        iconName = isFocused ? "restaurant" : "restaurant-outline";
                        label = "Régimes";
                    }

                    else if (route.name === "Profile") {
                        iconName = isFocused ? "log-out" : "log-out-outline";
                        label = "Déconnexion";
                    }

                    // BOUTON CENTRAL +
                    if (route.name === "Add") {

                        return (

                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabButton}
                                activeOpacity={0.9}
                            >

                                <View style={styles.addBox}>
                                    <Ionicons
                                        name={iconName}
                                        size={25}
                                        color="#020202"
                                    />
                                </View>


                            </TouchableOpacity>
                        );
                    }

                    return (

                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >

                            <View style={[
                                styles.iconBox,
                                isFocused && styles.activeIconBox
                            ]}>

                                {route.name === "Home" ? (
                                    <Image
                                        source={require("../../assets/logo.png")}
                                        style={[
                                            styles.logoIcon,
                                            isFocused && styles.logoIconActive
                                        ]}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Ionicons
                                        name={iconName}
                                        size={20}
                                        color="#000"
                                    />
                                )}

                                <Text style={[
                                    styles.label,
                                    isFocused && styles.labelActive
                                ]}>
                                    {label}
                                </Text>

                            </View>

                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function BottomTabs() {

    return (

        <Tab.Navigator
            tabBar={(props) => (
                <CustomTabBar {...props} />
            )}
            screenOptions={{
                headerShown: false
            }}
        >

            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Add" component={HomeScreen} />
            <Tab.Screen name="Meals" component={HomeScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />

        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({

    wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },

    container: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderTopWidth: 0.5,
        borderTopColor: "#000",
        height: 85,
        shadowOpacity: 0.12,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
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

    tabButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 6,
        justifyContent: "center",

    },

    iconBox: {
        width: 85,
        height: 70,
        borderRadius: 8,

        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 6,

        paddingVertical: 4,
        overflow: "hidden",
        paddingTop: 16,
    },

    addBox: {
        width: 40,
        height: 40,
        borderRadius: 10,

        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
        backgroundColor: "#4ADE80"

    },

    activeIconBox: {
        backgroundColor: "#e5e5e5",

    },

    label: {
        fontSize: 10,
        color: "#000",
        textAlign: "center",
        marginTop: 1,
    },

    labelActive: {
        fontWeight: "600",
    },

    logoIcon: {
        width: 22,
        height: 22,
        opacity: 0.5,
    },

    logoIconActive: {
        opacity: 1,
    },

});
