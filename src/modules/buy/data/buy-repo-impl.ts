import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { BuyRepo } from "../domain/buy-repo";
import { BuyRemoteDataSourceImpl } from "./remote/buy-remote-datasource-impl";

export class BuyRepoImpl implements BuyRepo {
  private readonly remoteDatasource = new BuyRemoteDataSourceImpl();

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
