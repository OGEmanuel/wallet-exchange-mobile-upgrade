import { GeneralResponseModel } from "@/src/core/api/http-types";
import { SwapRepoImpl } from "../../data/swap-repo-impl";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../entities/order.types";

export class SwapUsecases {
  private readonly repo = new SwapRepoImpl();

  // Add your use case methods here
  // Example:
  // async executeGetData(payload: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<unknown>> {
  //   // Validate input parameters
  //   this.validateGetDataParams(payload.body);
  //
  //   return this.repo.getData(payload);
  // }

  async executeCreateOrder(
    payload: CreateOrderRequest
  ): Promise<GeneralResponseModel<CreateOrderResponse>> {
    // Validate input parameters
    this.validateCreateOrderParams(payload);

    return this.repo.createOrder(payload);
  }

  private validateCreateOrderParams(params: CreateOrderRequest): void {
    if (!params) {
      throw new Error("Order parameters are required");
    }

    if (!params.buySupportedCurrencyId) {
      throw new Error("Buy currency ID is required");
    }

    if (!params.sellSupportedCurrencyId) {
      throw new Error("Sell currency ID is required");
    }

    // Validate that either buyAmount or sellAmount is provided
    if (!params.buyAmount && !params.sellAmount) {
      throw new Error("Either buy amount or sell amount is required");
    }

    if (params.buyAmount && params.buyAmount <= 0) {
      throw new Error("Buy amount must be greater than 0");
    }

    if (params.sellAmount && params.sellAmount <= 0) {
      throw new Error("Sell amount must be greater than 0");
    }
  }
}
