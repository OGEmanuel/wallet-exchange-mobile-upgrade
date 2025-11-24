import { useAppInitialization } from "@/hooks/useAppInitialization";
import React from "react";

interface AppInitializerProps {
  children: React.ReactNode;
  onInitializationComplete?: () => void;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children, onInitializationComplete }) => {
  const { isInitialized, isLoading, error } = useAppInitialization();

  // Notify parent when initialization is complete (success or error)
  React.useEffect(() => {
    console.log('AppInitializer state:', { isInitialized, isLoading, error });
    if ((isInitialized || error) && !isLoading && onInitializationComplete) {
      console.log('AppInitializer calling onInitializationComplete');
      onInitializationComplete();
    }
  }, [isInitialized, isLoading, error, onInitializationComplete]);

  // Don't show loading screens - let splash screen handle the loading state
  // Just handle the initialization logic and notify when complete

  return <>{children}</>;
};
