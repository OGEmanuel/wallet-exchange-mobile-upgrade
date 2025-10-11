// Export domain layer
export * from "./domain/swap-repo";

// Export data layer
export * from "./data/swap-repo-impl";

// Export integrated exchange functionality
export * from "./data/remote";
export * from "./domain/entities/currency.types";
export * from "./utils";

// Export presentation layer (avoid circular dependency)
export { useSwap } from "./presentation/hooks/useSwap";
export { default as SwapScreen } from "./presentation/screens/SwapScreen";
export * from "./presentation/state/swap-slice";

