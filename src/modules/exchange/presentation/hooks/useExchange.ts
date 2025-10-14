import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { AppDispatch } from "@/state";
<<<<<<< HEAD
import { ExchangeActivityModel, PaginationOptions } from "@zap/blockchain-sdk";
=======
import { ExchangeActivity, PaginationOptions } from "@zap/blockchain-sdk";
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
import { useDispatch } from "react-redux";
import { ExchangeUsecases } from "../../domain/usecases/exchange-usecases";
import { exchangeActions } from "../state/exchange-slice";

const useExchange = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  return {
<<<<<<< HEAD
    fetchExchangeActivities: async (payload: GeneralRequestModel<UserModel, unknown, PaginationOptions>): Promise<GeneralResponseModel<ExchangeActivityModel[]>> => {
=======
    fetchExchangeActivities: async (payload: GeneralRequestModel<UserModel, unknown, PaginationOptions>): Promise<GeneralResponseModel<ExchangeActivity[]>> => {
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
      const usecase = new ExchangeUsecases();
      const response = await usecase.fetchExchangeActivities(payload);
      dispatch(exchangeActions.setExchangeActivities(response));
      return response;
    },
  };
};

export default useExchange;
