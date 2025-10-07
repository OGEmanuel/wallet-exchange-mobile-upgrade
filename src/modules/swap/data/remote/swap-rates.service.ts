import { ApiResponse, swapApiService } from "./swap-api.service";

export const getEngineRates = async (
  baseCurrency: string,
  targetCurrency: string,
  baseAmount: number,
  targetAmount: number,
  isReversed: boolean,
  lastEditedField: "baseAmount" | "targetAmount" | null,
  amountToSend: number
) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  console.log(`📊 [${requestId}] Fetching Engine Rates:`, {
    route: "/engines/rates/orders",
    parameters: {
      baseCurrency,
      targetCurrency,
      baseAmount,
      targetAmount,
      isReversed,
      lastEditedField,
      amountToSend,
    },
    timestamp: new Date().toISOString(),
  });

  try {
    const params: any = {
      buySupportedCurrencyId: baseCurrency,
      sellSupportedCurrencyId: targetCurrency,
    };

    // Send buyAmount when baseAmount is edited, sellAmount when targetAmount is edited
    if (lastEditedField === "baseAmount") {
      params.buyAmount = amountToSend;
    } else if (lastEditedField === "targetAmount") {
      params.sellAmount = amountToSend;
    } else {
      // Fallback to original logic if no field was edited
      if (!isReversed) {
        params.buyAmount = baseAmount;
      } else {
        params.sellAmount = targetAmount;
      }
    }

    console.log(`📊 [${requestId}] Engine Rates Request Params:`, {
      route: "/engines/rates/orders",
      params: JSON.stringify(params, null, 2),
      timestamp: new Date().toISOString(),
    });

    const response: ApiResponse = await swapApiService.get(
      "/engines/rates/orders",
      params
    );

    console.log(`✅ [${requestId}] Engine Rates Fetched Successfully:`, {
      route: "/engines/rates/orders",
      response: JSON.stringify(response, null, 2),
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    console.error(`❌ [${requestId}] Engine Rates Fetch Failed:`, {
      route: "/engines/rates/orders",
      parameters: {
        baseCurrency,
        targetCurrency,
        baseAmount,
        targetAmount,
        isReversed,
        lastEditedField,
        amountToSend,
      },
      error: error,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};
