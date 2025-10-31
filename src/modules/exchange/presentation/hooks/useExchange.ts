import {
  GeneralResponseModel
} from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppDispatch } from "@/state";

import { useWallet } from "@/src/core/wallet/wallet-context";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { ExchangeUsecases } from "../../domain/usecases/exchange-usecases";
import { exchangeActions } from "../state/exchange-slice";

interface FetchExchangeActivitiesParams {
  user: UserModel | null;
  page: number;
  limit: number;
}

const useExchange = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentExchangeUser } = useWallet();
  const [fetchingExchangeActivities, setFetchingExchangeActivities] = useState<boolean>(false);

  const fetchExchangeActivities = async ({
    user,
    page,
    limit,
  }: FetchExchangeActivitiesParams): Promise<GeneralResponseModel<ExchangeActivityModel[]>> => {
    setFetchingExchangeActivities(true);
    
    if (!user?._id) {
      setFetchingExchangeActivities(false);
      throw new Error("User ID is required");
    }

    const usecase = new ExchangeUsecases();
    const response = await usecase.fetchExchangeActivities({
      body: user,
      params: null,
      extra: {
        page,
        limit,
      },
    });

    console.log("page 22222", page);
    console.log("response 22222", response);

    // Update Redux store
    if (page === 1) {
      dispatch(exchangeActions.setExchangeActivities(response));
    } else {
      dispatch(exchangeActions.appendExchangeActivities(response));
    }

    setFetchingExchangeActivities(false);
    return response;
  };

  return {
    fetchExchangeActivities,
    fetchingExchangeActivities,
  };
};

export default useExchange;
