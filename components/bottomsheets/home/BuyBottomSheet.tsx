import icons from "@/assets/icons";
import images from "@/assets/images";
import { ThemedFaceIDIcon } from "@/assets/svg/wallet-icons-components";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { forwardRef, useCallback, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronRight, Search } from "react-native-feather";
import QRCode from "react-native-qrcode-svg";
import { SvgXml } from "react-native-svg";
import Tokens from "./sell/Tokens";

export type Token = {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  image?: any;
  icon?: string;
  price?: number;
};

type Currency = { code: string; name: string; url: string };

type Bank = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

const CURRENCIES: Currency[] = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    url: "https://flagcdn.com/w40/ng.png",
  },
  {
    code: "USD",
    name: "United States Dollar",
    url: "https://flagcdn.com/w40/us.png",
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    url: "https://flagcdn.com/w40/gb.png",
  },
  { code: "EUR", name: "Euro", url: "https://flagcdn.com/w40/eu.png" },
  {
    code: "CAD",
    name: "Canadian Dollar",
    url: "https://flagcdn.com/w40/ca.png",
  },
];

const BANKS: Bank[] = [
  {
    id: "b1",
    bankName: "First Bank",
    accountName: "Kelechukwu",
    accountNumber: "0123456789",
  },
  {
    id: "b2",
    bankName: "GTBank",
    accountName: "Kele",
    accountNumber: "0987654321",
  },
];

const ItemCard = ({
  title,
  body,
  image,
  onPress,
}: {
  title: string;
  body: string;
  image: React.ReactNode;
  onPress: () => void;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      style={{
        width: "100%",
        height: 92,
        borderWidth: 1,
        borderColor: theme.colors.borderColor,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing.m,
      }}
      onPress={() => onPress()}
    >
      <Box flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Box width={55} height={60}>
          {image}
        </Box>
        <Box ml="m">
          <CustomText variant="subheader">{title}</CustomText>
          <CustomText variant="bodySubheader">{body}</CustomText>
        </Box>
      </Box>

      <ChevronRight color={theme.colors.bodyTextColor} />
    </Pressable>
  );
};

const TradeSelectBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();

  const sheetRef = useRef<BottomSheet>(null);

  const [openSell, setOpenSell] = useState(false);
  const [step, setStep] = useState<
    | "select-token"
    | "select-currency"
    | "amount"
    | "select-bank"
    | "details"
    | "confirm"
    | "success"
  >("select-token");

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [amount, setAmount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  const openSellFlow = useCallback(() => {
    const sheet = (ref as React.RefObject<BottomSheetMethods>).current;
    const sellSheet = (sheetRef as React.RefObject<BottomSheetMethods>).current;

    sheet?.close();

    setTimeout(() => {
      setOpenSell(true);
      setStep("select-token");
      setSelectedToken(null);
      setSelectedCurrency(null);
      setAmount("");
      setSelectedBank(null);
      sellSheet?.snapToIndex(0);
    }, 300);
  }, []);

  const steps = ["Confirming", "Swapping", "Sending"];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  React.useEffect(() => {
    if (step === "confirm") {
      let index = 0;
      const timer = setInterval(() => {
        if (index < 2) {
          index++;
          setCurrentStepIndex(index);
        } else {
          clearInterval(timer);
          setTimeout(() => setStep("success"), 1000);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  const ProgressSteps = () => {
    return (
      <Box alignItems="center" justifyContent="center" mt="m">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step}>
                {/* Node */}
                <Box
                  width={20}
                  height={20}
                  borderRadius={6}
                  bg={isActive ? "secondaryColor" : "secondaryBackgroundColor"}
                  borderWidth={1}
                  borderColor={
                    isActive ? "secondaryColor" : "disabledTextColor"
                  }
                  justifyContent="center"
                  alignItems="center"
                >
                  {isActive && (
                    <Box
                      width={12}
                      height={12}
                      borderRadius={4}
                      bg="secondaryColor"
                    />
                  )}
                </Box>

                {/* Line (connector) */}
                {!isLast && (
                  <Box
                    flex={1}
                    height={3}
                    bg={
                      index < currentStepIndex
                        ? "secondaryColor"
                        : "secondaryBackgroundColor"
                    }
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>

        {/* Labels */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          width="100%"
          mt="s"
          style={{ paddingHorizontal: 10 }}
        >
          {steps.map((step, index) => (
            <CustomText
              key={step}
              fontSize={12}
              color={
                index <= currentStepIndex
                  ? "bodyTextColor"
                  : "disabledTextColor"
              }
            >
              {step}
            </CustomText>
          ))}
        </Box>
      </Box>
    );
  };

  const onPickCurrency = (c: Currency) => {
    setSelectedCurrency(c);
    setStep("amount");
  };

  const onContinueAmount = () => {
    const num = Number(amount.replace(/[^\d.]/g, ""));
    if (!selectedToken || !selectedCurrency || !num || num <= 0) return;
    setStep("select-bank");
  };

  const onPickBank = (b?: Bank) => {
    setSelectedBank(b!);
    setStep("details");
  };

  const renderSelectToken = () => (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <Tokens
        onTokenSelect={(token: any) => {
          setSelectedToken(token);
          setStep("select-currency");
        }}
      />
    </BottomSheetView>
  );

  const renderSelectCurrency = () => (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <CustomText variant="medium" textAlign="center">
        Sell To
      </CustomText>
      <Box bg="secondaryBackgroundColor" p="m" borderRadius={12} mt="m">
        <FlatList
          data={CURRENCIES}
          keyExtractor={(i) => i.code}
          style={{ marginTop: 16 }}
          renderItem={({ item }) => {
            return (
              <Pressable
                onPress={() => onPickCurrency(item)}
                style={{
                  padding: 1,
                  marginBottom: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      marginRight: 12,
                    }}
                    contentFit="contain"
                  />
                  <View>
                    <CustomText variant="bodyBold">{item.code}</CustomText>
                    <CustomText variant="body" color="disabledTextColor">
                      {item.name}
                    </CustomText>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </Box>
    </BottomSheetView>
  );

  const renderAmount = () => (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
      >
        <Pressable onPress={() => setStep("select-currency")}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
          Sell
        </CustomText>
        <Box
          width={50}
          height={35}
          borderRadius={50}
          backgroundColor="secondaryBackgroundColor"
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
        >
          <Image
            source={images.nigeria}
            style={{ width: 18, height: 18, borderRadius: 30 }}
            contentFit="cover"
          />
          <Image
            source={icons.down}
            tintColor={"white"}
            style={{ width: 20, height: 20 }}
          />
        </Box>
      </Box>

      <Box
        alignItems="center"
        alignContent="center"
        justifyContent="center"
        flexDirection="row"
        gap="s"
        marginTop="xl"
      >
        <Image
          source={{
            uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          }}
          style={{ width: 25, height: 25 }}
        />
        <CustomText variant="bodyBold" fontSize={14}>
          {selectedToken?.symbol || "BNB"}
        </CustomText>
      </Box>

      <View style={{ alignItems: "center", marginTop: 25 }}>
        <TextInput
          value={amount}
          autoFocus={true}
          onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          keyboardType="numeric"
          style={{
            fontSize: 36,
            color: theme.colors.bodyTextColor,
            fontWeight: "700",
            textAlign: "center",
          }}
        />
        <CustomText variant="body" color="bodyTextColor" fontSize={16}>
          ₦
          {Number(amount || 0).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </CustomText>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 40,
          gap: 10,
        }}
      >
        {["10%", "half", "Max"].map((label, i) => {
          const isActive = label === "10%";
          return (
            <Pressable
              key={i}
              style={{
                backgroundColor: isActive
                  ? theme.colors.tabBarLemonColor
                  : theme.colors.secondaryBackgroundColor,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isActive
                  ? theme.colors.tabBarActiveColor
                  : theme.colors.secondaryBackgroundColor,
                paddingVertical: 5,
                paddingHorizontal: 18,
              }}
            >
              <CustomText
                color={isActive ? "tabBarActiveColor" : "disabledTextColor"}
                variant="body"
              >
                {label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>

      <Box
        borderColor="bodyTextColor"
        marginBottom="m"
        borderRadius={10}
        padding="m"
        marginTop="2xl"
        borderWidth={1}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{
          borderColor: theme.colors.disabledTextColor,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="s">
          <Image source={images.zapLogo} style={{ width: 16, height: 16 }} />
          <CustomText variant="body" color="white">
            Zap Exchange
          </CustomText>
          <Image source={images.linked} style={{ width: 16, height: 16 }} />
        </Box>
        <CustomText variant="body" color="disabledTextColor">
          1 BNB ≈ 500 USDC
        </CustomText>
      </Box>

      <CustomButton
        text="Continue"
        onPress={onContinueAmount}
        width={"100%"}
        borderRadius={50}
      />
    </BottomSheetView>
  );

  const renderSelectBank = () => (
    <BottomSheetView
      style={{
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
      }}
    >
      <Box style={{ flex: 1, marginBottom: 100 }}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="m"
          flex={1}
        >
          <Pressable onPress={() => setStep("amount")}>
            <SvgXml
              xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
              width={16}
              height={16}
            />
          </Pressable>
          <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
            Select receiver account
          </CustomText>
          <Box width={30} />
        </Box>

        <CustomInputWithoutForm
          value=""
          onChange={(e) => console.log(e)}
          iconLeft={<Search color={theme.colors.bodyTextColor} />}
          placeholder="Search token"
          style={{}}
        />

        <Box
          marginTop="m"
          style={{
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.success,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <CustomText variant="bodyBold">First Bank</CustomText>
            <CustomText variant="body">Kelechukwu • 31298931918</CustomText>
          </View>
          <Image source={icons.checkFill} style={{ width: 24, height: 24 }} />
        </Box>

        <Box
          backgroundColor="secondaryBackgroundColor"
          padding="m"
          gap="s"
          borderRadius={20}
          flex={1}
          flexGrow={1}
        >
          <FlatList
            data={BANKS}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => {
              return (
                <Pressable
                  onPress={() => onPickBank(item)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box flexDirection="row" gap="s" marginBottom="s">
                    <Image
                      source={images.firstBank}
                      style={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <CustomText variant="bodyBold">
                        {item.bankName}
                      </CustomText>
                      <CustomText variant="body" color="disabledTextColor">
                        *****52782
                      </CustomText>
                    </Box>
                  </Box>
                </Pressable>
              );
            }}
          />
        </Box>
      </Box>
      <Box gap="m" mt="xl">
        <CustomButton
          text="Continue"
          onPress={onPickBank}
          width={"100%"}
          borderRadius={50}
        />
        <CustomButton
          text="Send to a different account"
          onPress={onPickBank}
          width={"100%"}
          borderRadius={50}
          bgColor={theme.colors.secondaryBackgroundColor}
        />
      </Box>
    </BottomSheetView>
  );

  const renderDetails = () => {
    return (
      <BottomSheetView
        style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}
      >
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="m"
          flex={1}
        >
          <Pressable onPress={() => setStep("amount")}>
            <SvgXml
              xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
              width={16}
              height={16}
            />
          </Pressable>
          <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
            Transaction Details
          </CustomText>
          <Box width={30} />
        </Box>

        <Box
          flexDirection="row"
          width="80%"
          alignSelf="center"
          mb="m"
          backgroundColor="secondaryBackgroundColor"
          style={{ padding: 5 }}
          borderRadius={50}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderRadius: 50,
              backgroundColor:
                activeTab === "Summary"
                  ? theme.colors.bodyTextColor
                  : "transparent",
            }}
            onPress={() => setActiveTab("Summary")}
          >
            <CustomText
              variant="body"
              color={activeTab === "Summary" ? "black" : "bodyTextColor"}
            >
              Summary
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderRadius: 50,
              backgroundColor:
                activeTab === "Details"
                  ? theme.colors.bodyTextColor
                  : "transparent",
            }}
            onPress={() => setActiveTab("Details")}
          >
            <CustomText
              variant="body"
              color={activeTab === "Details" ? "black" : "bodyTextColor"}
            >
              Details
            </CustomText>
          </TouchableOpacity>
        </Box>

        {activeTab === "Summary" ? (
          <Box flex={1}>
            <Box flex={1} marginBottom="xl">
              <Box
                bg="secondaryBackgroundColor"
                borderRadius={8}
                p="m"
                mb="m"
                alignItems="center"
              >
                <CustomText
                  variant="body"
                  color="bodyTextColor"
                  mb="s"
                  fontSize={10}
                >
                  YOU SEND
                </CustomText>
                <Box
                  alignItems="center"
                  alignContent="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="s"
                  marginTop="m"
                >
                  <Image
                    source={{
                      uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                    }}
                    style={{ width: 25, height: 25 }}
                  />
                  <CustomText variant="bodyBold" fontSize={18}>
                    3 BNB
                  </CustomText>
                </Box>
              </Box>

              <Box
                bg="secondaryBackgroundColor"
                borderRadius={8}
                p="m"
                mb="m"
                gap="m"
              >
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    You Receive:
                  </CustomText>
                  <CustomText variant="bodyBold" fontSize={10}>
                    4,543,444 NGN
                  </CustomText>
                </Box>
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    LP Fee:
                  </CustomText>
                  <CustomText variant="bodyBold" fontSize={10}>
                    0.02 BNB
                  </CustomText>
                </Box>
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    Receiving Address:
                  </CustomText>
                  <CustomText variant="bodyBold" fontSize={10}>
                    0xB1aE3...efd736
                  </CustomText>
                </Box>

                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    Chain:
                  </CustomText>
                  <Box
                    alignItems="center"
                    alignContent="center"
                    justifyContent="center"
                    flexDirection="row"
                    style={{ gap: 3 }}
                  >
                    <Image
                      source={{
                        uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                      }}
                      style={{ width: 15, height: 15 }}
                    />
                    <CustomText variant="bodyBold" fontSize={10}>
                      BSC
                    </CustomText>
                  </Box>
                </Box>

                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    Status:
                  </CustomText>
                  <CustomButton
                    text="Pending"
                    variant="bodySubheader"
                    width={70}
                    height={25}
                    borderRadius={20}
                    borderWidth={1}
                    borderColor="#FEDB24"
                    bgColor="#393002"
                    color="#FEDB24"
                    onPress={() => {}}
                    fontSize={10}
                  />
                </Box>
              </Box>

              <Box
                bg="warningBackgroundColor"
                borderRadius={10}
                p="m"
                flexDirection="row"
                alignItems="center"
                mb="m"
              >
                <Box width={2} height="100%" bg="warningColor" mr="s" />
                <CustomText variant="body" flex={1}>
                  We will complete your transaction of 4,844,800 NGN after we
                  confirm receipt of your deposit
                </CustomText>
              </Box>
            </Box>
            <CustomButton
              text="Show Deposit Details"
              onPress={() => setActiveTab("Details")}
              width={"100%"}
              borderRadius={50}
              bgColor={theme.colors.primaryColor}
            />
          </Box>
        ) : (
          <Box flex={1}>
            <Box alignItems="center">
              <CustomText variant="medium" mb="m">
                Deposit Address
              </CustomText>
              <Box
                height={120}
                width={120}
                borderRadius={1}
                bg="white"
                alignItems="center"
                justifyContent="center"
                padding="s"
                mb="m"
              >
                <QRCode
                  size={110}
                  value={
                    "https://play.google.com/store/apps/details?id=com.zapmobile"
                  }
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logoSize={20}
                  logoMargin={2}
                  logoBackgroundColor="transparent"
                />
              </Box>
              <Box
                width="100%"
                bg="secondaryBackgroundColor"
                borderRadius={8}
                p="m"
                gap="m"
                mb="m"
              >
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    Address:
                  </CustomText>
                  <CustomText variant="bodyBold" fontSize={10}>
                    0xB1aE3...efd736
                  </CustomText>
                </Box>

                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <CustomText variant="body" color="disabledTextColor">
                    Chain:
                  </CustomText>
                  <Box
                    alignItems="center"
                    alignContent="center"
                    justifyContent="center"
                    flexDirection="row"
                    style={{ gap: 3 }}
                  >
                    <Image
                      source={{
                        uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                      }}
                      style={{ width: 15, height: 15 }}
                    />
                    <CustomText variant="bodyBold" fontSize={10}>
                      BSC
                    </CustomText>
                  </Box>
                </Box>
              </Box>

              <Box
                bg="warningBackgroundColor"
                borderRadius={10}
                p="m"
                flexDirection="row"
                alignItems="center"
                mb="xl"
              >
                <Box width={2} height="100%" bg="warningColor" mr="s" />
                <CustomText variant="body" flex={1}>
                  We will complete your transaction of 4,844,800 NGN after we
                  confirm receipt of your deposit
                </CustomText>
              </Box>

              <CustomButton
                text="Send from wallet"
                onPress={() => setShowConfirmModal(true)}
                width={"100%"}
                borderRadius={50}
                bgColor={theme.colors.primaryColor}
              />
            </Box>
          </Box>
        )}
      </BottomSheetView>
    );
  };

  const renderConfirming = () => (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
        flex={1}
      >
        <Pressable onPress={() => setStep("details")}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
      </Box>
      <Box
        p="m"
        alignContent="center"
        bg="modalBackgroundColor"
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        gap="m"
        mb="m"
      >
        <CustomText variant="body" color="disabledTextColor">
          Sell 3 BNB for
        </CustomText>
        <CustomText variant="medium" color="bodyTextColor" fontSize={20}>
          4,500,000 NGN
        </CustomText>
        <Box
          bg="mainBackgroundColor"
          borderRadius={10}
          p="s"
          flexDirection="row"
          gap="s"
          alignItems="center"
        >
          <CustomText fontSize={12}>0xB1aE3E09F5C3e01b53b3...</CustomText>
          <Image
            source={icons.copy}
            style={{ width: 20, height: 20 }}
            tintColor={theme.colors.secondaryColor}
          />
        </Box>

        <Box
          alignItems="center"
          alignContent="center"
          justifyContent="center"
          flexDirection="row"
          gap="s"
        >
          <Image
            source={{
              uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
            }}
            style={{ width: 18, height: 18 }}
          />
          <CustomText variant="bodyBold" fontSize={14}>
            ERC-20
          </CustomText>
        </Box>
      </Box>

      <ProgressSteps />
    </BottomSheetView>
  );

  const renderSuccess = () => (
    <BottomSheetView
      style={{
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 30,
      }}
    >
      <Box
        alignContent="center"
        alignItems="center"
        justifyContent="center"
        mb="xl"
      >
        <Image source={images.success} style={{ width: 100, height: 100 }} />
      </Box>

      <Box
        p="m"
        alignContent="center"
        bg="modalBackgroundColor"
        borderRadius={10}
        borderWidth={1}
        justifyContent="center"
        alignItems="center"
        gap="m"
        mb="m"
        style={{ borderColor: "#39393F" }}
      >
        <CustomText variant="body" color="disabledTextColor">
          Sell 3 BNB for
        </CustomText>
        <CustomText variant="medium" color="bodyTextColor" fontSize={20}>
          4,500,000 NGN
        </CustomText>
        <Box
          bg="mainBackgroundColor"
          borderRadius={10}
          p="s"
          flexDirection="row"
          gap="s"
          alignItems="center"
        >
          <CustomText fontSize={12}>0xB1aE3E09F5C3e01b53b3...</CustomText>
          <Image
            source={icons.copy}
            style={{ width: 20, height: 20 }}
            tintColor={theme.colors.secondaryColor}
          />
        </Box>

        <Box
          alignItems="center"
          alignContent="center"
          justifyContent="center"
          flexDirection="row"
          gap="s"
        >
          <Image
            source={{
              uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
            }}
            style={{ width: 18, height: 18 }}
          />
          <CustomText variant="bodyBold" fontSize={14}>
            ERC-20
          </CustomText>
        </Box>
      </Box>

      <Box
        width={200}
        bg="mainBackgroundColor"
        borderRadius={10}
        borderWidth={1}
        p="s"
        flexDirection="row"
        alignItems="center"
        mb="4xl"
        justifyContent="center"
        alignContent="center"
        alignSelf="center"
        style={{ borderColor: "#39393F" }}
      >
        <Image
          source={icons.sumsubLighting}
          style={{ width: 15, height: 15 }}
          tintColor={theme.colors.secondaryColor}
        />
        <Box flexDirection="row" gap="s" alignItems="center">
          <CustomText fontSize={13} variant="body" color="disabledTextColor">
            Completed in
          </CustomText>
          <CustomText variant="body" fontSize={13}>
            {" "}
            1.20s
          </CustomText>
        </Box>
      </Box>

      <Box gap="m">
        <CustomButton
          text="Zap again"
          onPress={() => {
            sheetRef.current?.close();
            setOpenSell(false);
          }}
          width={"100%"}
          borderRadius={50}
          bgColor={theme.colors.primaryColor}
        />
        <CustomButton
          text="Go to History"
          onPress={() => {
            sheetRef.current?.close();
            setOpenSell(false);
          }}
          width={"100%"}
          borderRadius={50}
          borderWidth={1}
          borderColor="#39393F"
          bgColor={theme.colors.mainBackgroundColor}
        />
      </Box>
    </BottomSheetView>
  );

  return (
    <>
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["35%", "40"]}
        enablePanDownToClose
        enableOverDrag={false}
        enableDynamicSizing={false}
        backdropComponent={(props: any) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={1}
          />
        )}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        handleComponent={() => (
          <Box
            height={20}
            bg="mainBackgroundColor"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              height={4}
              bg="secondaryBackgroundColor"
              width={50}
              borderRadius={2}
            />
          </Box>
        )}
      >
        <BottomSheetView
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.mainBackgroundColor,
            paddingHorizontal: 20,
            paddingTop: 30,
          }}
        >
          <ItemCard
            title="Buy"
            body="Buy cryptocurrencies"
            image={
              <Image
                source={require("@/assets/images/btcc.png")}
                contentFit="contain"
                style={{ width: "100%", height: "100%" }}
              />
            }
            onPress={() => router.push("/dashboard/home/buy")}
          />
          <Box height={16}></Box>
          <ItemCard
            title="Sell"
            body="Sell cryptocurrencies"
            image={
              <Image
                source={require("@/assets/images/dollar2.png")}
                contentFit="contain"
                style={{ width: "100%", height: "100%" }}
              />
            }
            onPress={openSellFlow}
          />
        </BottomSheetView>
      </BottomSheet>

      {openSell && (
        <BottomSheet
          ref={sheetRef}
          index={-1}
          enableOverDrag={false}
          enableDynamicSizing={false}
          snapPoints={["90%", "95%"]}
          enablePanDownToClose
          backgroundStyle={{
            backgroundColor: theme.colors.mainBackgroundColor,
          }}
          backdropComponent={(props: any) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={1}
            />
          )}
          style={{
            backgroundColor: theme.colors.mainBackgroundColor,
          }}
        >
          {step === "select-token" && renderSelectToken()}
          {step === "select-currency" && renderSelectCurrency()}
          {step === "amount" && renderAmount()}
          {step === "select-bank" && renderSelectBank()}
          {step === "details" && renderDetails()}
          {step === "confirm" && renderConfirming()}
          {step === "success" && renderSuccess()}
        </BottomSheet>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 15,
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: theme.colors.mainBackgroundColor,
              borderRadius: 20,
              padding: 15,
            }}
          >
            <CustomText variant="medium" textAlign="center" marginBottom="m">
              Confirm transaction
            </CustomText>

            <Box position="relative">
              <Image
                source={images.arrowsDown}
                style={{
                  width: 40,
                  height: 40,
                  position: "absolute",
                  top: 85,
                  left: "50%",
                  transform: [{ translateX: -20 }],
                  zIndex: 500,
                }}
              />

              <Box
                bg="modalBackgroundColor"
                borderRadius={8}
                style={{ padding: 10, marginBottom: 4 }}
                gap="m"
              >
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <Box gap="m">
                    <CustomText
                      variant="body"
                      color="disabledTextColor"
                      fontSize={12}
                    >
                      Pay
                    </CustomText>
                    <CustomText
                      variant="bodyBold"
                      color="bodyTextColor"
                      fontSize={17}
                    >
                      3 BNB
                    </CustomText>
                    <CustomText
                      variant="body"
                      color="disabledTextColor"
                      fontSize={12}
                    >
                      4,543.00
                    </CustomText>
                  </Box>
                  <Image
                    source={{
                      uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                    }}
                    style={{ width: 35, height: 35 }}
                  />
                </Box>
              </Box>

              <Box
                bg="modalBackgroundColor"
                borderRadius={8}
                style={{ padding: 10 }}
                mb="m"
                gap="m"
              >
                <Box
                  alignItems="center"
                  flexDirection="row"
                  justifyContent="space-between"
                >
                  <Box gap="m">
                    <CustomText
                      variant="body"
                      color="disabledTextColor"
                      fontSize={12}
                    >
                      Receive
                    </CustomText>
                    <CustomText
                      variant="bodyBold"
                      color="bodyTextColor"
                      fontSize={17}
                    >
                      4,543,800 NGN
                    </CustomText>
                    <CustomText
                      variant="body"
                      color="disabledTextColor"
                      fontSize={12}
                    >
                      4,543.00
                    </CustomText>
                  </Box>
                  <Image
                    source={images.nigeria}
                    style={{ width: 35, height: 35, borderRadius: 50 }}
                  />
                </Box>
              </Box>
            </Box>

            <Box
              bg="modalBackgroundColor"
              borderRadius={8}
              p="m"
              mb="m"
              gap="m"
            >
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <Box gap="s">
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    To
                  </CustomText>
                  <CustomText variant="body" color="bodyTextColor">
                    Salami Adeoti
                  </CustomText>
                </Box>
                <Box
                  width={5}
                  height={5}
                  backgroundColor="warningColor"
                  borderRadius={50}
                />
              </Box>
            </Box>

            <Box
              borderColor="borderColor"
              borderWidth={1}
              borderRadius={8}
              p="m"
              mb="m"
              gap="m"
            >
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <Box flexDirection="row" alignItems="center" style={{ gap: 3 }}>
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    Network Fee
                  </CustomText>
                  <Image
                    source={icons.help}
                    style={{
                      width: 14,
                      height: 14,
                    }}
                  />
                </Box>

                <CustomText variant="body" color="bodyTextColor" fontSize={12}>
                  $0.09
                </CustomText>
              </Box>
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  fontSize={12}
                >
                  LP fee
                </CustomText>

                <Box flexDirection="row" alignItems="center" gap="s">
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    1,200 NGN
                  </CustomText>
                  <CustomText
                    variant="body"
                    color="bodyTextColor"
                    fontSize={12}
                  >
                    $0.09
                  </CustomText>
                </Box>
              </Box>
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  fontSize={12}
                >
                  Total
                </CustomText>

                <CustomText variant="body" color="bodyTextColor" fontSize={12}>
                  $0.12
                </CustomText>
              </Box>
            </Box>

            <Box
              gap="m"
              mt="m"
              flexDirection="row"
              justifyContent="space-between"
              alignContent="center"
              alignItems="center"
            >
              <CustomButton
                text="Cancel"
                onPress={() => {
                  setShowConfirmModal(false);
                }}
                borderRadius={50}
                bgColor="#1F232D"
                width={155}
              />

              <CustomButton
                text="Confirm"
                onPress={() => {
                  setShowConfirmModal(false);
                  setStep("confirm");
                }}
                borderRadius={50}
                width={155}
                trailingIcon={
                  <Box ml="s">
                    <ThemedFaceIDIcon
                      width={20}
                      height={20}
                      darkModeColor={theme.colors.bodyTextColor}
                      lightModeColor={theme.colors.bodyTextColor}
                    />
                  </Box>
                }
              />
            </Box>
          </View>
        </View>
      </Modal>
    </>
  );
});

TradeSelectBottomSheet.displayName = "TradeSelectBottomSheet";
export default TradeSelectBottomSheet;
