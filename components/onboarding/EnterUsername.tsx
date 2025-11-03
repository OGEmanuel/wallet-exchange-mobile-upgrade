import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React, { useState } from "react";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { Box, CustomButton, CustomText } from "../general";
import FindZapOption from "./FindZapOption";

interface EnterUsernameProps {
  onUsernameSuccess?: (username: string) => void;
}

export default function EnterUsername({
  onUsernameSuccess,
}: EnterUsernameProps) {
  const theme = useTheme<Theme>();
  const { completeOnboarding, currentExchangeUser, exchangeUserData } = useWallet();
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [userSource, setUserSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitUsername = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    // Get user ID from available sources
    const userId = currentExchangeUser || exchangeUserData?._id || null;
    
    if (!userId) {
      setError("User ID is required. Please verify your email first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log(`Complete onboarding payload: userId=${userId}, username=${username}, userSource=${userSource}, referralCode=${referralCode}`);
    try {
      const result = await completeOnboarding({
        username: username.trim(),
        userSource: userSource || null,
        referralCode: referralCode.trim() || null,
        userId: userId,
      });

      if (result.success) {
        // Onboarding succeeded - the username was submitted successfully
        // Even if the user object doesn't immediately show the username,
        // we should proceed since the backend accepted it
        console.log("Onboarding completed successfully");
        onUsernameSuccess?.(username.trim());
        router.push("/dashboard/home/wallet-home/swap");
      } else {
        setError(result.message || "Failed to complete onboarding");
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
      const errorMessage = err instanceof Error ? err.message : "Username is already taken or an error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box style={{ paddingTop: 100 }}>
      <Box alignSelf="center" mb="m" marginBottom="m">
        <CustomText
          variant="header"
          marginVertical="s"
          style={{
            textAlign: "center",
            fontWeight: "600",
            marginVertical: 24,
          }}
        >
          Welcome to Zap
        </CustomText>
      </Box>

      <Box gap="s" mb="m">
        <CustomInputWithoutForm
          value={username}
          onChange={setUsername}
          autoFocus={true}
          placeholder="Choose a username"
          boxStyle={{
            borderWidth: 0,
            marginTop: 20,
          }}
          color={theme.colors.bodyTextColor}
        />

        <CustomInputWithoutForm
          value={referralCode}
          onChange={setReferralCode}
          placeholder="Referral Code (Optional)"
          autoCapitalize="none"
          boxStyle={{
            borderWidth: 0,
            marginTop: 20,
          }}
          color={theme.colors.bodyTextColor}
        />

        <CustomText
          variant="body"
          style={{
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          How did you find Zap? (Optional)
        </CustomText>

        <Box flexDirection="row" justifyContent="space-between" mb="s">
          <FindZapOption
            option="Snapchat"
            active={userSource === "Snapchat"}
            onPress={() => setUserSource("Snapchat")}
          />
          <FindZapOption
            option="X (Twitter)"
            active={userSource === "X"}
            onPress={() => setUserSource("X")}
          />
        </Box>

        <Box flexDirection="row" justifyContent="space-between" mb="s">
          <FindZapOption
            option="Facebook"
            active={userSource === "Facebook"}
            onPress={() => setUserSource("Facebook")}
          />
          <FindZapOption
            option="Instagram"
            active={userSource === "Instagram"}
            onPress={() => setUserSource("Instagram")}
          />
        </Box>

        <Box flexDirection="row" justifyContent="space-between" mb="s">
          <FindZapOption
            option="Friends"
            active={userSource === "Friends"}
            onPress={() => setUserSource("Friends")}
          />
          <FindZapOption
            option="Other"
            active={userSource === "Other"}
            onPress={() => setUserSource("Other")}
          />
        </Box>
      </Box>
      {/* <View style={styles.inputContainer}>
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
        </View> */}
      {error && (
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
          {error}
        </CustomText>
      )}

      <CustomButton
        text="Continue"
        onPress={handleSubmitUsername}
        disabled={!username.trim() || isLoading}
        isLoading={isLoading}
        width="100%"
        height={56}
        borderRadius={56}
        bgColor={
          username.trim() && !isLoading
            ? theme.colors.primaryColor
            : theme.colors.inActiveBtnColor
        }
        color="white"
        fontSize={12}
        variant="bodySubheader"
      />
    </Box>
  );
}
