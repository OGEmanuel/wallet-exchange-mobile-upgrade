import { useTabBarHeight } from "@/hooks/useTabBarHeight";
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
import { AlertCircle, Search, X } from "lucide-react-native";
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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import EmptyState from "../dashboard/market/EmptyState";
import BankIcon from "../general/BankIcon";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import BankAccountCard from "../swap/BankAccountCard";
import BankAccountsList from "./BankAccountsList";

interface BankAccountsBottomSheetProps {
  onBankAccountSelect?: (bankAccount: UserBankAccount | null) => void;
  onClose?: () => void;
  onContinue?: (bankAccount: UserBankAccount | null) => void;
  targetCurrency: ISupportedCurrency | null;
  initialView?: "list" | "add"; // Control initial view: list or add account form
}

const BankAccountsBottomSheet = forwardRef<
  BottomSheet,
  BankAccountsBottomSheetProps
>(
  (
    {
      onBankAccountSelect,
      onClose,
      onContinue,
      targetCurrency,
      initialView = "list",
    },
    ref
  ) => {
    const theme = useTheme<Theme>();
    const { tabBarHeight } = useTabBarHeight();
    const [selectedAccount, setSelectedAccount] =
      useState<UserBankAccount | null>(null);
    const [accountsSearchQuery, setAccountsSearchQuery] = useState("");
    const [showAddAccountModal, setShowAddAccountModal] = useState(
      initialView === "add"
    );
    const [accountNumber, setAccountNumber] = useState("");
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [showBankSelector, setShowBankSelector] = useState(false);
    const [banksSearchQuery, setBanksSearchQuery] = useState("");

    // Animation for account name input glow
    const glowAnimation = useRef(new Animated.Value(0)).current;

    // Update showAddAccountModal when initialView prop changes
    useEffect(() => {
      if (initialView === "add") {
        setShowAddAccountModal(true);
      } else {
        setShowAddAccountModal(false);
      }
    }, [initialView]);

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
      getBankById,
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

    const filteredBankAccounts = bankAccounts.filter(
      (account) =>
        // account._id !== selectedAccount?._id &&
        (account.name
          .toLowerCase()
          .includes(accountsSearchQuery.toLowerCase()) ||
          account.holderName
            .toLowerCase()
            .includes(accountsSearchQuery.toLowerCase()))
    );

    const filteredBanks = banks.filter((bank) =>
      bank.name.toLowerCase().includes(banksSearchQuery.toLowerCase())
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
            <Box marginRight="m">
              <BankIcon bank={item} size={40} borderRadius={20} />
            </Box>
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
                  <TouchableOpacity
                    onPress={() => setShowAddAccountModal(false)}
                  >
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
        snapPoints={["95%", "95%"]}
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
            justifyContent: "space-between",
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

          <Box maxHeight={SCREEN_HEIGHT * 0.5}>
            {selectedAccount ? (() => {
              const bankId = typeof selectedAccount.bankId === 'string' 
                ? selectedAccount.bankId 
                : (selectedAccount.bankId as any)?._id;
              const bank = bankId ? getBankById(bankId) : null;
              const bankName = bank?.name || (selectedAccount.bankId as any)?.name || null;
              
              return (
                <BankAccountCard
                  onPress={() => handleBankAccountSelect(null)}
                  bankAccount={selectedAccount}
                  bankName={bankName}
                  selected={true}
                />
              );
            })() : null}
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

          <Box gap="m" marginTop="s" width="100%">
            {filteredBankAccounts.length > 0 ? (
              <CustomButton
                text="Continue"
                width="100%"
                borderRadius={30}
                onPress={() => {
                  if (selectedAccount) {
                    onContinue?.(selectedAccount);
                  }
                }}
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
  }
);

BankAccountsBottomSheet.displayName = "BankAccountsBottomSheet";

export default BankAccountsBottomSheet;
