import { AppRootState } from "@/app/core/store/store";
import images from "@/assets/images";
import { CoinData } from "@/interfaces/account.interface";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Share from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Download, Share as ShareX, X } from "react-native-feather";
import ViewShot from "react-native-view-shot";
import { useSelector } from "react-redux";
import AssetChartDetails from "./AssetChartDetails";

// Define the param list for the screen
type MarketStackParamList = {
  AssetInfo: undefined;
  ShareCard: {
    item: CoinData;
    defaultTime: number;
    defaultCurrency: string;
  };
};

const ShareCard = () => {
  const params = useLocalSearchParams() as any;

  const HEIGHT = Dimensions.get("window").height;
  const [coinItem, setCoin] = useState<any>(params);
  console.log("coinItem", coinItem);
  const { user } = useSelector((state: AppRootState) => state.auth);
  const router = useRouter();

  const [excludeElementVisible, setExcludeElementVisible] = useState(false);

  const viewShotRef = useRef<ViewShot>(null);

  const baseUrl =
    process.env.NODE_ENV !== "production"
      ? "https://dev.app.zap.africa"
      : "https://app.zap.africa";

  const [snapShotReady, setSnapShot] = useState(false);

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
      setExcludeElementVisible(true);
      if (viewShotRef.current) {
        const uri = await (viewShotRef.current as any).capture();

        if (uri) {
          // const shareOptions = {
          //   title: "Share via",
          //   url: uri,
          //   failOnCancel: false,
          // };
          // await Share.open(shareOptions);
          await Share.shareAsync(uri);
        }
      }
      setSnapShot(false);
      setExcludeElementVisible(false);
    } catch (err) {
      Alert.alert("Error sharing card", String(err));
      setSnapShot(false);
      setExcludeElementVisible(false);
    }
  };

  return (
    <ImageBackground
      source={images.lemonBG}
      className="h-100 w-full pt-[80px] "
      style={{
        height: HEIGHT,
      }}
    >
      <View className="mx-[20px]">
        <TouchableOpacity
          className="z-50 my-5"
          onPress={() => {
            router.back();
          }}
        >
          <X stroke="#FFFFFF" width={24} height={24} />
        </TouchableOpacity>

        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
          <AssetChartDetails />
          {/* <View className="bg-[#1F232D] rounded-2xl mt-4 flex flex-row p-3 space-x-2 items-center">
              <View className="h-16 w-16 rounded-md">
                <QRCode size={50} value={`${baseUrl}?ref=${user?.username}`} />
              </View>
              <View className="flex-1 flex space-y-5 flex-col">
                <Text>Swap with Zap</Text>
                <Text>Download the app</Text>
              </View>
              <View className="h-16 flex-col flex space-y-1 justify-center">
                <Text className="text-right mb-2">
                  Referral code
                </Text>
                <Text className="text-right">
                  {user?.username || "ZAPUSER"}
                </Text>
              </View>
            </View>
          </AssetChartDetails> */}
        </ViewShot>
      </View>

      <View className="flex flex-row items-center justify-center bg-[#1F232D] absolute bottom-0 right-0 left-0 rounded-t-xl px-6 py-6">
        <TouchableOpacity
          onPress={captureAndShareScreenshot}
          className="flex-col flex p-4 items-center"
        >
          <View className="bg-[#ffffff08] p-3 rounded-full w-auto">
            <ShareX stroke="#FFFFFF" width={24} height={24} />
          </View>
          <Text className="text-dark-text">Share via</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={captureAndShareScreenshot}
          className="flex-col flex p-4 items-center"
        >
          <View className="bg-[#ffffff08] p-3 rounded-full w-auto">
            <Download stroke="#FFFFFF" width={24} height={24} />
          </View>
          <Text className="text-dark-text">Download</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default ShareCard;
