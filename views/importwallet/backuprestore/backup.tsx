import { Pressable, Image, Platform } from "react-native";
import React from "react";
import Box from "@/components/general/Box";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import CustomText from "@/components/general/CustomText";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import { useDispatch } from "react-redux";
import { setCurrentPage } from "@/state/reducers/currentPage.reducer";
import AppBar from "@/components/general/AppBar";
import { router } from "expo-router";
// import {
//   CloudStorage,
//   CloudStorageProvider,
//   useIsCloudAvailable,
// } from "react-native-cloud-storage";

const WalletCard = () => {
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();

  return (
    <Pressable onPress={() => dispatch(setCurrentPage(2))}>
      <Box
        width="100%"
        height={"auto"}
        borderWidth={1}
        borderRadius={20}
        borderColor="borderColor"
        mb="l"
        p="m"
      >
        <Box
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          mb="m"
        >
          <Box flexDirection="row" alignItems="center">
            <CustomText fontSize={12}>Wallet Group 1</CustomText>
            <Box
              style={{ padding: 5 }}
              borderRadius={50}
              bg="secondaryBackgroundColor"
              ml="s"
            >
              <CustomText variant="light" fontSize={10}>
                4 wallets
              </CustomText>
            </Box>
          </Box>

          <ChevronRight size={25} color={theme.colors.bodyTextColor} />
        </Box>

        <Box flexDirection="row" alignItems="center" mb="m">
          <Box
            width={36}
            height={36}
            borderRadius={3.8}
            bg="secondaryBackgroundColor"
          >
            <Image
              source={require("@/assets/images/rect.png")}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <Box ml="s">
            <CustomText variant="medium" fontSize={14} color="bodyTextColor">
              Rabidd
            </CustomText>
            <CustomText fontSize={12} variant="body" color="disabledTextColor">
              0x775e...50c3
            </CustomText>
          </Box>
        </Box>

        <Box flexDirection="row" alignItems="center" mb="m">
          <Box
            width={36}
            height={36}
            borderRadius={3.8}
            bg="secondaryBackgroundColor"
          >
            <Image
              source={require("@/assets/images/rect2.png")}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <Box ml="s">
            <CustomText variant="subheader" fontSize={14} color="bodyTextColor">
              Rabidd
            </CustomText>
            <CustomText fontSize={12} variant="light" color="disabledTextColor">
              0x775e...50c3
            </CustomText>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
};

const Backup = () => {
  const theme = useTheme<Theme>();

  // const cloudAvailable = useIsCloudAvailable();

  // React.useEffect(() => {
  //   if (cloudAvailable) {
  //     if (Platform.OS === "android") {
  //       CloudStorage.setProvider(CloudStorageProvider.GoogleDrive);
  //     } else {
  //       CloudStorage.setProvider(CloudStorageProvider.ICloud);
  //     }
  //     CloudStorage.getProvider();
  //   }
  // }, [cloudAvailable]);

  const readFromCloud = async () => {
    // const value = await CloudStorage.readFile("/file.txt");
    console.log("Successfully read file from cloud:");
  };

  return (
    <Box flex={1} paddingHorizontal="m" pt="xl">
      <AppBar
        leading={
          <ChevronLeft
            size={20}
            color={theme.colors.bodyTextColor}
            onPress={() => router.back()}
          />
        }
        title="ICloud Backup"
        paddingHorizontal={0}
        fontSize={18}
      />

      <Pressable onPress={() => readFromCloud()}>
        <WalletCard />
      </Pressable>
      <WalletCard />
    </Box>
  );
};

export default Backup;
