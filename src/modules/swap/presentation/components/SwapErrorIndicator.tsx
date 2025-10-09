import { Box, CustomButton, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";

interface Props {
  error?: string | null;
  retry?: () => void;
  retryText?: string;
  isBackgroundRefresh?: boolean;
}

const SwapErrorIndicator: React.FC<Props> = ({
  error,
  retry,
  retryText = "Retry",
  isBackgroundRefresh = false,
}) => {
  const theme = useTheme<Theme>();

  if (!error) return null;

  return (
    <Box
      backgroundColor="warningBackgroundColor"
      borderRadius={8}
      p="m"
      mb="m"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box flex={1} mr="s">
        <CustomText variant="body" fontSize={14} color="error">
          {error}
        </CustomText>
      </Box>
      {retry && (
        <CustomButton
          text={isBackgroundRefresh ? "..." : retryText}
          fontSize={12}
          width={70}
          height={32}
          borderRadius={16}
          bgColor={theme.colors.primaryColor}
          onPress={retry}
          disabled={isBackgroundRefresh}
        />
      )}
    </Box>
  );
};

export default SwapErrorIndicator;

