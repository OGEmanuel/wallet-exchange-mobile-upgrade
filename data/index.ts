import { Currency } from "@/interfaces/account.interface";


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
  width: 0,
  height: 0,
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
  { code: "JPY", name: "Japanese Yen", country: "Japan", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", country: "Australia", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", country: "Switzerland", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", country: "China", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", country: "India", flag: "🇮🇳" },
  { code: "KRW", name: "South Korean Won", country: "South Korea", flag: "🇰🇷" },
  { code: "BRL", name: "Brazilian Real", country: "Brazil", flag: "🇧🇷" },
  {
    code: "ZAR",
    name: "South African Rand",
    country: "South Africa",
    flag: "🇿🇦",
  },
  { code: "RUB", name: "Russian Ruble", country: "Russia", flag: "🇷🇺" },
  {
    code: "AED",
    name: "UAE Dirham",
    country: "United Arab Emirates",
    flag: "🇦🇪",
  },
  { code: "SAR", name: "Saudi Riyal", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SEK", name: "Swedish Krona", country: "Sweden", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", country: "Norway", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", country: "Denmark", flag: "🇩🇰" },
  { code: "SGD", name: "Singapore Dollar", country: "Singapore", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", country: "Hong Kong", flag: "🇭🇰" },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    country: "New Zealand",
    flag: "🇳🇿",
  },
  { code: "PLN", name: "Polish Złoty", country: "Poland", flag: "🇵🇱" },
  { code: "THB", name: "Thai Baht", country: "Thailand", flag: "🇹🇭" },
  { code: "MXN", name: "Mexican Peso", country: "Mexico", flag: "🇲🇽" },
];

export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "de", name: "German" },
];
