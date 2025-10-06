export abstract class SettingsLocalDataSource {
  // Add your local data source methods here
  // Example:
  // abstract getCachedData(key: string): Promise<unknown>;
  // abstract setCachedData(key: string, data: unknown): Promise<void>;
  // abstract clearCachedData(key: string): Promise<void>;

  abstract setBiometricEnabled(
    key: string,
    value: "true" | "false"
  ): Promise<void>;

  abstract getBiometricEnabled(key: string): Promise<"true" | "false">;
}
