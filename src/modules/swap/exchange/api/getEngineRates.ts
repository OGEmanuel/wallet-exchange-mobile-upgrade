import { ApiResponse, httpRequest } from "./httpRequest"

export const getEngineRates = async (
  baseCurrency: string,
  targetCurrency: string,
  baseAmount: number,
  targetAmount: number,
  isReversed: boolean,
  lastEditedField: "baseAmount" | "targetAmount" | null,
  amountToSend: number,
) => {
  try {
    const params: any = {
      buySupportedCurrencyId: baseCurrency,
      sellSupportedCurrencyId: targetCurrency,
    }

    // Send buyAmount when baseAmount is edited, sellAmount when targetAmount is edited
    if (lastEditedField === "baseAmount") {
      params.buyAmount = amountToSend
    } else if (lastEditedField === "targetAmount") {
      params.sellAmount = amountToSend
    } else {
      // Fallback to original logic if no field was edited
      if (!isReversed) {
        params.buyAmount = baseAmount
      } else {
        params.sellAmount = targetAmount
      }
    }

    const response: ApiResponse = await httpRequest.get("/engines/rates/orders", params)

    return response
  } catch (error) {
    console.error("Error fetching engine rates:", error)
    throw error
  }
}
