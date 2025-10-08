import { GeneralResponseModel } from "@/src/core/api/http-types";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../../domain/entities/order.types";
import { createSwapOrder } from "./swap-orders.service";
import { SwapRemoteDataSource } from "./swap-remote-datasource";

export class SwapRemoteDataSourceImpl implements SwapRemoteDataSource {
  // Implement your remote data source methods here
  // Example:
  // async getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
  //   // Implementation here
  //   throw new Error("Method not implemented.");
  // }

  async createOrder(
    payload: CreateOrderRequest
  ): Promise<GeneralResponseModel<CreateOrderResponse>> {
    try {
      const response = await createSwapOrder(payload);
      return {
        success: response.success,
        data: response.data,
        message: response.message,
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }
}
