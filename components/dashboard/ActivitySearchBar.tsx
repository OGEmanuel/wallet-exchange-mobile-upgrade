import { View, Text, Pressable, TextInput } from "react-native";
import React from "react";
import Box from "../general/Box";
import {
  ThemedFilterIcon,
  ThemedSearchIcon,
} from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";

interface IProps {
  onFilterPress: () => void;
}

const ActivitySearchBar = ({ onFilterPress }: IProps) => {
  const theme = useTheme<Theme>();
  return (
    <Box width={"100%"} height={50} flexDirection="row" marginVertical="m">
      <Box
        flex={1}
        height={50}
        borderRadius={8}
        flexDirection="row"
        alignItems="center"
        backgroundColor="secondaryBackgroundColor"
        marginRight="s"
        paddingHorizontal="s"
      >
        <ThemedSearchIcon />
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.colors.bodyTextColor}
          style={{
            flex: 1,
            marginLeft: 10,
            fontFamily: "PlusJakartaSans_Medium",
            color: theme.colors.bodyTextColor,
          }}
        />
      </Box>
      <Pressable
        style={{
          width: 50,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.secondaryBackgroundColor,
          borderRadius: 8,
        }}
        onPress={onFilterPress}
      >
        <ThemedFilterIcon />
      </Pressable>
    </Box>
  );
};

export default ActivitySearchBar;
