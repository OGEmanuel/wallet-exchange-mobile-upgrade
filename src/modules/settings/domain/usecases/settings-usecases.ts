import {
  GeneralRequestModel,
  GeneralResponseModel,
} from "@/src/core/api/http-types";
import { SettingsRepoImpl } from "../../data/settings-repo-impl";
import { IActivityLogsParams } from "../entities/params/get-activity-logs-data-params";

export class SettingsUsecases {
  private readonly repo = new SettingsRepoImpl();

  async getActivityLogs(
    payload: GeneralRequestModel<unknown, IActivityLogsParams, unknown>
  ): Promise<GeneralResponseModel<unknown>> {
    return this.repo.activity(payload);
  }

  // Add your use case methods here
  // Example:
  // async executeGetData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
  //   // Validate input parameters
  //   this.validateGetDataParams(payload.body);
  //
  //   return this.repo.getData(payload);
  // }

  // Add private validation methods here
  // Example:
  // private validateGetDataParams(params: unknown): void {
  //   if (!params) {
  //     throw new Error('Parameters are required');
  //   }
  // }
}
