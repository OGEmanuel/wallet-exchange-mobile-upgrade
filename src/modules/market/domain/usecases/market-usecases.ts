import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "../../../kyc/domain/entities/models/user-model";
import { MarketRepoImpl } from "../../data/market-repo-impl";
import { PriceAlertData, PriceAlertResponse } from "../../data/remote/market-remote-datasource";
import { MarketTokenModel } from "../entities/models/market-token-model";
import { TokenDetailModel } from "../entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../entities/models/token-history-model";
import { WatchlistTokenModel } from "../entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../entities/params/add-to-watchlist-params";

export class MarketUsecases {
  private readonly repo = new MarketRepoImpl();

  async fetchMarketTokens(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>> {
    return this.repo.fetchMarketTokens(payload);
  }

  async toggleAddRemoveTokenToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>> {
    return this.repo.toggleAddRemoveTokenToWatchlist(payload);
  }
  
  
  async tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>> {
    return this.repo.tokenDetails(payload);
  }
  
  async tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>> {
    return this.repo.tokenHistory(payload);
  }
  
  
  async fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>> {
    return this.repo.fetchWatchlistTokens(payload);
  }

  async createPriceAlert(payload: GeneralRequestModel<PriceAlertData, unknown, unknown>): Promise<GeneralResponseModel<PriceAlertResponse>> {
    return this.repo.createPriceAlert(payload);
  }

  async addToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<WatchlistTokenModel>> {
    return this.repo.addToWatchlist(payload);
  }

  async removeFromWatchlist(payload: GeneralRequestModel<string, unknown, unknown>): Promise<GeneralResponseModel<{ success: boolean; message: string }>> {
    return this.repo.removeFromWatchlist(payload);
  }
}
