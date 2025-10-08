import { GeneralResponseModel } from "@/src/core/api/http-types";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../domain/entities/order.types";
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

  async createOrder(
    payload: CreateOrderRequest
  ): Promise<GeneralResponseModel<CreateOrderResponse>> {
    try {
      return await this.remoteDatasource.createOrder(payload);
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }
}
