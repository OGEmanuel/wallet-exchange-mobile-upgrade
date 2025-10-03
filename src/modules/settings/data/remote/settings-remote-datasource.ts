import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { IActivityLogsParams } from "../../domain/entities/params/get-activity-logs-data-params";

export abstract class SettingsRemoteDataSource {
  abstract activity(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<unknown>>;
}
