import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UtilitiesRepo } from "../domain/utilities-repo";
import { UtilitiesRemoteDataSourceImpl } from "./remote/utilities-remote-datasource-impl";

export class UtilitiesRepoImpl implements UtilitiesRepo {
  private readonly remoteDatasource = new UtilitiesRemoteDataSourceImpl();

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
