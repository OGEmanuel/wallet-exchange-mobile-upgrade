import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";

export interface PriceAlertData {
  userId: string;
  currencyId: string;
  alertType: "up" | "down" | "up-down";
  duration: "oneTime" | "recurrent";
  priceThreshold?: number;
  percentageChange?: number;
  timeFrame?: number;
}

export interface PriceAlertResponse {
  success: boolean;
  message: string;
  data?: any;
}

export abstract class MarketRemoteDataSource {
  abstract fetchMarketTokens(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>>;
  abstract toggleAddRemoveTokenToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>>;
  abstract tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>>;
  abstract tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>>;
  abstract fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>>;
  abstract createPriceAlert(payload: GeneralRequestModel<PriceAlertData, unknown, unknown>): Promise<GeneralResponseModel<PriceAlertResponse>>;
  abstract addToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<WatchlistTokenModel>>;
  abstract removeFromWatchlist(payload: GeneralRequestModel<string, unknown, unknown>): Promise<GeneralResponseModel<{ success: boolean; message: string }>>;
}
