import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useChains } from "@/src/core/chains/chains-context";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@shopify/restyle";
import { ICurrency } from "@zap/blockchain-sdk";
import { Check, MoreHorizontalIcon, Search } from "lucide-react-native";
import React, { forwardRef, useCallback, useEffect } from "react";
import { Pressable } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import Box from "../general/Box";
import ChainLogo from "../general/ChainLogo";
import CustomText from "../general/CustomText";

interface SelectChainBottomSheetProps {
  onChainSelect?: (chainSymbol: string) => void;
  onClose?: () => void;
  shouldAutoOpen?: boolean; // Control whether to auto-open on mount
}

const SelectChainBottomSheet = forwardRef<
  BottomSheetMethods,
  SelectChainBottomSheetProps
>(({ onChainSelect, onClose, shouldAutoOpen = false }, ref) => {
  const theme = useTheme<Theme>();
  const { walletChains, isLoading, getChainImage } = useChains();
  const [activeChain, setActiveChain] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const { tabBarHeight } = useTabBarHeight();
  // Filter chains based on search query
  const filteredChains = walletChains.filter(
    (chain) =>
      chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate top chains (ETH, BTC, SOL) from the rest
  const topChains = filteredChains.filter((chain) =>
    ["ETH", "BTC", "SOL"].includes(chain.symbol)
  );

  const otherChains = filteredChains.filter(
    (chain) => !["ETH", "BTC", "SOL"].includes(chain.symbol)
  );

  const handleChainSelect = (chainSymbol: string) => {
    setActiveChain(chainSymbol);
    onChainSelect?.(chainSymbol);
  };

  // Track previous value to detect when shouldAutoOpen changes from false to true
  // Initialize to false to prevent auto-open on initial mount
  const prevShouldAutoOpen = React.useRef(false);
  
  // Open the sheet when shouldAutoOpen becomes true (not on initial mount if false)
  useEffect(() => {
    // Only open if shouldAutoOpen is true AND it changed from false to true
    // This prevents opening on initial mount when shouldAutoOpen is false
    if (shouldAutoOpen && !prevShouldAutoOpen.current) {
    const timer = setTimeout(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.snapToIndex(0);
      }
      }, 100);
      prevShouldAutoOpen.current = shouldAutoOpen;
    return () => clearTimeout(timer);
    }
    
    // Update the ref to track the current value (only if it actually changed)
    if (prevShouldAutoOpen.current !== shouldAutoOpen) {
      prevShouldAutoOpen.current = shouldAutoOpen;
    }
  }, [shouldAutoOpen, ref]); // Only run when shouldAutoOpen changes

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
        enableTouchThrough={false}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["70%"]}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      onChange={(index) => {
        // Ensure it stays closed unless explicitly opened
        if (index === -1) {
          // Sheet is closed - call onClose if provided
          onClose?.();
        }
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
      <BottomSheetScrollView
        style={{
          flex: 1,
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 25,
          paddingBottom: tabBarHeight + 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <CustomInputWithoutForm
          value={searchQuery}
          onChange={setSearchQuery}
          label=""
          placeholder="Search chains"
          placeholderTextColor={theme.colors.disabledTextColor}
          iconLeft={<Search size={20} color={theme.colors.bodyTextColor} />}
        />

        {/* CHAINS */}
        {isLoading ? (
          <Box
            width={"100%"}
            height={"auto"}
            backgroundColor="secondaryBackgroundColor"
            borderRadius={20}
            padding="m"
            mt="m"
            justifyContent="center"
            alignItems="center"
          >
            <CustomText variant="body" fontSize={14} color="bodyTextColor">
              Loading chains...
            </CustomText>
          </Box>
        ) : (
          <>
            {/* TOP CHAINS (ETH, BTC, SOL) */}
            {topChains.length > 0 && (
              <Box
                width={"100%"}
                height={"auto"}
                backgroundColor="secondaryBackgroundColor"
                borderRadius={20}
                paddingHorizontal="m"
                mt="m"
                paddingVertical="s"
              >
                <Pressable
                  style={{
                    width: "100%",
                    height: 60,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onPress={() => handleChainSelect("ALL")}
                >
                  <Box flexDirection="row" alignItems="center">
                    {/* Chain Icon */}
                    <Box
                      width={32}
                      height={32}
                      borderRadius={16}
                      backgroundColor="black"
                      justifyContent="center"
                      alignItems="center"
                      mr="m"
                    >
                      <MoreHorizontalIcon
                        width={20}
                        height={20}
                        color="white"
                      />
                    </Box>
                    <Box>
                      <CustomText variant="body" fontSize={14} color="white">
                        All Chains
                      </CustomText>
                    </Box>
                  </Box>
                  {activeChain === "ALL" && (
                    <Box
                      width={28}
                      height={28}
                      borderRadius={28}
                      backgroundColor="success"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Check size={20} color="white" />
                    </Box>
                  )}
                </Pressable>
                {topChains.map((chain, index) => {
                  const chainImage = getChainImage
                    ? getChainImage(chain._id || "")
                    : (chain.nativeCurrencyId as ICurrency)?.logo;
                  return (
                    <Pressable
                      key={chain._id}
                      style={{
                        width: "100%",
                        height: 60,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onPress={() => handleChainSelect(chain.symbol)}
                    >
                      <Box flexDirection="row" alignItems="center">
                        {/* Chain Icon */}
                        <ChainLogo
                          symbol={chain.symbol}
                          name={chain.name}
                          logoUrl={chainImage}
                          width={32}
                          height={32}
                          style={{ marginRight: theme.spacing.m }}
                        />
                        <Box>
                          <CustomText
                            variant="body"
                            fontSize={14}
                            color="white"
                          >
                            {chain.name}
                          </CustomText>
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color="bodyTextColor"
                          >
                            {chain.symbol}
                          </CustomText>
                        </Box>
                      </Box>
                      {activeChain === chain.symbol && (
                        <Box
                          width={28}
                          height={28}
                          borderRadius={28}
                          backgroundColor="success"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Check size={20} color="white" />
                        </Box>
                      )}
                    </Pressable>
                  );
                })}
              </Box>
            )}

            {/* OTHER CHAINS */}
            {otherChains.length > 0 && (
              <Box
                width={"100%"}
                height={"auto"}
                backgroundColor="secondaryBackgroundColor"
                borderRadius={20}
                paddingHorizontal="m"
                mt="m"
                style={{marginBottom: tabBarHeight + 10}}
              >
                {otherChains.map((chain, index) => {
                  const chainImage = getChainImage
                    ? getChainImage(chain._id || "")
                    : (chain.nativeCurrencyId as ICurrency)?.logo;
                  return (
                    <Pressable
                      key={chain._id}
                      style={{
                        width: "100%",
                        height: 60,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onPress={() => handleChainSelect(chain.symbol)}
                    >
                      <Box flexDirection="row" alignItems="center">
                        {/* Chain Icon */}
                        <ChainLogo
                          symbol={chain.symbol}
                          name={chain.name}
                          logoUrl={chainImage}
                          width={32}
                          height={32}
                          style={{ marginRight: theme.spacing.m }}
                        />
                        <Box>
                          <CustomText
                            variant="body"
                            fontSize={14}
                            color="white"
                          >
                            {chain.name}
                          </CustomText>
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color="bodyTextColor"
                          >
                            {chain.symbol}
                          </CustomText>
                        </Box>
                      </Box>
                      {activeChain === chain.symbol && (
                        <Box
                          width={28}
                          height={28}
                          borderRadius={28}
                          backgroundColor="success"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Check size={20} color="white" />
                        </Box>
                      )}
                    </Pressable>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

SelectChainBottomSheet.displayName = "SelectChainBottomSheet";

export default SelectChainBottomSheet;
