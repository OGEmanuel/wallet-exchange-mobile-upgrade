import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Box, CustomButton, CustomText } from "../general";
import InfoBox from "../general/InfoBox";

interface EnterUsernameProps {
  onUsernameSuccess?: (username: string) => void;
}

export default function EnterUsername({
  onUsernameSuccess,
}: EnterUsernameProps) {
  const theme = useTheme<Theme>();
  const [username, setUsername] = useState("");

  return (
    <>
      <Box style={{ paddingTop: 100 }}>
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
          <Text
            style={[
              styles.suffix,
              {
                color:
                  username.length > 0
                    ? theme.colors.bodyTextColor
                    : theme.colors.usernamePlaceholderTextColor,
              },
            ]}
          >
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
      </Box>
      <Box
        width={"90%"}
        alignSelf="center"
        gap="m"
        style={{ position: "absolute", bottom: 150 }}
      >
        <InfoBox
          text={
            "Send and receive tokens to your friends and family \n with your Zap username"
          }
        />
        <CustomButton
          text="Continue"
          onPress={() => onUsernameSuccess?.(username)}
          disabled={!username || false}
          isLoading={false}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={
            username ? theme.colors.primaryColor : theme.colors.inActiveBtnColor
          }
          color="white"
          fontSize={12}
          variant="bodySubheader"
        />
      </Box>
    </>
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
