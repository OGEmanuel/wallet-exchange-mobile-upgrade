import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "../../kyc/domain/entities/models/user-model";
import { MarketTokenModel } from "../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../domain/entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../domain/entities/params/add-to-watchlist-params";
import { MarketRepo } from "../domain/market-repo";
import { PriceAlertData, PriceAlertResponse } from "./remote/market-remote-datasource";
import { MarketRemoteDataSourceImpl } from "./remote/market-remote-datasource-impl";

export class MarketRepoImpl implements MarketRepo {
  private readonly remoteDatasource = new MarketRemoteDataSourceImpl();

  async fetchMarketTokens(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>> {
    return this.remoteDatasource.fetchMarketTokens(payload);
  }
  
  async toggleAddRemoveTokenToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>> {
    return this.remoteDatasource.toggleAddRemoveTokenToWatchlist(payload);
  }
  
  async tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>> {
    return this.remoteDatasource.tokenDetails(payload);
  }
  
  async tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>> {
    return this.remoteDatasource.tokenHistory(payload);
  }
  
  async fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>> {
    return this.remoteDatasource.fetchWatchlistTokens(payload);
  }

  async createPriceAlert(payload: GeneralRequestModel<PriceAlertData, unknown, unknown>): Promise<GeneralResponseModel<PriceAlertResponse>> {
    return this.remoteDatasource.createPriceAlert(payload);
  }

  async addToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<WatchlistTokenModel>> {
    return this.remoteDatasource.addToWatchlist(payload);
  }

  async removeFromWatchlist(payload: GeneralRequestModel<string, unknown, unknown>): Promise<GeneralResponseModel<{ success: boolean; message: string }>> {
    return this.remoteDatasource.removeFromWatchlist(payload);
  }
}
