import React from "react";
import { Pressable } from "react-native";

import { Box, CustomText } from "@/components/general";

interface ErrorStateProps {
  title: string;
  info: string;
  btnTitle: string;
  onPress: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  info,
  btnTitle,
  onPress,
}) => {
  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="l"
    >
      <CustomText
        variant="bodySubheader"
        fontSize={18}
        textAlign="center"
        marginBottom="s"
        color="bodyTextColor"
      >
        {title}
      </CustomText>

      <CustomText
        variant="body"
        fontSize={14}
        textAlign="center"
        color="disabledTextColor"
        marginBottom="l"
      >
        {info}
      </CustomText>

      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: "#6045FF",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
        android_ripple={{
          color: "rgba(255,255,255,0.1)",
          borderless: true,
        }}
      >
        <CustomText variant="bodyMedium" fontSize={14} color="white">
          {btnTitle}
        </CustomText>
      </Pressable>
    </Box>
  );
};

export default ErrorState;
