import useActiveTheme from "@/hooks/useTheme";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import FullPaperModalWrapper from "./FullPaperModalWrapper";
// import { Pressable } from "react-native-gesture-handler";

const ITEMS: {
  header: string;
  body: string;
  action: () => void;
  type: "IMPORT" | "CLOUD" | "WATCH";
}[] = [
  {
    type: "IMPORT",
    header: "Import Seedphrase",
    body: "Import a wallet using a recovery phrase",
    action: () => router.push("/setup/import-wallet/importseedphrase"),
  },
  {
    type: "IMPORT",
    header: "Import private key",
    body: "Import a wallet using a private key",
    action: () => router.push("/setup/import-wallet/importprivatekey"),
  },
  {
    type: "CLOUD",
    header: "Restore from iCloud",
    body: "Restore your wallet from your iCloud",
    action: () => router.push("/setup/import-wallet/restorefromcloud"),
  },
  {
    type: "WATCH",
    header: "Watch Address",
    body: "Add a public address to view-only",
    action: () => router.push("/setup/import-wallet/watchaddress"),
  },
];

const ImportCard = ({
  header,
  body,
  action,
  type,
  close,
}: {
  header: string;
  body: string;
  action: () => void;
  type: "IMPORT" | "CLOUD" | "WATCH";
  close: () => void;
}) => {
  const { colorTheme } = useActiveTheme();
  const theme = useTheme<Theme>();
  const getImage = () => {
    switch (type) {
      case "CLOUD": {
        return colorTheme === "dark"
          ? require("../../assets/images/icloud.png")
          : require("../../assets/images/lightCloud.png");
      }
      case "WATCH": {
        return colorTheme === "dark"
          ? require("../../assets/images/eye.png")
          : require("../../assets/images/lightEye.png");
      }
      case "IMPORT": {
        return colorTheme === "dark"
          ? require("../../assets/images/arrow-down.png")
          : require("../../assets/images/lightArrowDown.png");
      }
    }
  };
  return (
    <Box
      width={"100%"}
      height={100}
      borderWidth={1}
      borderColor="borderColor"
      borderRadius={20}
      mb="l"
      paddingHorizontal="s"
    >
      <Pressable
        onPress={(e) => {
          e?.stopPropagation();
          action();
          close();
        }}
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 8,
          opacity: pressed ? 0.3 : 1,
        })}
      >
        <Box
          width={40}
          height={40}
          overflow="hidden"
          borderRadius={10}
          alignItems="center"
        >
          <Image
            source={getImage()}
            contentFit="cover"
            style={{ width: 40, height: 40 }}
          />
        </Box>
        <Box flex={1} marginLeft="m">
          <CustomText variant="header" color="headerTextColor" fontSize={16}>
            {header}
          </CustomText>
          <CustomText
            variant="body"
            color="placeholderTextColor"
            fontSize={12}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {body}
          </CustomText>
        </Box>
        <Box
          width={35}
          height="100%"
          justifyContent="center"
          alignItems="flex-end"
        >
          <ChevronRight size={20} color={theme.colors.bodyTextColor} />
        </Box>
      </Pressable>
    </Box>
  );
};

const ImportWalletModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { colorTheme: activeTheme } = useActiveTheme();
  console.log(activeTheme);
  return (
    <FullPaperModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      color={
        activeTheme === "dark" ? ["#7055FF", "#000000"] : ["#7055FF", "#FFFFFF"]
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}>
        <Box
          width={"100%"}
          height={80}
          alignItems="center"
          justifyContent="center"
          mb="l"
        >
          <Image
            source={
              activeTheme === "dark"
                ? require("../../assets/images/arrow-down.png")
                : require("../../assets/images/lightArrowDown.png")
            }
            contentFit="cover"
            style={{ width: 100, height: 100 }}
          />
        </Box>
        <CustomText variant="medium" textAlign="center" fontSize={22} mt="l">
          Import an existing wallet
        </CustomText>
        <CustomText
          variant="body"
          textAlign="center"
          mt="m"
          mb="l"
          fontSize={14}
        >
          Import a wallet you already own by any of these methods
        </CustomText>
        <Box pb="l">
          {ITEMS.map((item, index) => (
            <ImportCard
              {...item}
              key={index.toString()}
              close={() => onClose()}
            />
          ))}
        </Box>
      </ScrollView>
    </FullPaperModalWrapper>
  );
};

export default ImportWalletModal;
