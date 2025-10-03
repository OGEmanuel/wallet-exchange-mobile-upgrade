import { getActivityLogsEndpoint } from "@/src/core/api/api_endpoints";
import httpClient from "@/src/core/api/http-client";
import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { IActivityLogsParams } from "../../domain/entities/params/get-activity-logs-data-params";
import { SettingsRemoteDataSource } from "./settings-remote-datasource";

export class SettingsRemoteDataSourceImpl implements SettingsRemoteDataSource {
  async activity(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    const response = await httpClient.get(
      getActivityLogsEndpoint(payload?.params?.user),
      {
        page: payload?.params?.page,
        limit: payload?.params?.limit,
      }
    );

    return response.data as GeneralResponseModel<unknown>;
  }
}
