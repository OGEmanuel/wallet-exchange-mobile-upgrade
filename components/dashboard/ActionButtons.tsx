import {
  ThemedAccountFillIcon,
  ThemedQrCodeIcon,
  ThemedSendIcon,
  ThemedSwap1Icon,
} from "@/assets/svg/wallet-icons-components";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import React from "react";

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
  return (
    <Box
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
      paddingHorizontal="m"
    >
      <Box alignItems="center" flex={1}>
        <CustomButton
          width={size}
          height={size}
          borderRadius={size / 2}
          bgColor={backgroundColor}
          text=""
          onPress={onReceive || (() => {})}
          leadingIcon={
            <ThemedQrCodeIcon
              width={iconSize}
              height={iconSize}
              darkModeColor={textColor}
              lightModeColor={textColor}
            />
          }
          shouldVibrate={true}
        />
        {showLabels && (
          <CustomText
            style={{ color: textColor }}
            fontSize={textSize}
            marginTop="s"
          >
            Receive
          </CustomText>
        )}
      </Box>

      <Box alignItems="center" flex={1}>
        <CustomButton
          width={size}
          height={size}
          borderRadius={size / 2}
          bgColor={backgroundColor}
          text=""
          onPress={onSend || (() => {})}
          leadingIcon={
            <ThemedSendIcon
              width={iconSize}
              height={iconSize}
              darkModeColor={textColor}
              lightModeColor={textColor}
            />
          }
          shouldVibrate={true}
        />
        {showLabels && (
          <CustomText
            style={{ color: textColor }}
            fontSize={textSize}
            marginTop="s"
          >
            Send
          </CustomText>
        )}
      </Box>

      <Box alignItems="center" flex={1}>
        <CustomButton
          width={size}
          height={size}
          borderRadius={size / 2}
          bgColor={backgroundColor}
          text=""
          onPress={onTrade || (() => {})}
          leadingIcon={
            <ThemedAccountFillIcon
              width={iconSize}
              height={iconSize}
              darkModeColor={textColor}
              lightModeColor={textColor}
            />
          }
          shouldVibrate={true}
        />
        {showLabels && (
          <CustomText
            style={{ color: textColor }}
            fontSize={textSize}
            marginTop="s"
          >
            Trade
          </CustomText>
        )}
      </Box>

      <Box alignItems="center" flex={1}>
        <CustomButton
          width={size}
          height={size}
          borderRadius={size / 2}
          bgColor={backgroundColor}
          text=""
          onPress={onSwap || (() => {})}
          leadingIcon={
            <ThemedSwap1Icon
              width={iconSize}
              height={iconSize}
              darkModeColor={textColor}
              lightModeColor={textColor}
            />
          }
          shouldVibrate={true}
        />
        {showLabels && (
          <CustomText
            style={{ color: textColor }}
            fontSize={textSize}
            marginTop="s"
          >
            Swap
          </CustomText>
        )}
      </Box>
    </Box>
  );
};

export default ActionButtons;
