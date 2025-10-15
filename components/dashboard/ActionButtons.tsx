import {
  ThemedAccountFillIcon,
  ThemedQrCodeIcon,
  ThemedSendIcon,
  ThemedSwap1Icon,
} from "@/assets/svg/wallet-icons-components";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import React from "react";
import { Pressable } from "react-native";

interface ActionButtonsProps {
  onReceive?: () => void;
  onSend?: () => void;
  onTrade?: () => void;
  onSwap?: () => void;
  size?: number;
  iconSize?: number;
  textSize?: number;
  backgroundColor?: string;
  textColor?: string;
  showLabels?: boolean;
  gap?: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onReceive,
  onSend,
  onTrade,
  onSwap,
  size = 50,
  iconSize = 18,
  textSize = 11,
  backgroundColor = "rgba(255,255,255,0.2)",
  textColor = "white",
  showLabels = true,
}) => {
  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: showLabels ? 6 : 0,
  };

  return (
    <Box
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
      paddingHorizontal="m"
    >
      <Box alignItems="center" flex={1}>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            ...buttonStyle,
          })}
          onPress={onReceive}
        >
          <ThemedQrCodeIcon
            width={iconSize}
            height={iconSize}
            darkModeColor={textColor}
            lightModeColor={textColor}
          />
        </Pressable>
        {showLabels && (
          <CustomText style={{ color: textColor }} fontSize={textSize}>
            Receive
          </CustomText>
        )}
      </Box>

      <Box alignItems="center" flex={1}>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            ...buttonStyle,
          })}
          onPress={onSend}
        >
          <ThemedSendIcon
            width={iconSize}
            height={iconSize}
            darkModeColor={textColor}
            lightModeColor={textColor}
          />
        </Pressable>
        {showLabels && (
          <CustomText style={{ color: textColor }} fontSize={textSize}>
            Send
          </CustomText>
        )}
      </Box>

      <Box alignItems="center" flex={1}>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            ...buttonStyle,
          })}
          onPress={onTrade}
        >
          <ThemedAccountFillIcon
            width={iconSize}
            height={iconSize}
            darkModeColor={textColor}
            lightModeColor={textColor}
          />
        </Pressable>
        {showLabels && (
          <CustomText style={{ color: textColor }} fontSize={textSize}>
            Trade
          </CustomText>
        )}
      </Box>

      <Box alignItems="center" flex={1}>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            ...buttonStyle,
          })}
          onPress={onSwap}
        >
          <ThemedSwap1Icon
            width={iconSize}
            height={iconSize}
            darkModeColor={textColor}
            lightModeColor={textColor}
          />
        </Pressable>
        {showLabels && (
          <CustomText style={{ color: textColor }} fontSize={textSize}>
            Swap
          </CustomText>
        )}
      </Box>
    </Box>
  );
};

export default ActionButtons;
