import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { addTokenToWatchlistEndpoint, createPriceAlertEndpoint, fetchMarketTokensEndpoint, fetchWatchlistTokensEndpoint, removeTokenFromWatchlistEndpoint, tokenDetailsEndpoint, tokenHistoryEndpoint } from "../../../../core/api/api_endpoints";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";
import { MarketRemoteDataSource, PriceAlertData, PriceAlertResponse } from "./market-remote-datasource";

export class MarketRemoteDataSourceImpl implements MarketRemoteDataSource {
  async fetchMarketTokens(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<MarketTokenModel[] | null | undefined>>(fetchMarketTokensEndpoint, {}, {}, { showErrorToast: false });
    return response.data;
  }

  async toggleAddRemoveTokenToWatchlist(_: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>> {
    const response = await httpClient.post<GeneralResponseModel<MarketTokenModel | null | undefined>>(addTokenToWatchlistEndpoint);
    return response.data;
  }

  async tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>> {
    const response = await httpClient.get<GeneralResponseModel<TokenDetailModel>>(tokenDetailsEndpoint(payload.body), {}, {}, { showErrorToast: false });
    return response.data;
  }

  async tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>> {
    const response = await httpClient.get<GeneralResponseModel<TokenHistoryDetailModel>>(tokenHistoryEndpoint(payload.body), {}, {}, { showErrorToast: false });
    return response.data;
  }

  async fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>>(fetchWatchlistTokensEndpoint(payload.extra), {}, {}, { showErrorToast: false });
    return response.data;
  }

  async createPriceAlert(payload: GeneralRequestModel<PriceAlertData, unknown, unknown>): Promise<GeneralResponseModel<PriceAlertResponse>> {
    const response = await httpClient.post<GeneralResponseModel<PriceAlertResponse>>(createPriceAlertEndpoint, payload.body, {}, { showErrorToast: true });
    return response.data;
  }

  async addToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<WatchlistTokenModel>> {
    const response = await httpClient.post<GeneralResponseModel<WatchlistTokenModel>>(addTokenToWatchlistEndpoint, payload.body, {}, { showErrorToast: true });
    return response.data;
  }

  async removeFromWatchlist(payload: GeneralRequestModel<string, unknown, unknown>): Promise<GeneralResponseModel<{ success: boolean; message: string }>> {
    const response = await httpClient.delete<GeneralResponseModel<{ success: boolean; message: string }>>(removeTokenFromWatchlistEndpoint({ _id: payload.body } as any), {}, { showErrorToast: true });
    return response.data;
  }
}
