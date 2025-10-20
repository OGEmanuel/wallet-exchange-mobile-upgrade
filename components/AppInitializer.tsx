import { useAppInitialization } from "@/hooks/useAppInitialization";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface AppInitializerProps {
  children: React.ReactNode;
  onInitializationComplete?: () => void;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children, onInitializationComplete }) => {
  const { isInitialized, isLoading, error } = useAppInitialization();

  // Notify parent when initialization is complete (success or error)
  React.useEffect(() => {
    if ((isInitialized || error) && !isLoading && onInitializationComplete) {
      onInitializationComplete();
    }
  }, [isInitialized, isLoading, error, onInitializationComplete]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: "#ffffff", marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
          padding: 20,
        }}
      >
        <Text
          style={{ color: "#ff0000", textAlign: "center", marginBottom: 16 }}
        >
          Failed to initialize app
        </Text>
        <Text style={{ color: "#ffffff", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000000",
        }}
      >
        <Text style={{ color: "#ffffff" }}>Initializing...</Text>
      </View>
    );
  }

  return <>{children}</>;
};
