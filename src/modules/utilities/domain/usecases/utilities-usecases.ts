import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { UtilitiesRepoImpl } from "../../data/utilities-repo-impl";

export class UtilitiesUsecases {
  private readonly repo = new UtilitiesRepoImpl();

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
