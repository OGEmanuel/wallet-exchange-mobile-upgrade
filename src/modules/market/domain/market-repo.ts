import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "../../kyc/domain/entities/models/user-model";
import { MarketTokenModel } from "./entities/models/market-token-model";
import { TokenDetailModel } from "./entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "./entities/models/token-history-model";
import { WatchlistTokenModel } from "./entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "./entities/params/add-to-watchlist-params";

export abstract class MarketRepo {
  abstract fetchMarketTokens(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>>;
  abstract toggleAddRemoveTokenToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>>;
  abstract tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>>;
  abstract tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>>;
  abstract fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>>; 
}
