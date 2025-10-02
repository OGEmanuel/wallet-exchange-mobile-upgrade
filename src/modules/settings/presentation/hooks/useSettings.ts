import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { SettingsUsecases } from "../../domain/usecases/settings-usecases";

const useSettings = () => {
  return {
    // Add your hook methods here
    // Example:
    // getData: async (payload: unknown): Promise<GeneralResponseModel<unknown>> => {
    //   const usecase = new SettingsUsecases();
    //   const response = await usecase.executeGetData({
    //     body: payload,
    //     params: null,
    //     extra: null,
    //   });
    //   return response;
    // },
  };
};

export default useSettings;
