import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../../domain/entities/order.types";
import { ApiResponse, swapApiService } from "./swap-api.service";

export const createSwapOrder = async (
  payload: CreateOrderRequest
): Promise<ApiResponse<CreateOrderResponse>> => {
  const requestId = Math.random().toString(36).substr(2, 9);

  console.log(`🛒 [${requestId}] Creating Swap Order:`, {
    route: "/orders",
    payload: JSON.stringify(payload, null, 2),
    timestamp: new Date().toISOString(),
  });

  try {
    const response: ApiResponse<CreateOrderResponse> =
      await swapApiService.post("/orders", payload);

    console.log(`✅ [${requestId}] Swap Order Created Successfully:`, {
      route: "/orders",
      response: JSON.stringify(response, null, 2),
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error(`❌ [${requestId}] Swap Order Creation Failed:`, {
      route: "/orders",
      payload: JSON.stringify(payload, null, 2),
      error: error,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};
