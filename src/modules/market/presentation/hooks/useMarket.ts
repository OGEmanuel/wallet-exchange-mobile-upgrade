import { GeneralRequestModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppDispatch } from "@/state";
import { useDispatch } from "react-redux";
import { PriceAlertData } from "../../data/remote/market-remote-datasource";
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

    createPriceAlert: async (payload: GeneralRequestModel<PriceAlertData, unknown, unknown>) => {
      return await marketUsecases.createPriceAlert(payload);
    },

    addToWatchlist: async (payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>) => {
      const response = await marketUsecases.addToWatchlist(payload);
      if (response?.data) {
        // Transform API response to match model interface (id -> _id)
        const apiData = response.data as any; // Cast to any to access id property
        const transformedData = {
          ...apiData,
          _id: apiData.id,
        };
        dispatch(marketActions.addToWatchlist(transformedData));
      }
      return response;
    },

    removeFromWatchlist: async (payload: GeneralRequestModel<string, unknown, unknown>) => {
      const response = await marketUsecases.removeFromWatchlist(payload);
      if (response?.success) {
        // Pass the currencyId for Redux state update
        dispatch(marketActions.removeFromWatchlist(payload.body as string));
      }
      return response;
    },

    fetchWatchlistTokens: async (payload: GeneralRequestModel<unknown, unknown, UserModel | null>) => {
      const response = await marketUsecases.fetchWatchlistTokens(payload);
      if (response?.data) {
        dispatch(marketActions.setWatchlistTokens(response.data));
      }
      return response;
    },
  };
};

export default useMarket;