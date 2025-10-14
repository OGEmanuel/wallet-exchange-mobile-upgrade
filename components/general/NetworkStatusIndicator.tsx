import { useNetwork } from "@/src/core/contexts/NetworkContext";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { AlertCircle, Wifi, WifiOff } from "lucide-react-native";
import React from "react";
import { Animated, Pressable } from "react-native";
import Box from "./Box";
import CustomText from "./CustomText";

interface NetworkStatusIndicatorProps {
  showWhenOnline?: boolean;
  onPress?: () => void;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showWhenOnline = false,
  onPress,
}) => {
  const theme = useTheme<Theme>();
  const { isOnline, isConnected, isInternetReachable, type } = useNetwork();
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (!isOnline) {
      // Pulse animation when offline
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline, pulseAnim]);

  // Don't show when online unless explicitly requested
  if (isOnline && !showWhenOnline) {
    return null;
  }

  const getStatusInfo = () => {
    if (isOnline && isInternetReachable) {
      return {
        icon: Wifi,
        color: theme.colors.success,
        text: "Connected",
        bgColor: "successBackgroundColor",
      };
    } else if (isConnected && isInternetReachable === false) {
      return {
        icon: AlertCircle,
        color: theme.colors.pendingColor,
        text: "No Internet",
        bgColor: "warningBackgroundColor",
      };
    } else {
      return {
        icon: WifiOff,
        color: theme.colors.error,
        text: "Offline",
        bgColor: "errorBackgroundColor",
      };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Animated.View
        style={{
          opacity: pulseAnim,
        }}
      >
        <Box
          style={{ backgroundColor: statusInfo.bgColor }}
          borderRadius={20}
          paddingHorizontal="s"
          paddingVertical="s"
          flexDirection="row"
          alignItems="center"
          gap="s"
        >
          <IconComponent size={16} color={statusInfo.color} />
          <CustomText
            variant="bodyBold"
            style={{ color: statusInfo.color }}
            fontSize={12}
          >
            {statusInfo.text}
          </CustomText>
        </Box>
      </Animated.View>
    </Pressable>
  );
};

export default NetworkStatusIndicator;
