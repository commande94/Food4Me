import React, { useState, useEffect } from "react";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import AppNavigator from "./navigation/AppNavigator";
import { warmupBackend } from "./services/warmupService";

export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    warmupBackend();
  }, []);

  return (
    <AppNavigator />
  );
}