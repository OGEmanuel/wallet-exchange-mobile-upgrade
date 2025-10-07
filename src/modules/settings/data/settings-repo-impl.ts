import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { UserModel } from "../../kyc/domain/entities/models/user-model";
import { CurrencyModel } from "../../utilities/domain/entities/models/currency-model";
import { SettingsModel } from "../domain/entities/models/Settings-model";
import { ActivityLogModel } from "../domain/entities/models/activity-log-model";
import { IAvatar } from "../domain/entities/models/avatar-model";
import { BankModel } from "../domain/entities/models/bank-model";
import { ChainModel } from "../domain/entities/models/chain-model";
import { CountryModel } from "../domain/entities/models/country-model";
import { FAQModel } from "../domain/entities/models/faq-model";
import { CreateAccountBody } from "../domain/entities/params/create-account-body";
import { ICreateAddressBook } from "../domain/entities/params/create-addressbook-body";
import { IDeleteaddressParam } from "../domain/entities/params/delete-address-param";
import { EditAddressParam } from "../domain/entities/params/edit-address-params";
import { IGetAccount } from "../domain/entities/params/get-account-param";
import { IActivityLogsParams } from "../domain/entities/params/get-activity-logs-data-params";
import { IGetAddressParam } from "../domain/entities/params/get-address-param";
import { GetBanksParams } from "../domain/entities/params/get-bank-param";
import { GetCountryParam } from "../domain/entities/params/get-country-param";
import { GetCurrencyParam } from "../domain/entities/params/get-currency-param";
import { SettingsParams } from "../domain/entities/params/settings-params";
import { UpdateSettingsBody } from "../domain/entities/params/update-settings-body";
import { IUpdateUserDetailsParams } from "../domain/entities/params/update-user-details-params";
import { Verify2faCodeBody } from "../domain/entities/params/verify-2fa-code-body";
import { SettingsRepo } from "../domain/settings-repo";
import { SettingsLocalDataSource } from "./local/settings-local-datasource";
import { SettingsLocalDataSourceImpl } from "./local/settings-local-datasource-impl";
import { SettingsRemoteDataSourceImpl } from "./remote/settings-remote-datasource-impl";

export class SettingsRepoImpl implements SettingsRepo, SettingsLocalDataSource {
  private readonly remoteDatasource = new SettingsRemoteDataSourceImpl();
  private readonly localDatasource = new SettingsLocalDataSourceImpl();

  async activity(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<ActivityLogModel[]>> {
    return this.remoteDatasource.activity(payload);
  }

  async getAvatars(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<IAvatar[]>> {
    return this.remoteDatasource.getAvatars(payload);
  }

  async updateUser(
    payload: GeneralRequestModel<
      Partial<IUpdateUserDetailsParams>,
      UserModel,
      unknown
    >
  ): Promise<GeneralResponseModel<unknown>> {
    return this.remoteDatasource.updateUser(payload);
  }

  async setBiometricEnabled(
    key: string,
    value: "true" | "false"
  ): Promise<void> {
    return this.localDatasource.setBiometricEnabled(key, value);
  }

  async getBiometricEnabled(key: string): Promise<"true" | "false"> {
    return this.localDatasource.getBiometricEnabled(key);
  }

  async getFaq(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<FAQModel[]>> {
    return this.remoteDatasource.getFaq(payload);
  }

  async createAccount(
    payload: GeneralRequestModel<CreateAccountBody, unknown, unknown>
  ) {
    return this.remoteDatasource.createAccount(payload);
  }

  async getUserAddress(
    payload: GeneralRequestModel<unknown, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.remoteDatasource.getUserAddress(payload);
  }

  async editAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, EditAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.remoteDatasource.editAddressBook(payload);
  }

  async createAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.remoteDatasource.createAddressBook(payload);
  }

  async getAccounts(
    payload: GeneralRequestModel<unknown, IGetAccount, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.remoteDatasource.getAccounts(payload);
  }

  async deleteAccount(
    payload: GeneralRequestModel<unknown, IDeleteaddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    return this.remoteDatasource.deleteAccount(payload);
  }

  async getChains(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<ChainModel[]>> {
    return this.remoteDatasource.getChains(payload);
  }

  async getCurrencies(
    payload: GeneralRequestModel<unknown, GetCurrencyParam, unknown>
  ): Promise<GeneralResponseModel<{ currencies: CurrencyModel[] }>> {
    return this.remoteDatasource.getCurrencies(payload);
  }

  async getCountry(
    payload: GeneralRequestModel<unknown, GetCountryParam, unknown>
  ): Promise<GeneralResponseModel<CountryModel[]>> {
    return this.remoteDatasource.getCountry(payload);
  }

  async getBanks(
    payload: GeneralRequestModel<unknown, GetBanksParams, unknown>
  ): Promise<GeneralResponseModel<{ banks: BankModel[]; total: number }>> {
    return this.remoteDatasource.getBanks(payload);
  }

  async generate2fa(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<any>> {
    return this.remoteDatasource.generate2fa(payload);
  }
  async Verify2fa(
    payload: GeneralRequestModel<Verify2faCodeBody, unknown, unknown>
  ): Promise<GeneralResponseModel<any>> {
    return this.remoteDatasource.Verify2fa(payload);
  }
  async disable2fa(
    payload: GeneralRequestModel<Verify2faCodeBody, unknown, unknown>
  ): Promise<GeneralResponseModel<any>> {
    return this.remoteDatasource.disable2fa(payload);
  }

  async getSettings(
    payload: GeneralRequestModel<unknown, SettingsParams, unknown>
  ): Promise<GeneralResponseModel<SettingsModel>> {
    return this.remoteDatasource.getSettings(payload);
  }

  async updateSettings(
    payload: GeneralRequestModel<UpdateSettingsBody, SettingsParams, unknown>
  ): Promise<GeneralResponseModel<SettingsModel>> {
    return this.remoteDatasource.updateSettings(payload);
  }
  // Implement your repository methods here
  // Example:
  // async getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
  //   try {
  //     return await this.remoteDatasource.getData(payload);
  //   } catch (error) {
  //     console.error('Failed to get data:', error);
  //     throw error;
  //   }
  // }
}
