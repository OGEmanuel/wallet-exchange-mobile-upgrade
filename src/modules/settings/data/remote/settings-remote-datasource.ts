import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import { AccountModel } from "../../domain/entities/models/Account-model";
import { ActivityLogModel } from "../../domain/entities/models/activity-log-model";
import { IAvatar } from "../../domain/entities/models/avatar-model";
import { BankModel } from "../../domain/entities/models/bank-model";
import { ChainModel } from "../../domain/entities/models/chain-model";
import { CountryModel } from "../../domain/entities/models/country-model";
import { FAQModel } from "../../domain/entities/models/faq-model";
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

export abstract class SettingsRemoteDataSource {
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
    payload: GeneralRequestModel<ICreateAddressBook, unknown, unknown>
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
  ): Promise<GeneralResponseModel<CurrencyModel[]>>;

  abstract getCountry(
    payload: GeneralRequestModel<unknown, GetCountryParam, unknown>
  ): Promise<GeneralResponseModel<CountryModel[]>>;

  abstract getBanks(
    payload: GeneralRequestModel<unknown, GetBanksParams, unknown>
  ): Promise<GeneralResponseModel<BankModel[]>>;
}
