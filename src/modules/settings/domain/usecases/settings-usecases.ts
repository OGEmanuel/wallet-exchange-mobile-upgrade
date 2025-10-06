import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import { SettingsRepoImpl } from "../../data/settings-repo-impl";
import { ActivityLogModel } from "../entities/models/activity-log-model";
import { IAvatar } from "../entities/models/avatar-model";
import { BankModel } from "../entities/models/bank-model";
import { ChainModel } from "../entities/models/chain-model";
import { CountryModel } from "../entities/models/country-model";
import { FAQModel } from "../entities/models/faq-model";
import { ICreateAddressBook } from "../entities/params/create-addressbook-body";
import { IDeleteaddressParam } from "../entities/params/delete-address-param";
import { EditAddressParam } from "../entities/params/edit-address-params";
import { IGetAccount } from "../entities/params/get-account-param";
import { IActivityLogsParams } from "../entities/params/get-activity-logs-data-params";
import { IGetAddressParam } from "../entities/params/get-address-param";
import { GetBanksParams } from "../entities/params/get-bank-param";
import { GetCountryParam } from "../entities/params/get-country-param";
import { GetCurrencyParam } from "../entities/params/get-currency-param";
import { IUpdateUserDetailsParams } from "../entities/params/update-user-details-params";

export class SettingsUsecases {
  private readonly repo = new SettingsRepoImpl();

  async getActivityLogs(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<ActivityLogModel[]>> {
    return this.repo.activity(payload);
  }

  async getAvatars(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<IAvatar[]>> {
    return this.repo.getAvatars(payload);
  }

  async updateUser(
    payload: GeneralRequestModel<
      Partial<IUpdateUserDetailsParams>,
      UserModel,
      unknown
    >
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.updateUser(payload);
  }

  async setBiometricEnabled({
    key,
    value,
  }: {
    key: string;
    value: "true" | "false";
  }): Promise<void> {
    return this.repo.setBiometricEnabled(key, value);
  }

  async getBiometricEnabled(key: string): Promise<"true" | "false"> {
    return this.repo.getBiometricEnabled(key);
  }

  async getFaq(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<FAQModel[]>> {
    return this.repo.getFaq(payload);
  }

  async createAccount(
    payload: GeneralRequestModel<ICreateAddressBook, unknown, unknown>
  ) {
    return this.repo.createAccount(payload);
  }

  async getUserAddress(
    payload: GeneralRequestModel<unknown, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.repo.getUserAddress(payload);
  }

  async editAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, EditAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.repo.editAddressBook(payload);
  }

  async createAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.repo.createAddressBook(payload);
  }

  async getAccounts(
    payload: GeneralRequestModel<unknown, IGetAccount, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.repo.getAccounts(payload);
  }

  async deleteAccount(
    payload: GeneralRequestModel<unknown, IDeleteaddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.repo.deleteAccount(payload);
  }

  async getChains(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<ChainModel[]>> {
    return this.repo.getChains(payload);
  }

  async getCurrencies(
    payload: GeneralRequestModel<unknown, GetCurrencyParam, unknown>
  ): Promise<GeneralResponseModel<CurrencyModel[]>> {
    return this.repo.getCurrencies(payload);
  }

  async getCountry(
    payload: GeneralRequestModel<unknown, GetCountryParam, unknown>
  ): Promise<GeneralResponseModel<CountryModel[]>> {
    return this.repo.getCountry(payload);
  }

  async getBanks(
    payload: GeneralRequestModel<unknown, GetBanksParams, unknown>
  ): Promise<GeneralResponseModel<BankModel[]>> {
    return this.repo.getBanks(payload);
  }
}
