import { GeneralResponseModel } from "@/src/core/api/http-types";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "./entities/order.types";

export abstract class SwapRepo {
  // Add your repository methods here
  // Example:
  // abstract getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;

  abstract createOrder(
    payload: CreateOrderRequest
  ): Promise<GeneralResponseModel<CreateOrderResponse>>;
}
