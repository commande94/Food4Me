import React, { useState } from "react";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  if (!token) {
    return (
      <AuthScreen
        onLogin={(t, id) => {
          setToken(t);
          setUserId(id);
        }}
      />
    );
  }

  return <HomeScreen userId={userId} />;
}