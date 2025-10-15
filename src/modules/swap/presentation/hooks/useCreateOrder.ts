import { useState } from "react";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../../domain/entities/order.types";
import { SwapUsecases } from "../../domain/usecases/swap-usecases";

export const useCreateOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (
    payload: CreateOrderRequest
  ): Promise<CreateOrderResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const swapUsecases = new SwapUsecases();
      const response = await swapUsecases.executeCreateOrder(payload);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create order");
        return null;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Failed to create order:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
