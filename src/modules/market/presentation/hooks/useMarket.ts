import { GeneralRequestModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";
import { MarketUsecases } from "../../domain/usecases/market-usecases";

const useMarket = () => {
  const marketUsecases = new MarketUsecases();

  return {
    fetchMarketTokens: async (payload: GeneralRequestModel<unknown, unknown, unknown>) => {
      return await marketUsecases.fetchMarketTokens(payload);
    },

    toggleAddRemoveTokenToWatchlist: async (payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>) => {
      return await marketUsecases.toggleAddRemoveTokenToWatchlist(payload);
    },

    tokenDetails: async (payload: GeneralRequestModel<string | null, unknown, unknown>) => {
      return await marketUsecases.tokenDetails(payload);
    },

    tokenHistory: async (payload: GeneralRequestModel<string | null, unknown, unknown>) => {
      return await marketUsecases.tokenHistory(payload);
    },

    fetchWatchlistTokens: async (payload: GeneralRequestModel<unknown, unknown, UserModel | null>) => {
      return await marketUsecases.fetchWatchlistTokens(payload);
    },
  };
};

export default useMarket;