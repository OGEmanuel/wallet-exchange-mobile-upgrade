import icons from "@/assets/icons";
import { CustomText } from "@/components/general";
import { Theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { Text, TokenImage } from "..";
// import { Order } from "zap-frontend-swap-module/lib/types/types";
// import { formatCurrencyAmount } from "../../utils/cryptoHelpers";
// import icons from "../../assets/icons";
// import { useToast } from "../../contexts/ToastContext";
// import { copy } from "../../utils/helpers";
// import AnimatedButton from "./AnimatedButton";
// import useTransactionHistory from "../../hooks/useTransactionHistory";

interface SuccessViewProps {
  transactionTime: string;
  orderDetails?: Order;
  recipient: string;
  toAmount: string;
  toCurrency: string;
  network: string;
  sellCurrency?: any;
  buyCurrency?: any;
  targetCurrency?: any;
  onGoToHistory?: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  transactionTime,
  orderDetails,
  recipient,
  toAmount,
  toCurrency,
  network,
  sellCurrency,
  buyCurrency,
  targetCurrency,
  onGoToHistory,
}) => {
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const copyButtonScale = useRef(new Animated.Value(1)).current;
  const theme = useTheme<Theme>();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [scaleAnim, opacityAnim, slideAnim, checkmarkScale, checkmarkOpacity]);

  const handleCopyAddress = () => {
    // copy(orderDetails?.withdrawalAccount?.walletAddress || recipient);

    Animated.sequence([
      Animated.spring(copyButtonScale, {
        toValue: 1.2,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(copyButtonScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.centeredContent}>
        {/* Checkmark Animation */}
        <Animated.View
          style={[
            styles.checkmarkWrapper,
            {
              transform: [{ scale: checkmarkScale }],
              opacity: checkmarkOpacity,
            },
          ]}
        >
          <Image source={icons.checkbox} style={styles.checkmarkImage} />
        </Animated.View>

        {/* Transaction Time */}
        <Animated.View
          style={[
            styles.flashContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Ionicons name="flash" size={16} color="#C9E675" />
          <Text style={styles.flashText}>
            Swapped in 1 min {transactionTime}
          </Text>
        </Animated.View>

        {/* Withdraw Details */}
        <Animated.View
          style={[
            styles.detailsCard,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
            { backgroundColor: theme.colors.secondaryBackgroundColor },
          ]}
        >
          <Text
            style={[
              styles.placeholderText,
              { color: theme.colors.bodyTextColor },
            ]}
          >
            You withdrew
          </Text>

          <View style={styles.amountRow}>
            {/* <TokenImage
              size={24}
              uri={sellCurrency?.image || targetCurrency?.image || ""}
              name={sellCurrency?.name || targetCurrency?.name || ""}
            /> */}
            <CustomText
              variant="header"
              style={[styles.amountText, { color: theme.colors.bodyTextColor }]}
            >
              {/* {formatCurrencyAmount(
                orderDetails?.sellAmount || toAmount,
                sellCurrency?.displayTicker || toCurrency
              )}{" "} */}
              1 {sellCurrency?.name || toCurrency}
            </CustomText>
          </View>

          {/* Recipient + Copy */}
          <View style={styles.recipientRow}>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientText} numberOfLines={1}>
                To{" "}
                {orderDetails?.withdrawalAccount?.holderName ||
                  orderDetails?.withdrawalAccount?.walletAddress ||
                  recipient ||
                  orderDetails?.withdrawalAccount?.walletAddress?.slice(0, 4) +
                    "..." +
                    orderDetails?.withdrawalAccount?.walletAddress?.slice(-4)}
              </Text>
              <Animated.View
                style={{ transform: [{ scale: copyButtonScale }] }}
              >
                <TouchableOpacity onPress={handleCopyAddress}>
                  <Image
                    source={icons.copy}
                    style={styles.copyIcon}
                    tintColor="#A7A7AF"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.divider} />

            {(orderDetails?.buyCurrency?.chainId || buyCurrency?.chainId) && (
              <View style={styles.networkTag}>
                <View style={styles.networkIconWrapper}>
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
      </View>
    </View>
  );
};

export default SuccessView;

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    flex: 1,
  },
  centeredContent: {
    alignItems: "center",
  },
  checkmarkWrapper: {
    marginTop: 48,
    marginBottom: 16,
  },
  checkmarkImage: {
    width: 128,
    height: 128,
  },
  flashContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232B0F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  flashText: {
    color: "#C9E675",
    marginLeft: 8,
  },
  detailsCard: {
    width: "90%",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginTop: 80,
  },
  placeholderText: {
    color: "#A7A7AF",
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "600",
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipientText: {
    color: "#A7A7AF",
    textTransform: "capitalize",
    maxWidth: 200,
  },
  copyIcon: {
    width: 16,
    height: 16,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#A7A7AF",
  },
  networkTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E3646",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  networkIconWrapper: {
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
    color: "#FFFFFF",
  },
  buttonWrapper: {
    width: "100%",
    marginVertical: 32,
    alignItems: "center",
  },
  buttonContainer: {
    width: "95%",
  },
});
