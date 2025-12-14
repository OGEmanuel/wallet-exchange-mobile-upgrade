import { useContext } from "react";
import { ExchangeOnboardingContext } from "./ExchangeOnboardingContext";

export const useExchangeOnboardingContext = () => {
  const context = useContext(ExchangeOnboardingContext);
  
  if (context === undefined || context === null) {
    throw new Error("useExchangeOnboardingContext must be used within an ExchangeOnboardingProvider");
  }
  
  return context;
};

