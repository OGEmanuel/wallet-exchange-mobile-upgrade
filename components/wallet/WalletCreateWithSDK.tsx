import { useZapSDK } from "@/src/core/sdk/useZapSDK";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Alert, View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomText } from "../general";
import CustomButton from "../general/CustomButton";

interface WalletCreateWithSDKProps {
  onCreateSuccess?: (walletData: any) => void;
  onBack?: () => void;
}

export default function WalletCreateWithSDK({
  onCreateSuccess,
  onBack,
}: WalletCreateWithSDKProps) {
  const [walletName, setWalletName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedSeedPhrase, setGeneratedSeedPhrase] = useState("");
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  const theme = useTheme<Theme>();
  const { sdk, isInitialized } = useZapSDK();

  const generateSeedPhrase = () => {
    if (!sdk || !isInitialized) {
      Alert.alert("Error", "SDK not initialized");
      return;
    }

    try {
      const seedPhrase = zapSDKService.generateSeedPhrase();
      setGeneratedSeedPhrase(seedPhrase);
      setShowSeedPhrase(true);
    } catch (error) {
      console.error("Generate seed phrase error:", error);
      Alert.alert("Error", "Failed to generate seed phrase");
    }
  };

  const handleCreateWallet = async () => {
    if (!sdk || !isInitialized) {
      Alert.alert("Error", "SDK not initialized");
      return;
    }

    if (!walletName.trim()) {
      Alert.alert("Error", "Please enter a wallet name");
      return;
    }

    if (!generatedSeedPhrase) {
      Alert.alert("Error", "Please generate a seed phrase first");
      return;
    }

    setLoading(true);
    try {
      const result = await zapSDKService.createWalletGroupMultipurpose({
        name: walletName,
        seedPhrase: generatedSeedPhrase,
        walletType: "SEEDPHRASE",
      });

      if (result.success) {
        Alert.alert("Success", "Wallet created successfully!");
        onCreateSuccess?.(result.data);
      } else {
        Alert.alert("Error", result.message || "Failed to create wallet");
      }
    } catch (error) {
      console.error("Create wallet error:", error);
      Alert.alert("Error", "Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copySeedPhrase = () => {
    // You would implement clipboard functionality here
    Alert.alert("Copied", "Seed phrase copied to clipboard");
  };

  return (
    <View>
      <CustomText
        variant="header"
        style={{
          fontSize: 22,
          textAlign: "center",
          fontWeight: "600",
          marginVertical: 24,
        }}
      >
        Create New Wallet
      </CustomText>

      {/* Wallet Name */}
      <CustomInputWithoutForm
        value={walletName}
        onChange={setWalletName}
        placeholder="Enter wallet name"
        noBorder={true}
        style={{ marginBottom: 24 }}
      />

      {/* Generate Seed Phrase */}
      {!showSeedPhrase ? (
        <View>
          <CustomText
            variant="body"
            style={{
              textAlign: "center",
              marginBottom: 24,
              color: theme.colors.bodyTextColor,
            }}
          >
            {"We'll generate a secure seed phrase for your new wallet"}
          </CustomText>

          <CustomButton
            width="100%"
            height={56}
            borderRadius={56}
            text="Generate Seed Phrase"
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
            onPress={generateSeedPhrase}
            disabled={!walletName.trim()}
            disabledColor={theme.colors.borderColor}
          />
        </View>
      ) : (
        <View>
          <CustomText
            variant="subheader"
            style={{
              textAlign: "center",
              marginBottom: 16,
              color: theme.colors.error,
            }}
          >
            ⚠️ Important: Save Your Seed Phrase
          </CustomText>

          <CustomText
            variant="body"
            style={{
              textAlign: "center",
              marginBottom: 24,
              color: theme.colors.bodyTextColor,
            }}
          >
            Write down these 12 words in the exact order shown. This is your
            only way to recover your wallet.
          </CustomText>

          <View
            style={{
              backgroundColor: theme.colors.secondaryBackgroundColor,
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <CustomText
              variant="body"
              style={{
                textAlign: "center",
                fontSize: 16,
                lineHeight: 24,
                letterSpacing: 1,
              }}
            >
              {generatedSeedPhrase}
            </CustomText>
          </View>

          <CustomButton
            width="100%"
            height={48}
            borderRadius={48}
            text="Copy Seed Phrase"
            bgColor="transparent"
            color={theme.colors.primaryColor}
            onPress={copySeedPhrase}
            borderColor="primaryColor"
            borderWidth={1}
          />

          <CustomButton
            width="100%"
            height={56}
            borderRadius={56}
            text={loading ? "Creating..." : "Create Wallet"}
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
            onPress={handleCreateWallet}
            disabled={loading}
            disabledColor={theme.colors.borderColor}
          />
        </View>
      )}

      {onBack && (
        <View style={{ marginTop: 16 }}>
          <CustomButton
            width="100%"
            height={48}
            borderRadius={48}
            text="Back"
            bgColor="transparent"
            color={theme.colors.bodyTextColor}
            onPress={onBack}
            disabled={loading}
          />
        </View>
      )}
    </View>
  );
}
