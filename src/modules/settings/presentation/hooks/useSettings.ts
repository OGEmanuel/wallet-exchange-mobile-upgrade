import storageService from "@/src/core/storage/app-storage";
import { StorageKeys } from "@/src/core/storage/storage-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateAccountBody } from "../../domain/entities/params/create-account-body";
import { ICreateAddressBook } from "../../domain/entities/params/create-addressbook-body";
import { IDeleteaddressParam } from "../../domain/entities/params/delete-address-param";
import { EditAddressParam } from "../../domain/entities/params/edit-address-params";
import { IGetAccount } from "../../domain/entities/params/get-account-param";
import { IActivityLogsParams } from "../../domain/entities/params/get-activity-logs-data-params";
import { IGetAddressParam } from "../../domain/entities/params/get-address-param";
import { GetBanksParams } from "../../domain/entities/params/get-bank-param";
import { GetCountryParam } from "../../domain/entities/params/get-country-param";
import { GetCurrencyParam } from "../../domain/entities/params/get-currency-param";
import { SettingsParams } from "../../domain/entities/params/settings-params";
import { UpdateSettingsBody } from "../../domain/entities/params/update-settings-body";
import { IUpdateUserDetailsParams } from "../../domain/entities/params/update-user-details-params";
import { Verify2faCodeBody } from "../../domain/entities/params/verify-2fa-code-body";
import { SettingsUsecases } from "../../domain/usecases/settings-usecases";
import {
  selectSettingState,
  setDefaultCurrency,
} from "../state/settings-slice";

const useSettings = () => {
  let defaultCurrency = useSelector(selectSettingState).selectedCurrency;
  const dispatch = useDispatch();

  React.useEffect(() => {
    (async function () {
      // get the default currency from the local storage first
      const item = await storageService.getItem(StorageKeys.SELECTED_CURRENCY);
      if (item) {
        const currency = JSON.parse(item as string) as CurrencyModel;
        dispatch(setDefaultCurrency(currency));
      }
    })();
  }, []);

  return {
    defaultCurrency,
    setDefaultCurrenct: async (currency: CurrencyModel) => {
      dispatch(setDefaultCurrency(currency));
      // store in local Storage
      await storageService.setItem(
        StorageKeys.SELECTED_CURRENCY,
        JSON.stringify(currency)
      );
    },
    getDefaultCurrency: async (): Promise<CurrencyModel | null> => {
      if (!defaultCurrency) {
        // get from local storage
        const local = await storageService.get(StorageKeys.SELECTED_CURRENCY);
        if (local) {
          const currency = JSON.parse(local as string) as CurrencyModel;
          dispatch(setDefaultCurrency(currency));
          return currency;
        }
        return null;
      }
      return defaultCurrency;
    },
    getActivities: async (payload: IActivityLogsParams) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getActivityLogs({
        body: null,
        params: payload,
        extra: null,
      });
      return response;
    },

    getAvatars: async () => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getAvatars({
        body: null,
        params: null,
        extra: null,
      });
      return response;
    },
    updateUser: async (
      payload: Partial<IUpdateUserDetailsParams>,
      user: UserModel
    ) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.updateUser({
        body: payload,
        params: user,
        extra: null,
      });
      return response;
    },
    setBiometricEnabled: async (key: string, value: "true" | "false") => {
      const usecase = new SettingsUsecases();
      await usecase.setBiometricEnabled({
        key,
        value,
      });
    },
    getBiometricEnabled: async (key: string) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getBiometricEnabled(key);
      return response;
    },
    getFaq: async () => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getFaq({
        body: null,
        params: null,
        extra: null,
      });
      return response;
    },

    createAccount: async ({ body }: { body: CreateAccountBody }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.createAccount({
        body,
        params: null,
        extra: null,
      });
      return response;
    },

    getUserAddress: async (userId: string) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getUserAddress({
        body: null,
        params: { userId },
        extra: null,
      });
      return response;
    },

    editAddress: async ({
      body,
      params,
    }: {
      body: ICreateAddressBook;
      params: EditAddressParam;
    }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.editAddressBook({
        body,
        params,
        extra: null,
      });
      return response;
    },

    createAddressBook: async ({
      body,
      params,
    }: {
      body: ICreateAddressBook;
      params: IGetAddressParam;
    }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.createAddressBook({
        body,
        params,
        extra: null,
      });
      return response;
    },

    getAccounts: async ({ params }: { params: IGetAccount }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getAccounts({
        body: null,
        params,
        extra: null,
      });
      return response;
    },

    deleteAccount: async ({ params }: { params: IDeleteaddressParam }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.deleteAccount({
        body: null,
        params,
        extra: null,
      });
      return response;
    },

    getChains: async () => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getChains({
        body: null,
        params: null,
        extra: null,
      });
      return response;
    },

    getCurrencies: async ({ params }: { params: GetCurrencyParam }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getCurrencies({
        body: null,
        params,
        extra: null,
      });
      return response;
    },

    getCountry: async ({ params }: { params: GetCountryParam }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getCountry({
        body: null,
        params,
        extra: null,
      });
      return response;
    },

    getBanks: async ({ params }: { params: GetBanksParams }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getBanks({
        body: null,
        params,
        extra: null,
      });
      return response;
    },

    generate2fa: async () => {
      const usecase = new SettingsUsecases();
      const response = await usecase.generate2fa({
        body: null,
        extra: null,
        params: null,
      });
      return response;
    },

    verify2fa: async ({ body }: { body: Verify2faCodeBody }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.Verify2fa({
        body,
        extra: null,
        params: null,
      });
      return response;
    },

    disbale2fa: async ({ body }: { body: Verify2faCodeBody }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.disable2fa({
        body,
        extra: null,
        params: null,
      });
      return response;
    },

    getSettings: async ({ params }: { params: SettingsParams }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getSettings({
        body: null,
        extra: null,
        params,
      });
      return response;
    },

    updateSettings: async ({
      params,
      body,
    }: {
      params: SettingsParams;
      body: UpdateSettingsBody;
    }) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.updateSettings({
        body,
        extra: null,
        params,
      });
      return response;
    },

    // Add your hook methods here
    // Example:
    // getData: async (payload: unknown): Promise<GeneralResponseModel<unknown>> => {
    //   const usecase = new SettingsUsecases();
    //   const response = await usecase.executeGetData({
    //     body: payload,
    //     params: null,
    //     extra: null,
    //   });
    //   return response;
    // },
  };
};

export default useSettings;
