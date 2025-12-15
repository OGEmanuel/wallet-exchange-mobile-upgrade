// import { Bank, BellIcon, VerificationCheckIcon, ExitIcon, EyeOpen, GearIcon, History, LockPasswordIcon, Swap, ThumbUpIcon, User, WalletIcon } from "../../../assets";

export interface ActivityLogModel {
  _id?:       string;
  type?:      string;
  data?:      Data;
  description?: string;
  createdAt?: string;
}

export interface Data {
  iPAddress?: null;
  location?:  null;
  userAgent?: null;
  newDevice?: null;
  longitude?: null;
  latitude?:  null;
}

export enum ActivityType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  ORDER = "ORDER",
  BANK_ACCOUNT = "BANK_ACCOUNT",
  WALLET = "WALLET",
  WALLET_ACCOUNT = "WALLET_ACCOUNT",
  VERIFICATION = "VERIFICATION",
  ACCOUNT = "ACCOUNT",
  SETTING = "SETTING",
  REFERRAL = "REFERRAL",
  WATCHLIST = "WATCHLIST",
  PRICE_ALERT = "PRICE_ALERT",
  SWAP = "SWAP",
  OTP = "OTP",
}

export const filterOptions = [
  "All",
  ActivityType.LOGIN,
  ActivityType.LOGOUT,
  ActivityType.ORDER,
  ActivityType.BANK_ACCOUNT,
  ActivityType.WALLET,
  ActivityType.WALLET_ACCOUNT,
  ActivityType.VERIFICATION,
  ActivityType.ACCOUNT,
  ActivityType.SETTING,
  ActivityType.REFERRAL,
  ActivityType.WATCHLIST,
  ActivityType.PRICE_ALERT,
  ActivityType.SWAP,
  ActivityType.OTP
];

// export const activityLogIcons = {
//   [ActivityType.LOGIN]: ExitIcon,
//   [ActivityType.LOGOUT]: ExitIcon,
//   [ActivityType.ORDER]: History,
//   [ActivityType.BANK_ACCOUNT]: Bank,
//   [ActivityType.WALLET]: WalletIcon,
//   [ActivityType.WALLET_ACCOUNT]: WalletIcon,
//   [ActivityType.VERIFICATION]: VerificationCheckIcon,
//   [ActivityType.ACCOUNT]: User,
//   [ActivityType.SETTING]: GearIcon,
//   [ActivityType.REFERRAL]: ThumbUpIcon,
//   [ActivityType.SWAP]: Swap,
//   [ActivityType.WATCHLIST]: EyeOpen,
//   [ActivityType.PRICE_ALERT]: BellIcon,
//   [ActivityType.OTP]: LockPasswordIcon,
// };

export const activityLogDescription = {
  [ActivityType.LOGIN]: "You logged into your account",
  [ActivityType.LOGOUT]: "You logged out from your account",
  [ActivityType.ORDER]: "You ordered a product",
  [ActivityType.BANK_ACCOUNT]: "You added a bank account",
  [ActivityType.WALLET]: "You added a wallet",
  [ActivityType.WALLET_ACCOUNT]: "You added a wallet account",
  [ActivityType.VERIFICATION]: "You verified your account",
  [ActivityType.ACCOUNT]: "You created an account",
  [ActivityType.SETTING]: "You updated your settings",
  [ActivityType.REFERRAL]: "You shared a referral link",
  [ActivityType.SWAP]: "You swapped a token",
  [ActivityType.WATCHLIST]: "You added a token to your watchlist",
};