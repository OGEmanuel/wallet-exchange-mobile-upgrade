import icons from "@/assets/icons";
import images from "@/assets/images";
import AssetChartDetails from "@/components/dashboard/market/AssetChartDetails";
import { Box, CustomText } from "@/components/general";
import { ENVIRONMENTS } from "@/configs/environments";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { router, useLocalSearchParams } from "expo-router";
import * as Share from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
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
  const { currencies } = useSelector((state: AppRootState) => state.utilities);
  const { fetchCurrencies } = useUtilities();

  // Parse the asset data from JSON string
  const parsedAsset = params?.asset ? JSON.parse(params.asset) : null;

  const [nairaCurrency, setNairaCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [usdCurrency, setUsdCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [qrValue, setQrValue] = useState<string>(
    "https://play.google.com/store/apps/details?id=com.zapmobile"
  );

  const viewShotRef = useRef<ViewShot>(null);

  const baseUrl = ENVIRONMENTS.EXPO_PUBLIC_STAGING_BASE_URL;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch currencies when component mounts
  const fetchCurrenciesCallback = useCallback(async () => {
    try {
      await fetchCurrencies({
        body: {},
        params: {},
        extra: {},
      });
    } catch (err: any) {
      console.error("Error fetching currencies:", err);
    }
  }, [fetchCurrencies]);

  // Set currency data when currencies are loaded
  useEffect(() => {
    if (currencies && currencies.length > 0) {
      const usd = currencies.find((c) => c.code === "USD");
      const ngn = currencies.find((c) => c.code === "NGN");

      setUsdCurrency(usd);
      setNairaCurrency(ngn);
    }
  }, [currencies]);

  // Set QR code value based on device platform
  useEffect(() => {
    const isIOS = Platform.OS === "ios";

    if (isIOS) {
      setQrValue(
        "https://apps.apple.com/ng/app/zap-exchange-crypto-fast/id6474125933"
      );
    } else {
      setQrValue("https://play.google.com/store/apps/details?id=com.zapmobile");
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    fetchCurrenciesCallback();
  }, [fadeAnim, fetchCurrenciesCallback]);

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
          <AssetChartDetails
            tokenDetails={params}
            asset={parsedAsset}
            nairaCurrency={nairaCurrency}
            usdCurrency={usdCurrency}
          />
          <Box
            marginHorizontal="m"
            bg="secondaryBackgroundColor"
            borderRadius={16}
            marginTop="m"
            flexDirection="row"
            padding="m"
            gap="m"
            alignItems="center"
          >
            <Box flexDirection="row" alignItems="center" flex={1} gap="m">
              <Image
                source={images.zapLogo}
                style={{ width: 60, height: 60 }}
              />
              <Box flex={1}>
                <CustomText
                  variant="bodySubheader"
                  fontSize={18}
                  color="headerTextColor"
                >
                  Download Zap
                </CustomText>
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="bodyTextColor"
                  marginTop="s"
                >
                  Available on
                </CustomText>
                <Box
                  flexDirection="row"
                  alignItems="center"
                  gap="s"
                  marginTop="s"
                >
                  <Box
                    height={24}
                    width={24}
                    borderRadius={4}
                    borderWidth={1}
                    borderColor="bodyTextColor"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      source={icons.google}
                      style={{ width: 15, height: 15 }}
                      tintColor={"white"}
                    />
                  </Box>

                  <Box
                    height={24}
                    width={24}
                    borderRadius={4}
                    borderWidth={1}
                    borderColor="bodyTextColor"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      source={icons.apple}
                      style={{ width: 20, height: 20 }}
                      tintColor={"white"}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* QR Code */}
            <Box
              height={80}
              width={80}
              borderRadius={12}
              bg="white"
              alignItems="center"
              justifyContent="center"
              padding="s"
            >
              {qrValue ? (
                <QRCode
                  size={70}
                  value={qrValue}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logoSize={20}
                  logoMargin={2}
                  logoBackgroundColor="transparent"
                />
              ) : (
                <CustomText variant="body" fontSize={12} color="black">
                  Loading...
                </CustomText>
              )}
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
