import { Currency } from "@/interfaces/account.interface";
import { Dimensions } from "react-native";


export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // Font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  h5: 12,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // App dimensions
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
};


export const currencies: Currency[] = [
  { code: "NGN", name: "Nigeria Naira", country: "Nigeria", flag: "🇳🇬" },
  {
    code: "GBP",
    name: "British Pound Sterling",
    country: "United Kingdom",
    flag: "🇬🇧",
  },
  {
    code: "USD",
    name: "United States Dollar",
    country: "United States",
    flag: "🇺🇸",
  },
  { code: "CAD", name: "Canadian Dollar", country: "Canada", flag: "🇨🇦" },
  { code: "EUR", name: "Euro", country: "European Union", flag: "🇪🇺" },
];
