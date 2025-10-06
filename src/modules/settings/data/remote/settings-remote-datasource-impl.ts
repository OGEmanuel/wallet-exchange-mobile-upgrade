import {
  accountsEndpoint,
  addAddressEndpoint,
  addressBookEndpoint,
  banksEndpoint,
  chainsEndpoint,
  countriesEndpoint,
  currenciesEndpoint,
  getActivityLogsEndpoint,
  getAvatarsEndpoint,
  getFaqEndpoint,
  updateUserDetailsEndpoint,
} from "@/src/core/api/api_endpoints";
import httpClient from "@/src/core/api/http-client";
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
import { SettingsRemoteDataSource } from "./settings-remote-datasource";

export class SettingsRemoteDataSourceImpl implements SettingsRemoteDataSource {
  async activity(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<ActivityLogModel[]>> {
    const response = await httpClient.get(
      getActivityLogsEndpoint(payload?.params?.user),
      {
        page: payload?.params?.page,
        limit: payload?.params?.limit,
      }
    );

    return response.data as GeneralResponseModel<ActivityLogModel[]>;
  }

  async getAvatars(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<IAvatar[]>> {
    const response = await httpClient.get(getAvatarsEndpoint);

    return response.data as GeneralResponseModel<IAvatar[]>;
  }

  async updateUser(
    payload: GeneralRequestModel<
      Partial<IUpdateUserDetailsParams>,
      UserModel,
      unknown
    >
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.patch(
      updateUserDetailsEndpoint(payload?.params),
      payload?.body
    );
    return response.data as GeneralResponseModel<unknown>;
  }

  async getFaq(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<FAQModel[]>> {
    const response = await httpClient.get(getFaqEndpoint);

    return response.data as GeneralResponseModel<FAQModel[]>;
  }

  async createAccount(
    payload: GeneralRequestModel<ICreateAddressBook, unknown, unknown>
  ) {
    const response = await httpClient.post(addressBookEndpoint, payload.body);
    return response.data as GeneralResponseModel<any[]>;
  }

  async getUserAddress(
    payload: GeneralRequestModel<unknown, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    const response = await httpClient.get(
      `${addAddressEndpoint}/user/${payload.params?.userId}`
    );

    return response.data as GeneralResponseModel<any>;
  }

  async editAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, EditAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    const response = await httpClient.put(
      addAddressEndpoint + payload.params?.id,
      payload.body
    );

    return response.data as GeneralResponseModel<any>;
  }

  async createAddressBook(
    payload: GeneralRequestModel<ICreateAddressBook, IGetAddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    const response = await httpClient.post(addAddressEndpoint, payload.body);
    return response.data as GeneralResponseModel<any>;
  }

  async getAccounts(
    payload: GeneralRequestModel<unknown, IGetAccount, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    const response = await httpClient.get(
      `${accountsEndpoint}/user/${payload.params?.userId}`,
      {
        limit: payload.params?.limit,
        offset: payload.params?.skip,
      }
    );
    return response.data as GeneralResponseModel<AccountModel[]>;
  }

  async deleteAccount(
    payload: GeneralRequestModel<unknown, IDeleteaddressParam, unknown>
  ): Promise<GeneralResponseModel<any[]>> {
    const response = await httpClient.delete(
      `${accountsEndpoint}/${payload.params?.id}`
    );

    return response.data as GeneralResponseModel<any>;
  }

  async getChains(
    payload: GeneralRequestModel<unknown, unknown, unknown>
  ): Promise<GeneralResponseModel<ChainModel[]>> {
    const response = await httpClient.get(chainsEndpoint);
    return response.data as GeneralResponseModel<ChainModel[]>;
  }

  async getCurrencies(
    payload: GeneralRequestModel<unknown, GetCurrencyParam, unknown>
  ): Promise<GeneralResponseModel<CurrencyModel[]>> {
    const response = await httpClient.get(currenciesEndpoint, {
      limit: payload.params?.limit,
      offset: payload.params?.offset,
    });
    return response.data as GeneralResponseModel<CurrencyModel[]>;
  }

  async getCountry(
    payload: GeneralRequestModel<unknown, GetCountryParam, unknown>
  ): Promise<GeneralResponseModel<CountryModel[]>> {
    const response = await httpClient.get(countriesEndpoint, {
      limit: payload.params?.limit,
      offset: payload.params?.offset,
    });

    return response.data as GeneralResponseModel<CountryModel[]>;
  }

  async getBanks(
    payload: GeneralRequestModel<unknown, GetBanksParams, unknown>
  ): Promise<GeneralResponseModel<BankModel[]>> {
    const response = await httpClient.get(banksEndpoint, {
      limit: payload.params?.limit,
      offset: payload.params?.offset,
    });

    return response.data as GeneralResponseModel<BankModel[]>;
  }
}
