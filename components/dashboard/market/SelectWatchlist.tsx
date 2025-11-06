import icons from "@/assets/icons";
import TokenImage from "@/components/dashboard/market/TokenImage";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { showErrorToast, showSuccessToast } from "@/src/core/utils/toast-utils";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { WatchlistTokenModel } from "@/src/modules/market/domain/entities/models/watchlist-token-model";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { marketActions } from "@/src/modules/market/presentation/state/market-slice";
import { AppRootState } from "@/state";
import { selectWalletUser } from "@/state/reducers/wallet.reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { MarketData } from "@zap/blockchain-sdk";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

type NormalizedToken = {
  currencyId: string;
  normalizedId: string;
  name: string;
  symbol: string;
  logo?: string;
  token: MarketData;
  keywords: string;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  headerIcon: {
    width: 18,
    height: 18,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 12,
  },
});

export default function SelectWatchlist() {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();

  const {
    marketTokens,
    isMarketTokensLoading,
    addToWatchlist,
    fetchWatchlistTokens,
    removeFromWatchlist,
  } = useMarket();

  const watchlistTokens = useSelector(
    (state: AppRootState) => state.market.watchlistTokens
  );
  const kycUser = useSelector((state: AppRootState) => state.kyc.user);
  const walletUser = useSelector(selectWalletUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrencyIds, setSelectedCurrencyIds] = useState<Set<string>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasUserInteractedRef = useRef(false);

  const normalizedTokens = useMemo<NormalizedToken[]>(() => {
    if (!marketTokens) {
      return [];
    }

    const seen = new Set<string>();

    return marketTokens.reduce<NormalizedToken[]>((acc, token) => {
      const currency =
        token && typeof token.currencyId === "object" && token.currencyId
          ? (token.currencyId as {
              _id?: string;
              name?: string;
              logo?: string;
              symbol?: string;
            })
          : undefined;

      const rawCurrencyId =
        typeof token.currencyId === "string"
          ? token.currencyId
          : currency?._id || "";

      const currencyId = rawCurrencyId.trim();
      const dedupeKey = currencyId.toLowerCase();

      if (!currencyId || seen.has(dedupeKey)) {
        return acc;
      }

      seen.add(dedupeKey);

      const symbol = (token.symbol || currency?.symbol || "").toUpperCase();
      const name = currency?.name || token.name || token.symbol || "";
      const keywords = [
        symbol,
        name,
        token.name,
        token.symbol,
        currency?.name,
        currency?.symbol,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const normalizedId = currencyId.toLowerCase();

      acc.push({
        currencyId,
        normalizedId,
        name,
        symbol,
        logo: currency?.logo,
        token,
        keywords,
      });
      return acc;
    }, []);
  }, [marketTokens]);

  const currencyIdLookup = useMemo(() => {
    return normalizedTokens.reduce((map, token) => {
      map.set(token.normalizedId, token.currencyId);
      return map;
    }, new Map<string, string>());
  }, [normalizedTokens]);

  const currencyIdToToken = useMemo(() => {
    return normalizedTokens.reduce((map, token) => {
      map.set(token.currencyId, token);
      return map;
    }, new Map<string, NormalizedToken>());
  }, [normalizedTokens]);

  const {
    existingWatchlistIds,
    watchlistEntriesByNormalizedId,
  } = useMemo(() => {
    const ids = new Set<string>();
    const entries = new Map<string, WatchlistTokenModel>();

    const normalize = (value?: string | null) =>
      value ? value.trim().toLowerCase() : null;

    (watchlistTokens || []).forEach((item) => {
      const directId = normalize(item.currencyId || null);
      if (directId) {
        ids.add(directId);
        entries.set(directId, item);
        return;
      }

      const marketCurrency = item.marketData?.currencyId as
        | string
        | { _id?: string };

      if (typeof marketCurrency === "string") {
        const normalizedMarketId = normalize(marketCurrency);
        if (normalizedMarketId) {
          ids.add(normalizedMarketId);
          entries.set(normalizedMarketId, item);
        }
      } else if (marketCurrency && marketCurrency._id) {
        const normalizedMarketId = normalize(marketCurrency._id);
        if (normalizedMarketId) {
          ids.add(normalizedMarketId);
          entries.set(normalizedMarketId, item);
        }
      }
    });

    return {
      existingWatchlistIds: ids,
      watchlistEntriesByNormalizedId: entries,
    };
  }, [watchlistTokens]);

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) {
      return normalizedTokens;
    }

    const query = searchQuery.trim().toLowerCase();
    return normalizedTokens.filter((token) => {
      if (!query) {
        return true;
      }

      return token.keywords.includes(query);
    });
  }, [normalizedTokens, searchQuery]);

  const tokensToAddCurrencyIds = useMemo(() => {
    return Array.from(selectedCurrencyIds)
      .filter((normalizedId) => !existingWatchlistIds.has(normalizedId))
      .map((normalizedId) => currencyIdLookup.get(normalizedId))
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0
      );
  }, [currencyIdLookup, existingWatchlistIds, selectedCurrencyIds]);

  const tokensToRemoveEntries = useMemo(() => {
    const normalizedIdsToRemove = Array.from(existingWatchlistIds).filter(
      (normalizedId) => !selectedCurrencyIds.has(normalizedId)
    );

    return normalizedIdsToRemove
      .map((normalizedId) => watchlistEntriesByNormalizedId.get(normalizedId))
      .filter((entry): entry is WatchlistTokenModel => Boolean(entry));
  }, [existingWatchlistIds, selectedCurrencyIds, watchlistEntriesByNormalizedId]);

  const hasPendingChanges =
    tokensToAddCurrencyIds.length > 0 || tokensToRemoveEntries.length > 0;

  const hasExistingWatchlist = existingWatchlistIds.size > 0;

  useEffect(() => {
    if (hasUserInteractedRef.current) {
      return;
    }
    setSelectedCurrencyIds(new Set(existingWatchlistIds));
  }, [existingWatchlistIds]);

  const activeUser = useMemo(
    () => kycUser || walletUser || null,
    [kycUser, walletUser]
  );

  const fallbackUserIdFromWatchlist = useMemo(() => {
    if (!watchlistTokens) {
      return null;
    }

    const match = watchlistTokens.find(
      (item) => typeof item.userId === "string" && item.userId.trim().length > 0
    );

    return match?.userId || null;
  }, [watchlistTokens]);

  const toggleTokenSelection = useCallback(
    (token: NormalizedToken) => {
      hasUserInteractedRef.current = true;
      const normalizedId = token.normalizedId;
      setSelectedCurrencyIds((prev) => {
        const next = new Set(prev);
        if (next.has(normalizedId)) {
          next.delete(normalizedId);
        } else {
          next.add(normalizedId);
        }
        return next;
      });
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const directUserId =
      activeUser && typeof activeUser === "object"
        ? ((activeUser as Record<string, unknown>)._id as string | undefined) ??
          ((activeUser as Record<string, unknown>).userId as string | undefined) ??
          ((activeUser as Record<string, unknown>).id as string | undefined)
        : undefined;

    const resolvedUserId = directUserId || fallbackUserIdFromWatchlist || null;

    if (!resolvedUserId) {
      showErrorToast("Unable to identify user. Please sign in again.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    const plannedAddCount = tokensToAddCurrencyIds.length;
    const plannedRemovalCount = tokensToRemoveEntries.length;

    if (plannedAddCount === 0 && plannedRemovalCount === 0) {
      router.back();
      return;
    }

    try {
      setIsSubmitting(true);

      const failedAddCurrencyIds: string[] = [];
      const successfulAddCurrencyIds: string[] = [];
      const fallbackWatchlistEntries: {
        currencyId: string;
        marketData?: MarketData;
      }[] = [];

      for (const currencyId of tokensToAddCurrencyIds) {
        const tokenMeta = currencyIdToToken.get(currencyId);

        try {
          const response = await addToWatchlist({
            body: {
              userId: resolvedUserId,
              currencyId,
            },
            params: null,
            extra: null,
          });

          successfulAddCurrencyIds.push(currencyId);

          const responseData = response?.data as
            | { marketData?: unknown }
            | null
            | undefined;

          const hasMarketData =
            responseData &&
            typeof responseData === "object" &&
            "marketData" in responseData &&
            (responseData.marketData as unknown | undefined) != null;

          if (!hasMarketData && tokenMeta) {
            // Ensure immediate UI feedback even if API omits market snapshot
            fallbackWatchlistEntries.push({
              currencyId,
              marketData: tokenMeta.token,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unable to add token";
          failedAddCurrencyIds.push(currencyId);
          console.error(`Failed to add token ${currencyId}:`, errorMessage);
        }
      }

      const failedRemovalIds: string[] = [];
      const successfulRemovalIds: string[] = [];

      for (const entry of tokensToRemoveEntries) {
        const watchlistId = entry._id || (entry as any)?.id;
        if (!watchlistId) {
          const identifier = entry.currencyId || "unknown";
          failedRemovalIds.push(identifier);
          console.error(
            "Watchlist entry missing identifier:",
            identifier,
            entry
          );
          continue;
        }

        try {
          await removeFromWatchlist({
            body: watchlistId,
            params: null,
            extra: null,
          });
          successfulRemovalIds.push(watchlistId);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Unable to remove token";
          failedRemovalIds.push(watchlistId);
          console.error(
            `Failed to remove token ${watchlistId}:`,
            errorMessage
          );
        }
      }

      if (
        successfulAddCurrencyIds.length === 0 &&
        successfulRemovalIds.length === 0
      ) {
        throw new Error("Unable to update watchlist");
      }

      if (fallbackWatchlistEntries.length > 0) {
        fallbackWatchlistEntries.forEach((entry) =>
          dispatch(
            marketActions.addToWatchlist({
              currencyId: entry.currencyId,
              userId: resolvedUserId,
              marketData: entry.marketData as any,
            })
          )
        );
      }

      const userPayload = activeUser ??
        (resolvedUserId
          ? ({ _id: resolvedUserId } as unknown as UserModel)
          : null);

      try {
        await fetchWatchlistTokens({
          body: null,
          params: null,
          extra: userPayload,
        });
      } catch (refreshError) {
        console.error("Failed to refresh watchlist tokens:", refreshError);
      }

      const hadFailures =
        failedAddCurrencyIds.length > 0 || failedRemovalIds.length > 0;

      let successMessage: string;

      if (hadFailures) {
        successMessage =
          "Watchlist updated with some issues. Please retry failed tokens.";
      } else if (hasExistingWatchlist) {
        successMessage = "Watchlist updated successfully";
      } else {
        successMessage = "Watchlist created successfully";
      }

      showSuccessToast(successMessage);
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update watchlist";
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeUser,
    addToWatchlist,
    fetchWatchlistTokens,
    fallbackUserIdFromWatchlist,
    currencyIdToToken,
    dispatch,
    isSubmitting,
    removeFromWatchlist,
    router,
    tokensToAddCurrencyIds,
    tokensToRemoveEntries,
  ]);

  const renderToken = useCallback(
    ({ item }: { item: NormalizedToken }) => {
      const isSelected = selectedCurrencyIds.has(item.normalizedId);
      const isInWatchlist = existingWatchlistIds.has(item.normalizedId);

      return (
        <Pressable
          onPress={() => toggleTokenSelection(item)}
          style={{ marginHorizontal: 16, marginBottom: 12 }}
        >
          {({ pressed }) => (
            <Box
              style={[
                styles.listItem,
                {
                  backgroundColor: pressed
                    ? theme.colors.secondaryBackgroundColor
                    : theme.colors.surfaceContainer,
                },
              ]}
            >
              <Box
                style={[
                  styles.checkbox,
                  {
                    marginRight: 12,
                    borderWidth: 1.5,
                    borderColor: isSelected
                      ? "#6366F1"
                      : "#52525B",
                    backgroundColor: isSelected
                      ? "#6366F1"
                      : "transparent",
                  },
                ]}
              >
                {isSelected && (
                  <Image
                    source={icons.checkFill}
                    style={{ 
                      width: 14, 
                      height: 14,
                      tintColor: "white",
                    }}
                    resizeMode="contain"
                  />
                )}
              </Box>

              <TokenImage
                uri={item.logo}
                name={item.symbol}
                size={40}
              />

              <Box marginLeft="m">
                <CustomText
                  variant="bodyMedium"
                  color="bodyTextColor"
                  fontSize={15}
                >
                  {item.name}
                </CustomText>
                <CustomText
                  variant="light"
                  color="disabledTextColor"
                  fontSize={12}
                  mt="s"
                >
                  {item.symbol}
                </CustomText>
              </Box>
            </Box>
          )}
        </Pressable>
      );
    },
    [
      existingWatchlistIds,
      selectedCurrencyIds,
      theme.colors.borderColor,
      theme.colors.primaryColor,
      theme.colors.secondaryBackgroundColor,
      theme.colors.surfaceContainer,
      theme.colors.white,
      toggleTokenSelection,
    ]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.modalBackgroundColor }]}
    >
      <Box flex={1} backgroundColor="modalBackgroundColor">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="m"
          paddingVertical="m"
        >
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Image
              source={icons.cancel}
              style={styles.headerIcon}
              tintColor={theme.colors.bodyTextColor}
            />
          </Pressable>
          <CustomText variant="bodySubheader" color="bodyTextColor">
            {hasExistingWatchlist ? "Edit Watchlist" : "Select Watchlist"}
          </CustomText>
          <Box width={18} />
        </Box>

        <Box paddingHorizontal="m" paddingBottom="s" marginTop="s">
          <Box
            style={[
              styles.searchWrapper,
              {
                backgroundColor: theme.colors.secondaryBackgroundColor,
                borderWidth: 1,
                borderColor: theme.colors.borderColor,
              },
            ]}
          >
            <Image
              source={icons.search}
              style={styles.searchIcon}
              tintColor={theme.colors.placeholderTextColor}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for a token"
              placeholderTextColor={theme.colors.placeholderTextColor}
              style={[
                styles.searchInput,
                { color: theme.colors.bodyTextColor },
              ]}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </Box>
        </Box>

        {isMarketTokensLoading && normalizedTokens.length === 0 ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator color={theme.colors.secondaryColor} />
          </Box>
        ) : (
          <FlatList
            data={filteredTokens}
            keyExtractor={(item) => item.currencyId}
            renderItem={renderToken}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <Box
                flex={1}
                alignItems="center"
                justifyContent="center"
                padding="xl"
              >
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  textAlign="center"
                >
                  {searchQuery
                    ? "No assets match your search."
                    : "No tokens available at the moment."}
                </CustomText>
              </Box>
            )}
          />
        )}

        <Box
          padding="m"
          borderTopWidth={StyleSheet.hairlineWidth}
          borderTopColor="borderColor"
          backgroundColor="modalBackgroundColor"
        >
          <CustomButton
            width="100%"
            height={52}
            borderRadius={12}
            text={
              hasExistingWatchlist ? "Update watchlist" : "Add to watchlist"
            }
            onPress={handleSubmit}
            disabled={!hasPendingChanges || isSubmitting}
            isLoading={isSubmitting}
            shouldVibrate
            bgColor="#6366F1"
            color="white"
            disabledColor={theme.colors.inActiveBtnColor}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
}
