import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { SettingsRepo } from "../domain/settings-repo";
import { SettingsRemoteDataSourceImpl } from "./remote/settings-remote-datasource-impl";

export class SettingsRepoImpl implements SettingsRepo {
  private readonly remoteDatasource = new SettingsRemoteDataSourceImpl();

  // Implement your repository methods here
  // Example:
  // async getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
  //   try {
  //     return await this.remoteDatasource.getData(payload);
  //   } catch (error) {
  //     console.error('Failed to get data:', error);
  //     throw error;
  //   }
  // }
}
