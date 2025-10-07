import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../../domain/entities/order.types";
import { ApiResponse, swapApiService } from "./swap-api.service";

export const createSwapOrder = async (
  payload: CreateOrderRequest
): Promise<ApiResponse<CreateOrderResponse>> => {
  try {
    const response: ApiResponse<CreateOrderResponse> =
      await swapApiService.post("/orders", payload);

    return response;
  } catch (error) {
    console.error("Error creating swap order:", error);
    throw error;
  }
};
