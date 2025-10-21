// components/wallet/WalletEmptyScreen.tsx

import PageWrapper from "@/components/general/PageWrapper";
import useActiveTheme from "@/hooks/useTheme";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import ImportWalletModal from "../Modals/ImportWalletModal";
import { Box, CustomButton, CustomText } from "../general";

const WalletEmptyScreen = () => {
  const theme = useTheme<Theme>();
  const [showImportWalletModal, setShowImportWalletModal] = useState(false);
  const { colorTheme: activeTheme } = useActiveTheme();

  const navigateToWalletCreate = () => {
    router.push("/setup");
  };

  const navigateToWalletImport = () => {
    setShowImportWalletModal(true);
  };

  return (
    <PageWrapper>
      <ImportWalletModal
        isOpen={showImportWalletModal}
        onClose={() => setShowImportWalletModal(false)}
      />
      <LinearGradient
        colors={
          activeTheme === "dark"
            ? ["#7055FF", "#000000"]
            : ["#7055FF", "#FFFFFF"]
        }
        style={{
          width: "100%",
          borderRadius: 20,
          padding: 20,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          flex={0.5}
          justifyContent="center"
          width={"100%"}
          alignItems="center"
        >
          <Image
            source={require("@/assets/images/walletImg.png")}
            contentFit="contain"
            style={{ width: 213, height: 190 }}
          />

          <CustomText
            variant="header"
            textAlign="center"
            style={{ width: "60%" }}
            mt="l"
          >
            Set up your web3 wallet
          </CustomText>

          <CustomText
            variant="body"
            textAlign="center"
            style={{ width: "70%" }}
            mt="m"
          >
            Create or import a hot wallet and start exploring the world of web3
          </CustomText>
        </Box>

        <Box width="100%" flex={0.2} justifyContent="center">
          <CustomButton
            width={"100%"}
            height={56}
            borderRadius={53}
            text="Create Wallet"
            color={theme.colors.bodyTextColor}
            bgColor={theme.colors.primaryColor}
            onPress={navigateToWalletCreate}
          />
          <Box height={20} />
          <CustomButton
            width={"100%"}
            height={56}
            borderRadius={53}
            text="Import Wallet"
            color={theme.colors.bodyTextColor}
            bgColor={"transparent"}
            onPress={navigateToWalletImport}
            borderColor={theme.colors.borderColor}
            borderWidth={2}
          />
        </Box>
      </LinearGradient>
    </PageWrapper>
  );
};

export default WalletEmptyScreen;
