import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { useSelector } from "react-redux";
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
  const { addUsername } = useKyc();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [userSource, setUserSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitUsername = async () => {
    if (!username.trim() || !user?._id) return;

    setIsLoading(true);
    setError(null);

    console.log(`payload: ${username}, ${referralCode}, ${userSource}`);
    try {
      await addUsername({
        username: username.trim(),
        userSource: userSource,
        referralCode: referralCode.trim(),
      });
      onUsernameSuccess?.(username.trim());
    } catch (err) {
      console.error("Error adding username:", err);
      setError("Username is already taken or an error occurred");
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
