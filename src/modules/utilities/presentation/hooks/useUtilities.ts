import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UtilitiesUsecases } from "../../domain/usecases/utilities-usecases";

const useUtilities = () => {
  return {
    // Add your hook methods here
    // Example:
    // getData: async (payload: unknown): Promise<GeneralResponseModel<unknown>> => {
    //   const usecase = new UtilitiesUsecases();
    //   const response = await usecase.executeGetData({
    //     body: payload,
    //     params: null,
    //     extra: null,
    //   });
    //   return response;
    // },
  };
};

export default useUtilities;
