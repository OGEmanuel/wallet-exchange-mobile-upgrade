import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";

export abstract class MarketRemoteDataSource {
  abstract fetchMarketTokens(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[] | null | undefined>>;
  abstract toggleAddRemoveTokenToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel | null | undefined>>;
  abstract tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>>;
  abstract tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>>;
  abstract fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[] | null | undefined>>;
}
