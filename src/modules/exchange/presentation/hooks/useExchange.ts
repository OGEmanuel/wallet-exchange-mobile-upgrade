import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppDispatch } from "@/state";
import { ExchangeActivity, PaginationOptions } from "@zap/blockchain-sdk";
import { useDispatch } from "react-redux";
import { ExchangeUsecases } from "../../domain/usecases/exchange-usecases";
import { exchangeActions } from "../state/exchange-slice";

const useExchange = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  return {
    fetchExchangeActivities: async (payload: GeneralRequestModel<UserModel, unknown, PaginationOptions>): Promise<GeneralResponseModel<ExchangeActivity[]>> => {
      const usecase = new ExchangeUsecases();
      const response = await usecase.fetchExchangeActivities(payload);
      dispatch(exchangeActions.setExchangeActivities(response));
      return response;
    },
  };
};

export default useExchange;
