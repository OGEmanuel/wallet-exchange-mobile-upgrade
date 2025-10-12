import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { BuyUsecases } from "../../domain/usecases/buy-usecases";

const useBuy = () => {
  return {
    // Add your hook methods here
    // Example:
    // getData: async (payload: unknown): Promise<GeneralResponseModel<unknown>> => {
    //   const usecase = new BuyUsecases();
    //   const response = await usecase.executeGetData({
    //     body: payload,
    //     params: null,
    //     extra: null,
    //   });
    //   return response;
    // },
  };
};

export default useBuy;
