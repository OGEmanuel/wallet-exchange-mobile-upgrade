import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { ICreateAddressBook } from "../../domain/entities/params/create-addressbook-body";
import { IDeleteaddressParam } from "../../domain/entities/params/delete-address-param";
import { EditAddressParam } from "../../domain/entities/params/edit-address-params";
import { IGetAccount } from "../../domain/entities/params/get-account-param";
import { IActivityLogsParams } from "../../domain/entities/params/get-activity-logs-data-params";
import { IGetAddressParam } from "../../domain/entities/params/get-address-param";
import { GetBanksParams } from "../../domain/entities/params/get-bank-param";
import { GetCountryParam } from "../../domain/entities/params/get-country-param";
import { GetCurrencyParam } from "../../domain/entities/params/get-currency-param";
import { IUpdateUserDetailsParams } from "../../domain/entities/params/update-user-details-params";
import { SettingsUsecases } from "../../domain/usecases/settings-usecases";

const useSettings = () => {
  return {
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

    createAccount: async ({ body }: { body: ICreateAddressBook }) => {
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
      const response = await usecase.getCountry({
        body: null,
        params,
        extra: null,
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
