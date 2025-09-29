/* eslint-disable */
import * as Router from "expo-router";

export * from "expo-router";

declare module "expo-router" {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams:
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/select-track`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | {
            pathname: `/dashboard/home/receive-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/send-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book/add-address`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/activity`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/home`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/swap`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/exchange`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/wallet`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/cards`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/about`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/activtylogs`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/edit-profile`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/enable-2fa`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/chat`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/tutorials`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/preferences`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/setup`; params?: Router.UnknownInputParams }
        | {
            pathname: `/setup/import-wallet/importprivatekey`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/importseedphrase`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/restorefromcloud`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/watchaddress`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/pinsetup`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/success`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/market/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          };
      hrefOutputParams:
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `/`; params?: Router.UnknownOutputParams }
        | { pathname: `/select-track`; params?: Router.UnknownOutputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams }
        | {
            pathname: `/dashboard/home/receive-token`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/send-token`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/address-book/add-address`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/address-book`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/activity`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/home`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/swap`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/exchange`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/wallet`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/cards`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/about`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/activtylogs`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/edit-profile`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/enable-2fa`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/chat`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/tutorials`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/preferences`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `/setup`; params?: Router.UnknownOutputParams }
        | {
            pathname: `/setup/import-wallet/importprivatekey`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/import-wallet/importseedphrase`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/import-wallet/restorefromcloud`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/import-wallet/watchaddress`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/wallet-setup/pinsetup`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/wallet-setup/success`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/market/[id]`;
            params: Router.UnknownOutputParams & { id: string };
          };
      href:
        | Router.RelativePathString
        | Router.ExternalPathString
        | `/${`?${string}` | `#${string}` | ""}`
        | `/select-track${`?${string}` | `#${string}` | ""}`
        | `/_sitemap${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/receive-token${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/send-token${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/address-book/add-address${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/address-book${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/activity${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/home${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/swap${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/exchange${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/wallet${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/cards${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/more${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/more/about${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile/activtylogs${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile/edit-profile${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile/enable-2fa${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/help/chat${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/help${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/help/tutorials${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/preferences${`?${string}` | `#${string}` | ""}`
        | `/setup${`?${string}` | `#${string}` | ""}`
        | `/setup/import-wallet/importprivatekey${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup/import-wallet/importseedphrase${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup/import-wallet/restorefromcloud${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup/import-wallet/watchaddress${`?${string}` | `#${string}` | ""}`
        | `/setup/wallet-setup/pinsetup${`?${string}` | `#${string}` | ""}`
        | `/setup/wallet-setup/success${`?${string}` | `#${string}` | ""}`
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/select-track`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | {
            pathname: `/dashboard/home/receive-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/send-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book/add-address`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/activity`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/home`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/swap`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/exchange`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/wallet`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/cards`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/about`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/activtylogs`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/edit-profile`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/enable-2fa`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/chat`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/tutorials`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/preferences`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/setup`; params?: Router.UnknownInputParams }
        | {
            pathname: `/setup/import-wallet/importprivatekey`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/importseedphrase`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/restorefromcloud`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/watchaddress`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/pinsetup`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/success`;
            params?: Router.UnknownInputParams;
          }
        | `/dashboard/home/market/${Router.SingleRoutePart<T>}${
            | `?${string}`
            | `#${string}`
            | ""}`
        | {
            pathname: `/dashboard/home/market/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          };
      hrefInputParams:
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/select-track`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | {
            pathname: `/dashboard/home/receive-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/send-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book/add-address`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/activity`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/home`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/swap`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/cards`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/about`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/chat`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/tutorials`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/activtylogs`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/edit-profile`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/enable-2fa`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/setup`; params?: Router.UnknownInputParams }
        | {
            pathname: `/setup/import-wallet/importprivatekey`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/importseedphrase`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/restorefromcloud`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/watchaddress`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/pinsetup`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/success`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/market/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          };
      hrefOutputParams:
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `/`; params?: Router.UnknownOutputParams }
        | { pathname: `/select-track`; params?: Router.UnknownOutputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams }
        | {
            pathname: `/dashboard/home/receive-token`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/send-token`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/address-book/add-address`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/address-book`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/activity`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/home`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/swap`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/cards`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/about`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/chat`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/tutorials`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/activtylogs`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/edit-profile`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/enable-2fa`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `/setup`; params?: Router.UnknownOutputParams }
        | {
            pathname: `/setup/import-wallet/importprivatekey`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/import-wallet/importseedphrase`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/import-wallet/restorefromcloud`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/import-wallet/watchaddress`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/wallet-setup/pinsetup`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/setup/wallet-setup/success`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `/dashboard/home/market/[id]`;
            params: Router.UnknownOutputParams & { id: string };
          };
      href:
        | Router.RelativePathString
        | Router.ExternalPathString
        | `/${`?${string}` | `#${string}` | ""}`
        | `/select-track${`?${string}` | `#${string}` | ""}`
        | `/_sitemap${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/receive-token${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/send-token${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/address-book/add-address${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/address-book${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/activity${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/home${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/swap${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/cards${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/more/about${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more${`?${string}` | `#${string}` | ""}`
        | `/dashboard/home/wallet-home/more/help/chat${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/help${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/help/tutorials${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile/activtylogs${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile/edit-profile${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile/enable-2fa${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/dashboard/home/wallet-home/more/profile${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup${`?${string}` | `#${string}` | ""}`
        | `/setup/import-wallet/importprivatekey${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup/import-wallet/importseedphrase${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup/import-wallet/restorefromcloud${
            | `?${string}`
            | `#${string}`
            | ""}`
        | `/setup/import-wallet/watchaddress${`?${string}` | `#${string}` | ""}`
        | `/setup/wallet-setup/pinsetup${`?${string}` | `#${string}` | ""}`
        | `/setup/wallet-setup/success${`?${string}` | `#${string}` | ""}`
        | {
            pathname: Router.RelativePathString;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: Router.ExternalPathString;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/select-track`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | {
            pathname: `/dashboard/home/receive-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/send-token`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book/add-address`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/address-book`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/activity`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/home`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/swap`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/cards`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/about`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/chat`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/help/tutorials`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/activtylogs`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/edit-profile`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile/enable-2fa`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/dashboard/home/wallet-home/more/profile`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `/setup`; params?: Router.UnknownInputParams }
        | {
            pathname: `/setup/import-wallet/importprivatekey`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/importseedphrase`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/restorefromcloud`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/import-wallet/watchaddress`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/pinsetup`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `/setup/wallet-setup/success`;
            params?: Router.UnknownInputParams;
          }
        | `/dashboard/home/market/${Router.SingleRoutePart<T>}${
            | `?${string}`
            | `#${string}`
            | ""}`
        | {
            pathname: `/dashboard/home/market/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          };
    }
  }
}
