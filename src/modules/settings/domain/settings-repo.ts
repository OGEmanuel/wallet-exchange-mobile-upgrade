import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { UserModel } from "../../kyc/domain/entities/models/user-model";
import { CurrencyModel } from "../../utilities/domain/entities/models/currency-model";
import { AccountModel } from "./entities/models/Account-model";
import { SettingsModel } from "./entities/models/Settings-model";
import { ActivityLogModel } from "./entities/models/activity-log-model";
import { IAvatar } from "./entities/models/avatar-model";
import { BankModel } from "./entities/models/bank-model";
import { ChainModel } from "./entities/models/chain-model";
import { CountryModel } from "./entities/models/country-model";
import { FAQModel } from "./entities/models/faq-model";
import { CreateAccountBody } from "./entities/params/create-account-body";
import { ICreateAddressBook } from "./entities/params/create-addressbook-body";
import { IDeleteaddressParam } from "./entities/params/delete-address-param";
import { EditAddressParam } from "./entities/params/edit-address-params";
import { IGetAccount } from "./entities/params/get-account-param";
import { IActivityLogsParams } from "./entities/params/get-activity-logs-data-params";
import { IGetAddressParam } from "./entities/params/get-address-param";
import { GetBanksParams } from "./entities/params/get-bank-param";
import { GetCountryParam } from "./entities/params/get-country-param";
import { GetCurrencyParam } from "./entities/params/get-currency-param";
import { SettingsParams } from "./entities/params/settings-params";
import { UpdateSettingsBody } from "./entities/params/update-settings-body";
import { IUpdateUserDetailsParams } from "./entities/params/update-user-details-params";
import { Verify2faCodeBody } from "./entities/params/verify-2fa-code-body";

export abstract class SettingsRepo {
  abstract activity(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<ActivityLogModel[]>>;

  abstract getAvatars(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<IAvatar[]>>;

  abstract updateUser(
    payload: GeneralRequestModel<
      Partial<IUpdateUserDetailsParams>,
      UserModel,
      unknown
    >
  ): Promise<GeneralResponseModel<unknown>>;

  abstract getFaq(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<FAQModel[]>>;

  abstract getUserAddress(
    payload: GeneralRequestModel<unknown, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>>;

  abstract editAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, EditAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>>;

  abstract createAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>>;

  abstract createAccount(
    payload: GeneralRequestModel<CreateAccountBody, unknown, unknown>
  ): Promise<GeneralResponseModel<any[]>>;

  abstract getAccounts(
    payload: GeneralRequestModel<unknown, IGetAccount, unknown>
  ): Promise<GeneralResponseModel<AccountModel[]>>;

  abstract deleteAccount(
    payload: GeneralRequestModel<unknown, IDeleteaddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>>;

  abstract getChains(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<ChainModel[]>>;

  abstract getCurrencies(
    payload: GeneralRequestModel<unknown, GetCurrencyParam, unknown>
  ): Promise<GeneralResponseModel<{ currencies: CurrencyModel[] }>>;

  abstract getCountry(
    payload: GeneralRequestModel<unknown, GetCountryParam, unknown>
  ): Promise<GeneralResponseModel<CountryModel[]>>;

  abstract getBanks(
    payload: GeneralRequestModel<unknown, GetBanksParams, unknown>
  ): Promise<GeneralResponseModel<{ banks: BankModel[]; total: number }>>;

  abstract Verify2fa(
    payload: GeneralRequestModel<Verify2faCodeBody, unknown, unknown>
  ): Promise<GeneralResponseModel<any>>;

  abstract disable2fa(
    payload: GeneralRequestModel<Verify2faCodeBody, unknown, unknown>
  ): Promise<GeneralResponseModel<any>>;

  abstract generate2fa(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<any>>;

  abstract getSettings(
    payload: GeneralRequestModel<unknown, SettingsParams, unknown>
  ): Promise<GeneralResponseModel<SettingsModel>>;

  abstract updateSettings(
    payload: GeneralRequestModel<UpdateSettingsBody, SettingsParams, unknown>
  ): Promise<GeneralResponseModel<SettingsModel>>;
}
