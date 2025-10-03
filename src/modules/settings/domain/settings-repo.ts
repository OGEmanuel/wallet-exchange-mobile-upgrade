import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { IActivityLogsParams } from "./entities/params/get-activity-logs-data-params";

export abstract class SettingsRepo {
  abstract activity(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
}
