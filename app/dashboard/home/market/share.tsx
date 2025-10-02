import images from "@/assets/images";
import AssetChartDetails from "@/components/dashboard/market/AssetChartDetails";
import { Box, CustomText } from "@/components/general";
import { AppRootState } from "@/state";
import { router, useLocalSearchParams } from "expo-router";
import * as Share from "expo-sharing";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Download, Share as ShareX, X } from "react-native-feather";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import { useSelector } from "react-redux";

const ShareCard: React.FC = () => {
  const params = useLocalSearchParams() as any;
  const HEIGHT = Dimensions.get("window").height;
  const user = useSelector((state: AppRootState) => state.kyc.user);

  const viewShotRef = useRef<ViewShot>(null);

  const baseUrl =
    process.env.NODE_ENV !== "production"
      ? "https://dev.app.zap.africa"
      : "https://app.zap.africa";

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const captureAndShareScreenshot = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await (viewShotRef.current as any).capture();

        if (uri) {
          //   const shareOptions = {
          //     title: "Share via",
          //     url: uri,
          //     failOnCancel: false,
          //   };
          await Share.shareAsync(uri);
        }
      }
    } catch (err) {
      Alert.alert("Error sharing card", String(err));
    }
  };

  return (
    <ImageBackground
      source={images.lemonBG}
      style={{
        height: HEIGHT,
        zIndex: 50,
        width: "100%",
        paddingTop: 40,
      }}
    >
      <Box>
        <TouchableOpacity
          style={{ zIndex: 50, marginVertical: 20, marginHorizontal: 16 }}
          onPress={() => {
            router.back();
          }}
        >
          <X stroke="#FFFFFF" width={24} height={24} />
        </TouchableOpacity>

        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
          <AssetChartDetails tokenDetails={params} />
          <Box
            marginHorizontal="m"
            bg="secondaryBackgroundColor"
            borderRadius={16}
            marginTop="m"
            flexDirection="row"
            padding="m"
            gap="s"
            alignItems="center"
          >
            <Box height={64} width={64} borderRadius={8}>
              <QRCode size={50} value={`${baseUrl}ref=${user?.username}`} />
            </Box>
            <Box flex={1} gap="m">
              <CustomText variant="bodySubheader">Swap with Zap</CustomText>
              <CustomText variant="body">Download the app</CustomText>
            </Box>
            <Box
              height={64}
              flexDirection="column"
              gap="s"
              justifyContent="center"
            >
              <CustomText variant="body" textAlign="right" marginBottom="s">
                Referral code
              </CustomText>
              <CustomText variant="bodySubheader" textAlign="right">
                {user?.username || "ZAPUSER"}
              </CustomText>
            </Box>
          </Box>
        </ViewShot>
      </Box>

      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        bg="secondaryBackgroundColor"
        position="absolute"
        bottom={0}
        right={0}
        left={0}
        borderTopLeftRadius={12}
        borderTopRightRadius={12}
        paddingHorizontal="l"
        paddingVertical="l"
      >
        <TouchableOpacity
          onPress={captureAndShareScreenshot}
          style={{ flexDirection: "column", padding: 16, alignItems: "center" }}
        >
          <Box
            bg="disabledTextColor"
            padding="m"
            borderRadius={50}
            width="auto"
          >
            <ShareX stroke="#FFFFFF" width={24} height={24} />
          </Box>
          <CustomText variant="body" marginTop="s" color="white">
            Share via
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={captureAndShareScreenshot}
          style={{ flexDirection: "column", padding: 16, alignItems: "center" }}
        >
          <Box
            bg="disabledTextColor"
            padding="m"
            borderRadius={50}
            width="auto"
          >
            <Download stroke="#FFFFFF" width={24} height={24} />
          </Box>
          <CustomText variant="body" marginTop="s" color="white">
            Download
          </CustomText>
        </TouchableOpacity>
      </Box>
    </ImageBackground>
  );
};

export default ShareCard;
