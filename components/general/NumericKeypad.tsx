import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowLeft, Dot } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

interface NumericKeypadProps {
  onPress: (value: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ onPress, onBackspace, disabled = false }) => {
  const theme = useTheme<Theme>();

  const keypadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "backspace"]
  ];

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    
    if (key === "backspace") {
      onBackspace();
    } else {
      onPress(key);
    }
  };

  return (
    <Box backgroundColor="secondaryBackgroundColor" borderRadius={20} padding="l">
      {keypadRows.map((row, rowIndex) => (
        <Box key={rowIndex} flexDirection="row" justifyContent="space-between" mb="s">
          {row.map((key, keyIndex) => (
            <Pressable
              key={keyIndex}
              onPress={() => handleKeyPress(key)}
              disabled={disabled}
              style={({ pressed }) => ({
                flex: 1,
                height: 60,
                marginHorizontal: 4,
                borderRadius: 12,
                backgroundColor: theme.colors.mainBackgroundColor,
                justifyContent: "center",
                alignItems: "center",
                opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
              })}
            >
              {key === "backspace" ? (
                <ArrowLeft size={24} color={theme.colors.bodyTextColor} />
              ) : key === "." ? (
                <Dot size={24} color={theme.colors.bodyTextColor} />
              ) : (
                <CustomText variant="medium" fontSize={24} color="white">
                  {key}
                </CustomText>
              )}
            </Pressable>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default NumericKeypad;
