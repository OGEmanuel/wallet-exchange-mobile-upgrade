import { createContext } from "react";
import { ExchangeOnboardingContextType } from "./types";

export const ExchangeOnboardingContext = createContext<ExchangeOnboardingContextType | undefined | null>(undefined);

