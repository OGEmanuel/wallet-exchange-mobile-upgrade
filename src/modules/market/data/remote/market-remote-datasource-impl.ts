import { httpClient } from "@/src/core/api/http-client";
import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { addTokenToWatchlistEndpoint, fetchMarketTokensEndpoint, fetchWatchlistTokensEndpoint, tokenDetailsEndpoint, tokenHistoryEndpoint } from "../../../../core/api/api_endpoints";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";
import { MarketRemoteDataSource } from "./market-remote-datasource";

export class MarketRemoteDataSourceImpl implements MarketRemoteDataSource {
  async fetchMarketTokens(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<MarketTokenModel[] | null | undefined>>(fetchMarketTokensEndpoint);
    return response.data;
  }

  async toggleAddRemoveTokenToWatchlist(_: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>> {
    const response = await httpClient.post<GeneralResponseModel<MarketTokenModel | null | undefined>>(addTokenToWatchlistEndpoint);
    return response.data;
  }

  async tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>> {
    const response = await httpClient.get<GeneralResponseModel<TokenDetailModel>>(tokenDetailsEndpoint(payload.body));
    return response.data;
  }

  async tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>> {
    const response = await httpClient.get<GeneralResponseModel<TokenHistoryDetailModel>>(tokenHistoryEndpoint(payload.body));
    return response.data;
  }

  async fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>> {
    const response = await httpClient.get<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>>(fetchWatchlistTokensEndpoint(payload.extra));
    return response.data;
  }
}
