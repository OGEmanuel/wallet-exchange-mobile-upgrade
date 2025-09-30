import { GeneralRequestModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppDispatch } from "@/state";
import { useDispatch } from "react-redux";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";
import { MarketUsecases } from "../../domain/usecases/market-usecases";
import { marketActions } from "../state/market-slice";

const useMarket = () => {
  const marketUsecases = new MarketUsecases();

  const dispatch = useDispatch<AppDispatch>();

  return {
    fetchMarketTokens: async (payload: GeneralRequestModel<unknown, unknown, unknown>) => {
      const response = await marketUsecases.fetchMarketTokens(payload);

      if (response?.data) {
        dispatch(marketActions.setMarketTokens(response.data || null));
      }
    },

    toggleAddRemoveTokenToWatchlist: async (payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>) => {
      return await marketUsecases.toggleAddRemoveTokenToWatchlist(payload);
    },

    tokenDetails: async (payload: GeneralRequestModel<string | null, unknown, unknown>) => {
      const response = await marketUsecases.tokenDetails(payload);
      
      if (response?.data) {
        dispatch(marketActions.setCurrentTokenDetails(response.data || null));
      }
      
      return response;
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