import { IActivityLogsParams } from "../../domain/entities/params/get-activity-logs-data-params";
import { SettingsUsecases } from "../../domain/usecases/settings-usecases";

const useSettings = () => {
  return {
    getActivities: async (payload: IActivityLogsParams) => {
      const usecase = new SettingsUsecases();
      const response = await usecase.getActivityLogs({
        body: null,
        params: payload,
        extra: null,
      });
      return response;
    },
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
