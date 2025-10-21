import {
  GeneralResponseModel
} from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppDispatch } from "@/state";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { useDispatch } from "react-redux";
import { ExchangeUsecases } from "../../domain/usecases/exchange-usecases";
import { exchangeActions } from "../state/exchange-slice";

interface UseExchangeActivitiesParams {
  user: UserModel | null;
  page: number;
  limit: number;
  enabled?: boolean;
}

const useExchange = () => {
  const dispatch = useDispatch<AppDispatch>();
  const usecase = new ExchangeUsecases();

  const useExchangeActivities = ({
    user,
    page,
    limit,
    enabled = true,
  }: UseExchangeActivitiesParams): UseQueryResult<
    GeneralResponseModel<ExchangeActivityModel[]>,
    Error
  > => {
    return useQuery({
      queryKey: ["exchangeActivities", user?._id, page, limit],
      queryFn: async () => {
        if (!user?._id) {
          throw new Error("User ID is required");
        }

        const response = await usecase.fetchExchangeActivities({
          body: user,
          params: null,
          extra: {
            page,
            limit,
          },
        });

        // Update Redux store
        if (page === 1) {
          dispatch(exchangeActions.setExchangeActivities(response));
        } else {
          dispatch(exchangeActions.appendExchangeActivities(response));
        }

        return response;
      },
      enabled: enabled && !!user?._id,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  return {
    useExchangeActivities,
  };
};

export default useExchange;
