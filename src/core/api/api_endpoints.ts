import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import { WatchlistTokenModel } from "@/src/modules/market/domain/entities/models/watchlist-token-model";

// Auth Endpoints
export const getOnboardingOtpEndpoint = "/auth/login";
export const authenticateEmailOtpEndpoint = "/auth/login";
export const authenticateGuestUserEndpoint = "/auth/guest/login";
export const googleLoginEndpoint = "/auth/google";
export const appleLoginEndpoint = "/auth/apple";
export const requestNewOtpEndpoint = "/auth/login";
export const updatePhoneNumberEndpoint = "/auth/phone";
export const authenticatePhoneNumberOtpEndpoint = "/auth/otp/verify";
export const updateUserDetailsEndpoint = (user?: UserModel | null): string => `/users/${user?._id}`;
export const sendVerificationDocumentDataEndpoint = "/verifications";
export const fetchUserByIdEndpoint = (user?: UserModel | null): string => `/users/${user?._id}`;
export const usernameOnboardingEndpoint = (user?: UserModel | null): string => `/users/onboarding/${user?._id}`;
export const fetchDocumentTypesEndpoint = (countryData?: VerifiedCountryModel | null): string => `/country-verifications/${countryData?._id}`;
export const refreshTokenEndpoint = "/auth/refresh";
export const submitVerificationEndpoint = "/verifications/submit";
export const generate2FASecretDataEndpoint = "/auth/2fa/generate";
export const verify2FACodeEndpoint = "/auth/2fa/verify";
export const loginWith2FACodeEndpoint = "/auth/2fa/login";
export const disable2FACodeEndpoint = "/auth/2fa/disable";
export const fetchAllAvatarsEndpoint = "/avatar";
export const fetchNotificationPreferenceEndpoint = (user?: UserModel | null): string => `/users/settings/${user?._id}`;
export const updateNotificationPreferenceEndpoint = (user?: UserModel | null): string => `/users/settings/${user?._id}`;
export const createPriceAlertEndpoint = "/priceAlerts";
// export const activatePriceAlertEndpoint = (priceAlert?: TogglePriceAlertParams | null): string => `/priceAlerts/${priceAlert?.user?._id}/activate`;
// export const deactivatePriceAlertEndpoint = (priceAlert?: TogglePriceAlertParams | null): string => `/priceAlerts/${priceAlert?.user?._id}/deactivate`;
// export const deletePriceAlertEndpoint = (priceAlert?: PriceAlertModel | null): string => `/priceAlerts/${priceAlert?.id}`;
export const updatePriceAlertEndpoint = (priceAlertId?: string | null): string => `/priceAlerts/${priceAlertId}`;
export const fetchPriceAlertsEndpoint = (user?: UserModel | null): string => `/priceAlerts/user/${user?._id}`;
export const fetchActivityLogEndpoint = (user?: UserModel | null): string => `/activities/${user?._id}`;
export const fetchTransactionsEndpoint = (user?: UserModel | null): string => `/orders/user/${user?._id}`;
export const fetchSumsubReviewResultEndpoint = "/verifications/sb/status";
export const resetSumsubVerificationEndpoint = "/verifications/sb/reset";

// Swap Endpoints
export const fetchSwapRateEndpoint = "/engines/rates/orders";
export const createOrderTransactionEndpoint = "/orders";
// export const verifyWithdrawalAddressEndpoint = (payload?: VerifyWithdrawalAddressParams | null): string => `/orders/validateAddress/${payload?.currencyId}/${payload?.tokenAddress}`;

// Accounts Endpoints
export const fetchAccountsEndpoint = (user?: UserModel | null): string => `/accounts/user/${user?._id}`;
export const fetchAccountDetailsEndpoint = "/banks/resolve";
export const addBankAccountEndpoint = "/accounts";
// export const deleteBankAccountEndpoint = (account?: AccountModel | null): string => `/accounts/${account?._id}`;


// Addresses Endpoint
// export const fetchChainsEndpoint = "/orders/chains";
// export const fetchAddressesEndpoint = (user?: UserModel | null): string => `/address-book/user/${user?._id}`;
export const addAddressEndpoint = "/address-book";
// export const deleteAddressEndpoint = (address?: AddressModel | null): string => `/address-book/${address?._id}`;
// export const updateAddressEndpoint = (address?: AddressModel | null): string => `/address-book/${address?._id}`;

// Markets Endpoint
export const fetchMarketTokensEndpoint = "/markets"
export const addTokenToWatchlistEndpoint = "/watchlists"
export const tokenDetailsEndpoint = (tokenId?: string | null): string => `/markets/${tokenId}`
export const tokenHistoryEndpoint = (tokenId?: string | null): string => `/markets/history/${tokenId}`
export const removeTokenFromWatchlistEndpoint = (watchlistToken?: WatchlistTokenModel | null): string => `/watchlists/${watchlistToken?._id}`
export const fetchWatchlistTokensEndpoint = (user?: UserModel | null): string => `/watchlists/user/${user?._id}`;

// Utility Endpoints
export const getVerifiedCountriesEndpoint = "/countries";
export const uploaFileEndpoint = "/files";
export const fetchBanksEndpoint = "/banks";
export const fetchCurrenciesEndpoint = "/currencies";
// export const fetchCurrencyByIdEndpoint = (currency?: CurrencyModel | null): string => `/currencies/${currency?._id}`;
export const fetchSupportedCurrenciesEndpoint = "/supportedCurrencies";

// Support Endpoints
export const createSupportConversationEndpoint = "/support/conversations";
// export const fetchSupportConversationsEndpoint = (user?: UserModel | null): string => `/support/conversations/user/${user?._id}`;
export const fetchSupportConversationEndpoint = (conversationId?: string | null): string => `/support/conversations/${conversationId}`;
export const closeSupportConversationEndpoint = (conversationId?: string | null): string => `/support/conversations/${conversationId}`;
export const markSupportConversationAsSpamEndpoint = (conversationId?: string | null): string => `/support/conversations/${conversationId}`;
export const reopenSupportConversationEndpoint = (conversationId?: string | null): string => `/support/conversations/${conversationId}/reOpen`;
export const reassignSupportConversationEndpoint = (conversationId?: string | null): string => `/support/conversations/${conversationId}/reAssign`;
export const sendSupportMessageEndpoint = "/support/messages";

// export const fetchSupportMessagesEndpoint = "/support/messages";
// export const fetchSupportConversationMessagesEndpoint = (conversation?: SupportConversationModel | null): string => `/support/messages/conversations/${conversation?._id}`;
export const fetchSupportMessageEndpoint = (messageId?: string | null): string => `/support/messages/${messageId}`;
export const readSupportMessageEndpoint = (messageId?: string | null): string => `/support/messages/${messageId}/read`;
export const deleteSupportMessageEndpoint = (messageId?: string | null): string => `/support/messages/${messageId}`;
export const autoResponseSettingsEndpoint = "/support/autoBot";