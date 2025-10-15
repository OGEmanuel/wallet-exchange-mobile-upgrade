import icons from "@/assets/icons";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { BankAccount, Currency } from "@/interfaces/account.interface";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectSettingState } from "@/src/modules/settings/presentation/state/settings-slice";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ChevronRight } from "lucide-react-native";
import React, { forwardRef, useCallback, useState } from "react";
import { Alert, Image, Pressable, TextInput } from "react-native";
import { useSelector } from "react-redux";
import { Box, CustomButton, CustomText } from "../general";

interface BankAccountBottomSheetProps {
  selectedCurrency?: Currency;
  onAccountAdded?: (account: BankAccount) => void;
}

const BankAccountBottomSheet = forwardRef<
  BottomSheet,
  BankAccountBottomSheetProps
>(({ onAccountAdded }, ref) => {
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
  const [loading, setLoading] = React.useState(false);
  const { bankBottomSheetRef } = useBottomSheetRefs();
  const { createAccount } = useSettings();
  const { activeCurrency: selectedCurrency, activeBank } =
    useSelector(selectSettingState);
  const userDetails = useSelector(selectUser);

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

  React.useEffect(() => {
    if (activeBank) {
      setFormData((prev) => ({
        ...prev,
        bankName: activeBank?.name as string,
      }));
    }
  }, [activeBank]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAccount = () => {
    // Basic validation
    if (!formData.accountHolderName || !formData.accountNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Currency-specific validation
    if (selectedCurrency === "GBP" && !formData.sortCode) {
      Alert.alert("Error", "Sort Code is required for GBP accounts");
      return;
    }

    if (
      selectedCurrency === "CAD" &&
      (!formData.institutionNumber || !formData.transitNumber)
    ) {
      Alert.alert(
        "Error",
        "Institution Number and Transit Number are required for CAD accounts"
      );
      return;
    }

    if (selectedCurrency === "EUR" && !formData.iban) {
      Alert.alert("Error", "IBAN is required for EUR accounts");
      return;
    }

    if (selectedCurrency === "USD" && !formData.wireRoutingNumber) {
      Alert.alert("Error", "Wire Routing Number is required for USD accounts");
      return;
    }

    if (selectedCurrency === "NGN" && !formData.bankName) {
      Alert.alert("Error", "Please select a bank for NGN accounts");
      return;
    }

    // Create new account object with only filled fields
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      currency: selectedCurrency!,
      createdAt: new Date().toISOString(),
      // Only include fields that are actually filled
      ...(formData.accountType && { accountType: formData.accountType }),
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

    // console.log("Adding account:", newAccount);

    try {
      setLoading(true);
      createAccount({
        body: {
          currencyId: selectedCurrency ? selectedCurrency: undefined,
          userId: userDetails?._id as string,
          bankId: activeBank ? activeBank._id : undefined,
          holderName: formData.accountHolderName
            ? formData.accountHolderName
            : undefined,
        },
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }

    setFormData({
      accountHolderName: "",
      accountNumber: "",
      sortCode: "",
      institutionNumber: "",
      transitNumber: "",
      iban: "",
      wireRoutingNumber: "",
      accountType: "checking",
      bankName: "",
    });

    // Close bottomsheet and notify parent
    if (ref && "current" in ref && ref.current) {
      ref.current.close();
    }
    onAccountAdded?.(newAccount);
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
            // Here you would show a bank selection modal
            bankBottomSheetRef.current?.snapToIndex(1);
          }}
        >
          <CustomText
            color={
              formData.bankName ? "headerTextColor" : "placeholderTextColor"
            }
          >
            {activeBank?.name || "Select Bank"}
          </CustomText>
          <ChevronRight size={20} color={theme.colors.bodyTextColor} />
        </Pressable>
      </Box>

      {/* Account Number */}
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
          }}
          placeholder="0123456789"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={formData.accountNumber}
          onChangeText={(value) => handleInputChange("accountNumber", value)}
          keyboardType="numeric"
        />
      </Box>

      {/* Warning */}
      <Box
        style={{
          backgroundColor: "#363407",
        }}
        padding="s"
        borderRadius={8}
        marginBottom="m"
        flexDirection="row"
        alignItems="center"
      >
        <Image
          source={icons.alertCircle}
          style={{ width: 20, height: 20, marginRight: 8 }}
        />
        <CustomText variant="body" color="bodyTextColor" flex={1}>
          Only personal accounts allowed
        </CustomText>
      </Box>

      {/* Account Name (Autofilled) */}
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
            bankBottomSheetRef.current?.snapToIndex(1);
          }}
        >
          <Box flexDirection="row" alignItems="center">
            <CustomText fontSize={16} marginRight="s">
              🏦
            </CustomText>
            <CustomText>{activeBank?.name || "ACH"}</CustomText>
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
    switch (selectedCurrency) {
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
            Add {selectedCurrency} Account
          </CustomText>
        </Box>

        {renderForm()}

        <Box marginTop="l">
          <CustomButton
            text={"Add account"}
            onPress={handleAddAccount}
            width={"100%"}
            borderRadius={50}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default BankAccountBottomSheet;
