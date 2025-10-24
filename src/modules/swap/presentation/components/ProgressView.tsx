import { CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import ProgressBar, { ProgressStep } from "./ProgressBar";

type StatusType =
  | "confirming"
  | "swapping"
  | "sending"
  | "completed"
  | "underpaid"
  | "overpaid";

interface ProgressViewProps {
  status: StatusType;
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  recipient: string;
  network: string;
  orderDetails?: any;
  buyCurrency?: any;
  sellCurrency?: any;
  targetCurrency?: any;
  progress?: number;
  currentStep?: string;
}

const ProgressView: React.FC<ProgressViewProps> = ({
  status,
  fromAmount,
  fromCurrency,
  toAmount,
  toCurrency,
  recipient,
  network,
  orderDetails,
  buyCurrency,
  sellCurrency,
  targetCurrency,
  progress = 0,
  currentStep = "Confirming",
}) => {
  const steps: ProgressStep[] = [
    { id: "1", label: "Confirming", status: "pending" },
    { id: "2", label: "Swapping", status: "pending" },
    { id: "3", label: "Sending", status: "pending" },
  ];

  const theme = useTheme<Theme>();

  const getCurrentStepIndex = () => {
    if (status === "confirming") return 0;
    if (status === "swapping") return 1;
    return 2;
  };

  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardScale, cardOpacity]);

  return (
    <>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: cardScale }],
            opacity: cardOpacity,
          },
        ]}
      >
        <Text style={[styles.subtitle, { color: theme.colors.bodyTextColor }]}>
          Swap {orderDetails?.buyAmount} {fromCurrency} for
        </Text>

        <View style={styles.tokenRow}>
          <Image />
          <CustomText
            variant="header"
            style={{ color: theme.colors.bodyTextColor, fontWeight: "400" }}
          >
            {orderDetails?.sellAmount} {sellCurrency?.name || toCurrency}
          </CustomText>
        </View>

        <View style={styles.recipientContainer}>
          <Text
            style={[
              styles.recipientText,
              { color: theme.colors.bodyTextColor },
            ]}
            numberOfLines={1}
          >
            To{"  "}
            {orderDetails?.withdrawalAccount?.holderName ||
              recipient ||
              orderDetails?.withdrawalAccount?.walletAddress?.slice(0, 4) +
                "..." +
                orderDetails?.withdrawalAccount?.walletAddress?.slice(-4)}
          </Text>

          {(orderDetails?.buyCurrency?.chainId || buyCurrency?.chainId) && (
            <View style={styles.networkBadge}>
              <View style={styles.networkIcon}>
                {/* <TokenImage
                  size={16}
                  uri={buyCurrency?.image || ""}
                  name={buyCurrency?.name || ""}
                /> */}
              </View>
              <Text style={styles.networkText}>
                {buyCurrency?.chainId?.name || network}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          steps={steps}
          currentStepIndex={Math.floor((progress || 0) / 33.33)} // Convert percentage to step index
          progressColor="#93CE20"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#1C1F26", // assuming keyPad color
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
    alignSelf: "center",
  },
  subtitle: {
    marginBottom: 8,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipientContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 12,
    gap: 16,
  },
  recipientText: {
    color: "#8A8A8A",
    textTransform: "capitalize",
    maxWidth: 200,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E3646",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  networkIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#617FEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  networkText: {
    fontSize: 12,
    color: "#fff",
  },
  progressContainer: {
    marginTop: 48,
    paddingHorizontal: 12,
  },
});

export default ProgressView;
