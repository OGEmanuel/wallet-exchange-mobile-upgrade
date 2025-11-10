import {
  ThemedBackIcon,
  ThemedLockPasswordIcon,
} from "@/assets/svg/wallet-icons-components";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSelector } from "react-redux";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomButton, CustomText } from "../general";

interface BvnInputFormProps {
  onNext?: (data?: any) => void;
  onBack?: () => void;
}

export default function BvnInputForm({ onNext, onBack }: BvnInputFormProps) {
  const [bvn, setBvn] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme<Theme>();
  const { uploadCreditDocument, updateUser } = useKyc();
  const { user } = useSelector((state: AppRootState) => state.kyc);

  const handleVerifyBvn = async () => {
    if (!bvn.trim() || !firstname.trim() || !lastname.trim()) {
      return;
    }

    try {
      setLoading(true);

      await uploadCreditDocument({
        firstName: firstname.trim(),
        lastName: lastname.trim(),
        verificationType: "BVN",
        idNumber: bvn.trim(),
        docUrl: "https://example.com/uploads/id.jpg",
        countryId:
          user?.metaData?.documentVerification?.selectedVerifiedCountry?._id,
      });

      updateUser(user);

      // On success, proceed to next step
      onNext?.({
        bvnVerified: true,
        bvn: bvn.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
      });
    } catch (error: any) {
      console.error("BVN verification error:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={62}
        // behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, marginBottom: 62 }}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.container}>
          {/* Back Button */}
          {onBack && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <ThemedBackIcon />
            </Pressable>
          )}

          <View style={styles.header}>
            <CustomText variant="header" style={styles.title}>
              BVN Verification
            </CustomText>
            <CustomText variant="body" style={styles.subtitle}>
              Please provide your bank verification number.
            </CustomText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <CustomInputWithoutForm
                  label="First Name"
                  placeholder="Enter First Name"
                  value={firstname}
                  onChange={setFirstname}
                  keyboardType="default"
                />
              </View>
              <View style={styles.nameField}>
                <CustomInputWithoutForm
                  label="Last Name"
                  placeholder="Enter Last Name"
                  value={lastname}
                  onChange={setLastname}
                  keyboardType="default"
                />
              </View>
            </View>

            <CustomInputWithoutForm
              label="Bank Verification Number"
              placeholder="Enter Bank Verification Number"
              value={bvn}
              onChange={setBvn}
              keyboardType="numeric"
            />

            <View
              style={[
                styles.infoBox,
                { backgroundColor: theme.colors.secondaryBackgroundColor },
              ]}
            >
              <CustomText
                style={[
                  styles.infoTitle,
                  { color: theme.colors.bodyTextColor },
                ]}
              >
                We need only access to your
              </CustomText>

              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <CustomText style={styles.bullet}>•</CustomText>
                  <CustomText
                    style={[
                      styles.infoText,
                      { color: theme.colors.bodyTextColor },
                    ]}
                  >
                    Full name
                  </CustomText>
                </View>
                <View style={styles.infoItem}>
                  <CustomText style={styles.bullet}>•</CustomText>
                  <CustomText
                    style={[
                      styles.infoText,
                      { color: theme.colors.bodyTextColor },
                    ]}
                  >
                    Date of Birth
                  </CustomText>
                </View>
                <View style={styles.infoItem}>
                  <CustomText style={styles.bullet}>•</CustomText>
                  <CustomText
                    style={[
                      styles.infoText,
                      { color: theme.colors.bodyTextColor },
                    ]}
                  >
                    Phone number
                  </CustomText>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.borderColor },
                ]}
              />

              <View style={styles.securityInfo}>
                <View
                  style={[
                    styles.lockIconContainer,
                    { backgroundColor: theme.colors.primaryColor + "15" },
                  ]}
                >
                  <ThemedLockPasswordIcon
                    width={16}
                    height={16}
                    lightModeColor="#6045FF"
                    darkModeColor="#C7E64D"
                  />
                </View>
                <View style={styles.securityTextContainer}>
                  <CustomText
                    style={[
                      styles.securityText,
                      { color: theme.colors.bodyTextColor },
                    ]}
                  >
                    Your BVN does not give us access to your bank accounts or
                    transactions.
                  </CustomText>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.buttonContainer}>
        <CustomButton
          text="Verify"
          onPress={handleVerifyBvn}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          variant="bodySubheader"
          fontSize={16}
          disabled={!bvn.trim() || !firstname.trim() || !lastname.trim()}
          disabledColor={theme.colors.borderColor}
          isLoading={loading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
  backButton: {
    position: "absolute",
    top: -5,
    left: 0,
    zIndex: 1,
  },
  backArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  header: {
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  formContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoList: {
    marginTop: 4,
    marginLeft: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bullet: {
    marginRight: 8,
    marginBottom: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  lockIconContainer: {
    padding: 8,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  securityTextContainer: {
    flex: 1,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 130,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
});
