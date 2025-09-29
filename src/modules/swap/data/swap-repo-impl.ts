import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { SwapRepo } from "../domain/swap-repo";
import { SwapRemoteDataSourceImpl } from "./remote/swap-remote-datasource-impl";

export class SwapRepoImpl implements SwapRepo {
  private readonly remoteDatasource = new SwapRemoteDataSourceImpl();

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
