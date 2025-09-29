import Box from "@/components/general/Box";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowUpDown } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

interface SwapButtonProps {
  onPress?: () => void;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onPress }) => {
  const theme = useTheme<Theme>();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Box
        width={50}
        height={50}
        borderRadius={50}
        bg="mainBackgroundColor"
        style={{ padding: 8 }}
      >
        <Box
          width={"100%"}
          height={"100%"}
          borderRadius={50}
          backgroundColor="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <ArrowUpDown color={theme.colors.bodyTextColor} size={20} />
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

export default SwapButton;
