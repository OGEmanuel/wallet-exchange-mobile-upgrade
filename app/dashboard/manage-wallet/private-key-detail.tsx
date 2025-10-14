import { AppBar, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import ChainLogo from "@/components/general/ChainLogo";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { Copy } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PrivateKeyDetailProps {}

const PrivateKeyDetail: React.FC<PrivateKeyDetailProps> = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chain, symbol, privateKey, chainId, logoUrl } = useLocalSearchParams<{
    chain: string;
    symbol: string;
    privateKey: string;
    chainId: string;
    logoUrl: string;
  }>();

  const [isVisible, setIsVisible] = useState(false);

  const handleCopyPrivateKey = async () => {
    try {
      await Clipboard.setStringAsync(privateKey || "");
      Alert.alert("Copied", "Private key copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy private key");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <AppBar
          title="Private key"
          leading={<Pressable onPress={handleBack}><ArrowLeft2 size={24} color={theme.colors.headerTextColor} /></Pressable>}
        />
      </Box>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Box paddingHorizontal="m" paddingTop="l">
          {/* Warning Message */}
          <Box
            style={{ backgroundColor: "rgba(255, 0, 0, 0.1)" }}
            borderRadius={12}
            padding="m"
            marginBottom="l"
          >
            <CustomText
              variant="body"
              fontSize={14}
              color="error"
              textAlign="center"
            >
              Do not share your private key. Note that if someone has access to your key, they can access your wallet.
            </CustomText>
          </Box>

          {/* Chain Info */}
          <Box
            flexDirection="row"
            alignItems="center"
            marginBottom="l"
          >
            <ChainLogo
              symbol={symbol || ""}
              name={chain || ""}
              logoUrl={logoUrl}
              width={40}
              height={40}
              style={{ marginRight: theme.spacing.m }}
            />
            <CustomText
              variant="bodyBold"
              fontSize={18}
              color="headerTextColor"
            >
              {chain}
            </CustomText>
          </Box>

          {/* Private Key Display */}
          <Box
            backgroundColor="modalBackgroundColor"
            borderRadius={12}
            borderColor="borderColor"
            borderWidth={1}
            padding="m"
            marginBottom="l"
          >
            <CustomText
              variant="body"
              fontSize={14}
              color="headerTextColor"
              textAlign="center"
              lineHeight={20}
            >
              {isVisible ? privateKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
            </CustomText>
          </Box>

          {/* Copy Button */}
          <Pressable
            onPress={handleCopyPrivateKey}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              backgroundColor: theme.colors.modalBackgroundColor,
              borderRadius: 12,
              padding: theme.spacing.m,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: theme.spacing.l,
            })}
          >
            <Copy size={20} color={theme.colors.headerTextColor} style={{ marginRight: theme.spacing.s }} />
            <CustomText
              variant="bodyBold"
              fontSize={16}
              color="headerTextColor"
            >
              Copy to Clipboard
            </CustomText>
          </Pressable>

          {/* Toggle Visibility Button */}
          <Pressable
            onPress={() => setIsVisible(!isVisible)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              backgroundColor: theme.colors.primaryColor,
              borderRadius: 12,
              padding: theme.spacing.m,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <CustomText
              variant="bodyBold"
              fontSize={16}
              color="white"
            >
              {isVisible ? "Hide Private Key" : "Show Private Key"}
            </CustomText>
          </Pressable>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default PrivateKeyDetail;
