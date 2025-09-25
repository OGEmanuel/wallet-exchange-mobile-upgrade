import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Box, CustomText } from "../general";
import InfoBox from "../general/InfoBox";

export default function EnterUsername() {
  const theme = useTheme<Theme>();
  const [username, setUsername] = useState("");

  return (
    <Box style={{ paddingTop: 100 }}>
      <Box></Box>
      <CustomText
        variant="header"
        marginVertical="s"
        style={{
          fontSize: 16,
          textAlign: "center",
          fontWeight: "600",
          marginVertical: 24,
        }}
      >
        Choose a username
      </CustomText>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: theme.colors.bodyTextColor }]}
          placeholder="anonymous"
          placeholderTextColor={theme.colors.usernamePlaceholderTextColor}
          value={username}
          onChangeText={setUsername}
        />
        <Text style={[styles.suffix, { color: theme.colors.bodyTextColor }]}>
          .zap
        </Text>
      </View>
      <CustomText
        variant="body"
        marginVertical="s"
        style={{
          fontSize: 12,
          textAlign: "center",
          fontWeight: "400",
          marginVertical: 10,
          color: theme.colors.error,
        }}
      >
        username is already taken
      </CustomText>
      <InfoBox
        text={
          "Send and receive tokens to your friends and family \n with your Zap username"
        }
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  input: {
    paddingHorizontal: 10,
    height: 48,
    fontSize: 38,
    fontWeight: "400",
    fontFamily: "PlusJakartaSans_Regular",
    textAlign: "center",
    paddingRight: 0,
  },
  suffix: {
    fontSize: 38,
    fontWeight: "400",
    fontFamily: "PlusJakartaSans_Regular",
    color: "#000",
    marginLeft: -2,
    lineHeight: 48,
  },
});
