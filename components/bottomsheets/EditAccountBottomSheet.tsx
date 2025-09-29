import { BankAccount } from "@/interfaces/account.interface";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ChevronRight } from "lucide-react-native";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { Alert, Pressable, TextInput } from "react-native";
import { Box, CustomButton, CustomText } from "../general";

interface EditAccountBottomSheetProps {
  account: BankAccount | null;
  onAccountUpdated?: (updatedAccount: BankAccount) => void;
}

const EditAccountBottomSheet = forwardRef<
  BottomSheet,
  EditAccountBottomSheetProps
>(({ account, onAccountUpdated }, ref) => {
  const theme = useTheme<Theme>();
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    sortCode: "",
    institutionNumber: "",
    transitNumber: "",
    iban: "",
    wireRoutingNumber: "",
    accountType: "",
    bankName: "",
  });

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  // Populate form when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        accountHolderName: account.accountHolderName,
        accountNumber: account.accountNumber,
        sortCode: account.sortCode || "",
        institutionNumber: account.institutionNumber || "",
        transitNumber: account.transitNumber || "",
        iban: account.iban || "",
        wireRoutingNumber: account.wireRoutingNumber || "",
        accountType: account.accountType || "",
        bankName: account.bankName || "",
      });
    }
  }, [account]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateAccount = () => {
    if (!account) return;

    // Basic validation
    if (!formData.accountHolderName || !formData.accountNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Currency-specific validation
    if (account.currency.code === "GBP" && !formData.sortCode) {
      Alert.alert("Error", "Sort Code is required for GBP accounts");
      return;
    }

    if (
      account.currency.code === "CAD" &&
      (!formData.institutionNumber || !formData.transitNumber)
    ) {
      Alert.alert(
        "Error",
        "Institution Number and Transit Number are required for CAD accounts"
      );
      return;
    }

    if (account.currency.code === "EUR" && !formData.iban) {
      Alert.alert("Error", "IBAN is required for EUR accounts");
      return;
    }

    if (account.currency.code === "USD" && !formData.wireRoutingNumber) {
      Alert.alert("Error", "Wire Routing Number is required for USD accounts");
      return;
    }

    if (account.currency.code === "NGN" && !formData.bankName) {
      Alert.alert("Error", "Please select a bank for NGN accounts");
      return;
    }

    // Create updated account object with only filled fields
    const updatedAccount: BankAccount = {
      ...account, // Keep existing account data
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      // Only include fields that are actually filled
      ...(formData.accountType && {
        accountType: formData.accountType as "checking" | "savings",
      }),
      ...(formData.sortCode && { sortCode: formData.sortCode }),
      ...(formData.institutionNumber && {
        institutionNumber: formData.institutionNumber,
      }),
      ...(formData.transitNumber && { transitNumber: formData.transitNumber }),
      ...(formData.iban && { iban: formData.iban }),
      ...(formData.wireRoutingNumber && {
        wireRoutingNumber: formData.wireRoutingNumber,
      }),
      ...(formData.bankName && { bankName: formData.bankName }),
    };

    // console.log("Updating account:", updatedAccount);

    // Close bottomsheet and notify parent
    if (ref && "current" in ref && ref.current) {
      ref.current.close();
    }
    onAccountUpdated?.(updatedAccount);
  };

  const renderNGNForm = () => (
    <>
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Select Bank
        </CustomText>
        <Pressable
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            Alert.alert(
              "Bank Selection",
              "Bank selection modal would open here"
            );
          }}
        >
          <CustomText
            color={
              formData.bankName ? "headerTextColor" : "placeholderTextColor"
            }
          >
            {formData.bankName || "Select Bank"}
          </CustomText>
          <ChevronRight size={20} color={theme.colors.bodyTextColor} />
        </Pressable>
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="0123456789"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountNumber}
          onChangeText={(value) => handleInputChange("accountNumber", value)}
          keyboardType="numeric"
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Name (Autofilled)
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Account Name"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountHolderName}
          onChangeText={(value) =>
            handleInputChange("accountHolderName", value)
          }
          editable={false}
        />
      </Box>
    </>
  );

  const renderGBPForm = () => (
    <>
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Holder name
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account holder name"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountHolderName}
          onChangeText={(value) =>
            handleInputChange("accountHolderName", value)
          }
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account number"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountNumber}
          onChangeText={(value) => handleInputChange("accountNumber", value)}
          keyboardType="numeric"
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Sort Code
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter sort code"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.sortCode}
          onChangeText={(value) => handleInputChange("sortCode", value)}
          keyboardType="numeric"
        />
      </Box>
    </>
  );

  const renderCADForm = () => (
    <>
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Holder name
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account holder name"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountHolderName}
          onChangeText={(value) =>
            handleInputChange("accountHolderName", value)
          }
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Institution number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter institution number"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.institutionNumber}
          onChangeText={(value) =>
            handleInputChange("institutionNumber", value)
          }
          keyboardType="numeric"
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Transit Number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter transit number"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.transitNumber}
          onChangeText={(value) => handleInputChange("transitNumber", value)}
          keyboardType="numeric"
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account number"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountNumber}
          onChangeText={(value) => handleInputChange("accountNumber", value)}
          keyboardType="numeric"
        />
      </Box>

      {/* Account Type */}
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Type
        </CustomText>
        <Box flexDirection="row" marginBottom="s">
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 20,
            }}
            onPress={() => handleInputChange("accountType", "checking")}
          >
            <Box
              width={20}
              height={20}
              borderRadius={10}
              borderWidth={2}
              borderColor={
                formData.accountType === "checking"
                  ? "primaryColor"
                  : "borderColor"
              }
              bg={
                formData.accountType === "checking" ? "primaryColor" : undefined
              }
              marginRight="s"
              alignItems="center"
              justifyContent="center"
            >
              {formData.accountType === "checking" && (
                <Box width={8} height={8} borderRadius={4} bg="white" />
              )}
            </Box>
            <CustomText variant="body">Checking</CustomText>
          </Pressable>
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleInputChange("accountType", "savings")}
          >
            <Box
              width={20}
              height={20}
              borderRadius={10}
              borderWidth={2}
              borderColor={
                formData.accountType === "savings"
                  ? "primaryColor"
                  : "borderColor"
              }
              bg={
                formData.accountType === "savings" ? "primaryColor" : undefined
              }
              marginRight="s"
              alignItems="center"
              justifyContent="center"
            >
              {formData.accountType === "savings" && (
                <Box width={8} height={8} borderRadius={4} bg="white" />
              )}
            </Box>
            <CustomText variant="body">Savings</CustomText>
          </Pressable>
        </Box>
      </Box>
    </>
  );

  const renderEURForm = () => (
    <>
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Holder name
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account holder name"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountHolderName}
          onChangeText={(value) =>
            handleInputChange("accountHolderName", value)
          }
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          IBAN
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter IBAN"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.iban}
          onChangeText={(value) => handleInputChange("iban", value)}
          autoCapitalize="characters"
        />
      </Box>
    </>
  );

  const renderUSDForm = () => (
    <>
      {/* Recipient's details dropdown */}
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Recipient's details
        </CustomText>
        <Pressable
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            Alert.alert("Recipient Details", "ACH selection would open here");
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <CustomText fontSize={16} marginRight="s">
              🏦
            </CustomText>
            <CustomText>ACH</CustomText>
          </Box>
          <ChevronRight size={20} color={theme.colors.bodyTextColor} />
        </Pressable>
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Holder name
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account holder name"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountHolderName}
          onChangeText={(value) =>
            handleInputChange("accountHolderName", value)
          }
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Wire routing number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter wire routing number"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.wireRoutingNumber}
          onChangeText={(value) =>
            handleInputChange("wireRoutingNumber", value)
          }
          keyboardType="numeric"
        />
      </Box>

      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Number
        </CustomText>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: theme.colors.borderColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
            backgroundColor: theme.colors.secondaryBackgroundColor,
          }}
          placeholder="Enter account number"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountNumber}
          onChangeText={(value) => handleInputChange("accountNumber", value)}
          keyboardType="numeric"
        />
      </Box>

      {/* Account Type */}
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          Account Type
        </CustomText>
        <Box flexDirection="row" marginBottom="s">
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 20,
            }}
            onPress={() => handleInputChange("accountType", "checking")}
          >
            <Box
              width={20}
              height={20}
              borderRadius={10}
              borderWidth={2}
              borderColor={
                formData.accountType === "checking"
                  ? "primaryColor"
                  : "borderColor"
              }
              bg={
                formData.accountType === "checking" ? "primaryColor" : undefined
              }
              marginRight="s"
              alignItems="center"
              justifyContent="center"
            >
              {formData.accountType === "checking" && (
                <Box width={8} height={8} borderRadius={4} bg="white" />
              )}
            </Box>
            <CustomText variant="body">Checking</CustomText>
          </Pressable>
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleInputChange("accountType", "savings")}
          >
            <Box
              width={20}
              height={20}
              borderRadius={10}
              borderWidth={2}
              borderColor={
                formData.accountType === "savings"
                  ? "primaryColor"
                  : "borderColor"
              }
              bg={
                formData.accountType === "savings" ? "primaryColor" : undefined
              }
              marginRight="s"
              alignItems="center"
              justifyContent="center"
            >
              {formData.accountType === "savings" && (
                <Box width={8} height={8} borderRadius={4} bg="white" />
              )}
            </Box>
            <CustomText variant="body">Savings</CustomText>
          </Pressable>
        </Box>
      </Box>
    </>
  );

  const renderForm = () => {
    if (!account) return null;

    switch (account.currency.code) {
      case "NGN":
        return renderNGNForm();
      case "GBP":
        return renderGBPForm();
      case "CAD":
        return renderCADForm();
      case "EUR":
        return renderEURForm();
      case "USD":
        return renderUSDForm();
      default:
        return null;
    }
  };

  if (!account) return null;

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
        </Box>
      )}
    >
      <BottomSheetView
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >
        <Box marginBottom="l">
          <CustomText
            variant="bodyBold"
            textAlign="center"
            style={{ fontFamily: "NewScience_Bold" }}
          >
            Account details
          </CustomText>
        </Box>

        {renderForm()}

        <Box marginTop="l">
          <CustomButton
            text="Update details"
            onPress={handleUpdateAccount}
            width="100%"
            borderRadius={50}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default EditAccountBottomSheet;
