import { ThemedSearchIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { TextInput } from "react-native";
import Box from "../general/Box";

interface IProps {
  onFilterPress: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ActivitySearchBar = ({
  onFilterPress,
  searchQuery,
  onSearchChange,
}: IProps) => {
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
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.bodyTextColor}
          value={searchQuery}
          onChangeText={onSearchChange}
          style={{
            flex: 1,
            marginLeft: 10,
            fontFamily: "PlusJakartaSans_Medium",
            color: theme.colors.bodyTextColor,
          }}
        />
      </Box>
      {/* Commented out filter button */}
      {/* <Pressable
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
      </Pressable> */}
    </Box>
  );
};

export default ActivitySearchBar;
