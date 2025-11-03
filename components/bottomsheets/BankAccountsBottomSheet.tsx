import { useBankAccounts } from "@/src/modules/swap/presentation/hooks/useBankAccounts";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  SCREEN_HEIGHT,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Bank, ISupportedCurrency, UserBankAccount } from "@zap/blockchain-sdk";
import { ArrowDown2 } from "iconsax-react-nativejs";
import { AlertCircle, Check, Search, X } from "lucide-react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import EmptyState from "../dashboard/market/EmptyState";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import BankAccountCard from "../swap/BankAccountCard";
import BankAccountsList from "./BankAccountsList";

interface BankAccountsBottomSheetProps {
  onBankAccountSelect?: (bankAccount: UserBankAccount | null) => void;
  onClose?: () => void;
  onContinue?: () => void;
  targetCurrency: ISupportedCurrency | null;
}

const BankAccountsBottomSheet = forwardRef<
  BottomSheet,
  BankAccountsBottomSheetProps
>(({ onBankAccountSelect, onClose, onContinue, targetCurrency }, ref) => {
  const theme = useTheme<Theme>();
  const [selectedAccount, setSelectedAccount] =
    useState<UserBankAccount | null>(null);
  const [accountsSearchQuery, setAccountsSearchQuery] = useState("");
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [banksSearchQuery, setBanksSearchQuery] = useState("");

  // Animation for account name input glow
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const {
    bankAccounts,
    banks,
    isLoadingBankAccounts,
    isLoadingBanks,
    resolvedAccount,
    isResolvingAccount,
    resolveBankAccount,
    fetchBankAccounts,
    errorResolvingAccount,
    createBankAccount,
    isCreatingBankAccount,
    errorCreatingBankAccount,
  } = useBankAccounts();

  // Glow animation effect
  useEffect(() => {
    if (isResolvingAccount) {
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      glowLoop.start();
      return () => glowLoop.stop();
    } else {
      glowAnimation.setValue(0);
    }
  }, [isResolvingAccount, glowAnimation]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  const handleBankAccountSelect = useCallback(
    (bankAccount: UserBankAccount | null) => {
      setSelectedAccount(bankAccount);
      if (onBankAccountSelect) {
        onBankAccountSelect(bankAccount);
      }
    },
    [onBankAccountSelect]
  );

  const handleAddAccount = useCallback(() => {
    setShowAddAccountModal(true);
  }, []);

  const handleAccountNumberChange = useCallback(
    async (text: string) => {
      setAccountNumber(text);
      if (text.length === 10 && selectedBank) {
        try {
          await resolveBankAccount(selectedBank._id, text);
        } catch (error: any) {
          console.error("Failed to resolve account:", error);
        }
      }
    },
    [selectedBank, resolveBankAccount]
  );

  const handleBankSelect = useCallback((bank: Bank) => {
    setSelectedBank(bank);
    setShowBankSelector(false);
    setShowAddAccountModal(true);
  }, []);

  const filteredBankAccounts = bankAccounts.filter((account) =>
    account.name.toLowerCase().includes(accountsSearchQuery.toLowerCase())
  );

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(banksSearchQuery.toLowerCase())
  );

  const renderBankAccount = useCallback(
    ({ item }: { item: UserBankAccount }) => (
      <TouchableOpacity
        onPress={() => handleBankAccountSelect(item)}
        style={{
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: selectedAccount?._id === item._id ? 2 : 0,
          borderColor:
            selectedAccount?._id === item._id
              ? theme.colors.primaryColor
              : "transparent",
        }}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <Box
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="primaryColor"
              alignItems="center"
              justifyContent="center"
              marginRight="m"
            >
              <CustomText variant="body" color="white" fontSize={12}>
                {(item.bankId as unknown as Bank)?.name?.charAt(0) || "B"}
              </CustomText>
            </Box>
            <Box flex={1}>
              <CustomText variant="body" color="headerTextColor" fontSize={16}>
                {item.name}
              </CustomText>
              <CustomText variant="body" color="bodyTextColor" fontSize={14}>
                ...{item.number?.slice(-4)}
              </CustomText>
            </Box>
          </Box>
          {selectedAccount?._id === item._id && (
            <Box
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor="primaryColor"
              alignItems="center"
              justifyContent="center"
            >
              <Check size={16} color="white" />
            </Box>
          )}
        </Box>
      </TouchableOpacity>
    ),
    [selectedAccount, theme.colors, handleBankAccountSelect]
  );

  const renderBank = useCallback(
    ({ item }: { item: Bank }) => (
      <TouchableOpacity
        onPress={() => handleBankSelect(item)}
        style={{
          backgroundColor: theme.colors.surfaceContainer,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Box flexDirection="row" alignItems="center">
          {item.icon ? (
            <Image
              source={{ uri: item.icon }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 16,
              }}
            />
          ) : (
            <Box
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="primaryColor"
              alignItems="center"
              justifyContent="center"
              marginRight="m"
            >
              <CustomText variant="body" color="white" fontSize={12}>
                {item.name?.charAt(0) || "B"}
              </CustomText>
            </Box>
          )}
          <CustomText variant="body" color="headerTextColor" fontSize={16}>
            {item.name}
          </CustomText>
        </Box>
      </TouchableOpacity>
    ),
    [theme.colors, handleBankSelect]
  );

  if (showAddAccountModal) {
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["90%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={() => setShowAddAccountModal(false)}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.white,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <BottomSheetView
              style={{
                flex: 1,
                backgroundColor: theme.colors.mainBackgroundColor,
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="l"
              >
                <TouchableOpacity onPress={() => setShowAddAccountModal(false)}>
                  <X size={24} color={theme.colors.headerTextColor} />
                </TouchableOpacity>
                <CustomText
                  variant="medium"
                  fontSize={18}
                  color="headerTextColor"
                >
                  Add Account
                </CustomText>
                <Box width={24} />
              </Box>

              <Box marginBottom="l">
                <CustomText
                  variant="body"
                  color="bodyTextColor"
                  marginBottom="s"
                >
                  Bank
                </CustomText>
                <TouchableOpacity
                  onPress={() => {
                    setShowBankSelector(true);
                    setShowAddAccountModal(false);
                  }}
                  style={{
                    backgroundColor: theme.colors.surfaceContainer,
                    borderRadius: 8,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <CustomText color="headerTextColor" fontSize={16}>
                    {selectedBank?.name || "Select Bank"}
                  </CustomText>
                  <ArrowDown2 size={20} color={theme.colors.bodyTextColor} />
                </TouchableOpacity>
              </Box>

              <Box marginBottom="m">
                <CustomText
                  variant="body"
                  color="bodyTextColor"
                  marginBottom="s"
                >
                  Account Number
                </CustomText>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surfaceContainer,
                    borderRadius: 8,
                    padding: 16,
                    color: theme.colors.headerTextColor,
                    fontSize: 16,
                  }}
                  placeholder="Enter account number"
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </Box>
              <Box
                flexDirection="row"
                alignItems="center"
                gap="s"
                mb="m"
                style={{ backgroundColor: "rgba(237, 177, 24, 0.15)" }}
                padding="s"
                borderRadius={8}
              >
                <AlertCircle color={theme.colors.pendingColor} size={16} />
                <CustomText fontSize={12}>
                  Only personal accounts allowed
                </CustomText>
              </Box>

              <Box marginBottom="l">
                <CustomText
                  variant="body"
                  color="bodyTextColor"
                  marginBottom="s"
                >
                  Account Name
                </CustomText>
                <Animated.View
                  style={{
                    borderWidth: 2,
                    borderRadius: 8,
                    borderColor: isResolvingAccount
                      ? glowAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            theme.colors.primaryColor,
                            theme.colors.secondaryColor + "80",
                          ],
                        })
                      : errorResolvingAccount
                      ? theme.colors.error
                      : "transparent",
                    shadowColor: isResolvingAccount
                      ? theme.colors.primaryColor
                      : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.6],
                    }),
                    shadowRadius: glowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    }),
                    elevation: isResolvingAccount ? 4 : 0,
                  }}
                >
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.surfaceContainer,
                      borderRadius: 6,
                      padding: 16,
                      color: theme.colors.headerTextColor,
                      fontSize: 16,
                      marginBottom: errorResolvingAccount ? 5 : 0,
                    }}
                    placeholder="Name will show here"
                    placeholderTextColor={theme.colors.placeholderTextColor}
                    value={resolvedAccount?.name}
                    editable={false}
                  />
                </Animated.View>
                <CustomText variant="body" color="error" fontSize={14}>
                  {errorResolvingAccount}
                </CustomText>
              </Box>

              {errorCreatingBankAccount && (
                <Box marginBottom="m">
                  <CustomText variant="body" color="error" fontSize={14}>
                    {errorCreatingBankAccount}
                  </CustomText>
                </Box>
              )}

              <CustomButton
                text="Add Account"
                onPress={async () => {
                  if (!selectedBank || !resolvedAccount?.name) return;

                  try {
                    await createBankAccount(
                      selectedBank._id,
                      resolvedAccount.name,
                      targetCurrency,
                      accountNumber
                    );

                    // Reset form
                    setAccountNumber("");
                    setSelectedBank(null);
                    setShowAddAccountModal(false);
                  } catch (error) {
                    console.error("Failed to create bank account:", error);
                  }
                }}
                width={"100%"}
                borderRadius={30}
                disabled={
                  !resolvedAccount?.name ||
                  !selectedBank ||
                  isCreatingBankAccount
                }
                isLoading={isCreatingBankAccount}
              />
              <Box height={120} />
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }

  if (showBankSelector) {
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["80%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={() => {
          setShowAddAccountModal(true);
          setShowBankSelector(false);
        }}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.white,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <BottomSheetView
              style={{
                flex: 1,
                backgroundColor: theme.colors.mainBackgroundColor,
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="l"
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowAddAccountModal(true);
                    setShowBankSelector(false);
                  }}
                >
                  <X size={24} color={theme.colors.headerTextColor} />
                </TouchableOpacity>
                <CustomText
                  variant="medium"
                  fontSize={18}
                  color="headerTextColor"
                >
                  Select Bank
                </CustomText>
                <Box width={24} />
              </Box>

              <Box
                backgroundColor="secondaryBackgroundColor"
                borderRadius={8}
                paddingHorizontal="m"
                marginBottom="m"
                flexDirection="row"
                alignItems="center"
              >
                <Search size={20} color={theme.colors.bodyTextColor} />
                <TextInput
                  style={{
                    flex: 1,
                    padding: 16,
                    color: theme.colors.headerTextColor,
                    fontSize: 16,
                  }}
                  placeholder="Search banks"
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  value={banksSearchQuery}
                  onChangeText={setBanksSearchQuery}
                />
              </Box>

              <Box flex={1} height={SCREEN_HEIGHT * 0.53}>
                <FlatList
                  data={filteredBanks}
                  renderItem={renderBank}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </Box>
              <Box height={120}></Box>
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["870%", "90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.white,
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="l"
        >
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.headerTextColor} />
          </TouchableOpacity>
          <CustomText variant="medium" fontSize={18} color="headerTextColor">
            Select Receiver Account
          </CustomText>
          <Box width={24} />
        </Box>

        <Box
          backgroundColor="secondaryBackgroundColor"
          borderRadius={30}
          paddingHorizontal="m"
          marginBottom="m"
          flexDirection="row"
          alignItems="center"
        >
          <Search size={18} color={theme.colors.bodyTextColor} />
          <TextInput
            style={{
              flex: 1,
              padding: 13,
              color: theme.colors.headerTextColor,
              fontSize: 15,
            }}
            placeholder="Search"
            placeholderTextColor={theme.colors.placeholderTextColor}
            value={accountsSearchQuery}
            onChangeText={setAccountsSearchQuery}
          />
        </Box>

        <Box minHeight={SCREEN_HEIGHT * 0.3} flex={1}>
          {selectedAccount ? (
            <BankAccountCard
              onPress={() => handleBankAccountSelect(null)}
              bankAccount={selectedAccount}
              selected={true}
            />
          ) : null}
          {filteredBankAccounts.length > 0 ? (
            <BankAccountsList
              onPressAccount={handleBankAccountSelect}
              bankAccounts={filteredBankAccounts as UserBankAccount[]}
            />
          ) : (
            <EmptyState
              title="No Accounts"
              hasNoBtn
              info="Add a bank account to receive your funds"
              source={require("@/assets/images/noBank.png")}
            ></EmptyState>
          )}
        </Box>

        <Box gap="m">
          {filteredBankAccounts.length > 0 ? (
            <CustomButton
              text="Continue"
              width="100%"
              borderRadius={30}
              onPress={() => onContinue?.()}
              disabled={!selectedAccount}
              bgColor={theme.colors.primaryColor}
            />
          ) : null}
          <CustomButton
            text={
              filteredBankAccounts.length > 0
                ? "Send to a different account"
                : "Add a bank account"
            }
            width="100%"
            borderRadius={30}
            onPress={handleAddAccount}
            bgColor={
              filteredBankAccounts.length > 0
                ? theme.colors.surfaceContainer
                : theme.colors.primaryColor
            }
            color={theme.colors.headerTextColor}
          />
        </Box>
        <Box height={120} />
      </BottomSheetView>
    </BottomSheet>
  );
});

BankAccountsBottomSheet.displayName = "BankAccountsBottomSheet";

export default BankAccountsBottomSheet;
