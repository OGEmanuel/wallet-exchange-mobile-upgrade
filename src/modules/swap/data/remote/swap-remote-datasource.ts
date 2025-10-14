import { GeneralResponseModel } from "@/src/core/api/http-types";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../../domain/entities/order.types";

export abstract class SwapRemoteDataSource {
  // Add your remote data source methods here
  // Example:
  // abstract getData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>>;

  abstract createOrder(
    payload: CreateOrderRequest
  ): Promise<GeneralResponseModel<CreateOrderResponse>>;
}
