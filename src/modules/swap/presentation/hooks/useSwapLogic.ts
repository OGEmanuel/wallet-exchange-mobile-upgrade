import { AppRootState } from "@/state";
import debounce from "lodash/debounce";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    SwapMetaData,
    SwapRateModel
} from "../../domain/entities/currency.types";
import {
    cleanNumericInput,
    ensureSingleDollarSign,
    formatNumberWithCommas,
    getApproximateAmount,
} from "../../utils/formatUtils";
import { swapActions } from "../state/swap-slice";

export const useSwapLogic = () => {
  const dispatch = useDispatch();
  const {
    sellCurrency,
    receiveCurrency,
    fetchingSwapRate,
    isSwapped,
    swapRateError,
    supportedCurrenciesError,
    swapRate,
  } = useSelector((state: AppRootState) => state.swap);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeInputField, setActiveInputField] = useState<
    "sell" | "receive" | null
  >(null);
  const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);

  const initialSwapData: SwapMetaData = {
    isDollarMode: false,
    dollarValue: "0.00",
    sellInputValue: "0.0025",
    receiveInputValue: "0.00",
  };

  const [swapMetaData, setSwapMetaData] =
    useState<SwapMetaData>(initialSwapData);

  /**
   * Mock function to simulate fetching swap rates
   * Replace this with your actual API call
   */
  const mockFetchSwapRate = async (
    sellCurrencyId: string,
    buyCurrencyId: string,
    amount: number,
    isReceiveInput = false
  ): Promise<SwapRateModel> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock exchange rate (1 BTC = 45000 USD for example)
    const mockRate = 0.022;
    const mockBuyRate = 45000;

    return {
      sellAmount: isReceiveInput ? amount / mockRate : amount,
      buyAmount: isReceiveInput ? amount : amount * mockRate,
      sellRate: mockRate,
      buyRate: mockBuyRate,
      sellCurrency: sellCurrency || undefined,
      buyCurrency: receiveCurrency || undefined,
    };
  };

  // Debounced fetch function
  const debouncedFetchSwapRate = useCallback(
    debounce(
      async (
        sellCurrencyId: string,
        buyCurrencyId: string,
        amount: number,
        isReceiveInput = false
      ) => {
        if (!amount || amount <= 0 || isNaN(amount)) {
          return;
        }

        dispatch(swapActions.setFetchingSwapRate(true));
        dispatch(swapActions.setSwapRateError(null));

        try {
          // Replace this with your actual API call
          const response = await mockFetchSwapRate(
            sellCurrencyId,
            buyCurrencyId,
            amount,
            isReceiveInput
          );

          dispatch(swapActions.setSwapRate(response));

          // Update the other input field based on the response
          if (response) {
            const dollarValue = ensureSingleDollarSign(
              getApproximateAmount(
                (response.buyAmount || 0) * (response.buyRate || 0),
                false
              ),
              true
            );

            setSwapMetaData((prev) => ({
              ...prev,
              dollarValue,
              sellInputValue: isReceiveInput
                ? getApproximateAmount(
                    response.sellAmount || 0,
                    response.sellCurrency?.currencyId?.isCrypto || false
                  )
                : prev.sellInputValue,
              receiveInputValue: !isReceiveInput
                ? getApproximateAmount(
                    response.buyAmount || 0,
                    response.buyCurrency?.currencyId?.isCrypto || false
                  )
                : prev.receiveInputValue,
            }));
          }
        } catch (error) {
          dispatch(
            swapActions.setSwapRateError("Failed to fetch exchange rates")
          );
        } finally {
          dispatch(swapActions.setFetchingSwapRate(false));
          setIsBackgroundRefresh(false);
        }
      },
      1000
    ),
    [dispatch, sellCurrency, receiveCurrency]
  );

  // Trigger swap rate fetch
  const triggerSwapRateFetch = useCallback(
    (isReceiveInput = false) => {
      if (!sellCurrency || !receiveCurrency) {
        return;
      }

      setActiveInputField(isReceiveInput ? "receive" : "sell");

      let amount: number;
      if (isReceiveInput) {
        const receiveAmount = swapMetaData.receiveInputValue;
        const cleanedReceiveAmount = cleanNumericInput(receiveAmount);

        if (
          !cleanedReceiveAmount ||
          cleanedReceiveAmount === "" ||
          parseFloat(cleanedReceiveAmount) <= 0
        ) {
          setSwapMetaData((prev) => ({ ...prev, sellInputValue: "0.00" }));
          return;
        }

        amount = parseFloat(cleanedReceiveAmount);
      } else {
        const sellAmount = swapMetaData.sellInputValue;
        const cleanedSellAmount = cleanNumericInput(sellAmount);

        if (
          !cleanedSellAmount ||
          cleanedSellAmount === "" ||
          parseFloat(cleanedSellAmount) <= 0
        ) {
          setSwapMetaData((prev) => ({ ...prev, receiveInputValue: "0.00" }));
          return;
        }

        amount = parseFloat(cleanedSellAmount);
      }

      debouncedFetchSwapRate(
        sellCurrency._id || "",
        receiveCurrency._id || "",
        amount,
        isReceiveInput
      );
    },
    [sellCurrency, receiveCurrency, swapMetaData, debouncedFetchSwapRate]
  );

  // Handle sell input change
  const handleSellInputChange = useCallback(
    (text: string) => {
      setActiveInputField("sell");

      let formattedValue = text;

      if (swapMetaData.isDollarMode) {
        if (isSwapped) {
          setSwapMetaData((prev) => ({ ...prev, isDollarMode: false }));
        }

        const cleanValue = cleanNumericInput(text);
        formattedValue =
          (isSwapped ? "" : "$") + formatNumberWithCommas(cleanValue);
      } else {
        const rawValue = cleanNumericInput(text);
        formattedValue = formatNumberWithCommas(rawValue);
      }

      setSwapMetaData((prev) => ({
        ...prev,
        sellInputValue: formattedValue,
      }));

      triggerSwapRateFetch();
    },
    [swapMetaData.isDollarMode, isSwapped, triggerSwapRateFetch]
  );

  // Handle receive input change
  const handleReceiveInputChange = useCallback(
    (text: string) => {
      setActiveInputField("receive");

      let formattedValue = text;

      if (swapMetaData.isDollarMode) {
        if (!isSwapped) {
          setSwapMetaData((prev) => ({ ...prev, isDollarMode: false }));
        }

        const cleanValue = cleanNumericInput(text);
        formattedValue =
          (isSwapped ? "$" : "") + formatNumberWithCommas(cleanValue);
      } else {
        const rawValue = cleanNumericInput(text);
        formattedValue = formatNumberWithCommas(rawValue);
      }

      setSwapMetaData((prev) => ({
        ...prev,
        receiveInputValue: formattedValue,
      }));

      triggerSwapRateFetch(true);
    },
    [swapMetaData.isDollarMode, isSwapped, triggerSwapRateFetch]
  );

  // Handle currency swap
  const handleSwap = useCallback(() => {
    setIsTransitioning(true);
    dispatch(swapActions.setIsSwapped(!isSwapped));

    const localSellCurrency = sellCurrency;
    const localReceiveCurrency = receiveCurrency;

    if (localSellCurrency && localReceiveCurrency) {
      dispatch(swapActions.setSellCurrency(localReceiveCurrency));
      dispatch(swapActions.setReceiveCurrency(localSellCurrency));
    }

    // Swap the input values along with the currencies
    setSwapMetaData((prev) => ({
      ...prev,
      sellInputValue: prev.receiveInputValue,
      receiveInputValue: prev.sellInputValue,
    }));

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [isSwapped, sellCurrency, receiveCurrency, dispatch]);

  // Toggle dollar/crypto mode
  const triggerDollarCryptoSwap = useCallback(() => {
    const sellInputValue = swapMetaData.sellInputValue || "";
    const receiveInputValue = swapMetaData.receiveInputValue || "";

    if (swapMetaData.isDollarMode) {
      const valueToSet = (swapMetaData.dollarValue || "").replace(/\$/g, "");

      if (isSwapped) {
        setSwapMetaData({
          ...swapMetaData,
          receiveInputValue: formatNumberWithCommas(valueToSet),
          dollarValue: sellInputValue.startsWith("$")
            ? receiveInputValue
            : ensureSingleDollarSign(receiveInputValue, true),
          isDollarMode: false,
        });
      } else {
        setSwapMetaData({
          ...swapMetaData,
          sellInputValue: formatNumberWithCommas(valueToSet),
          dollarValue: sellInputValue.startsWith("$")
            ? sellInputValue
            : ensureSingleDollarSign(sellInputValue, true),
          isDollarMode: false,
        });
      }
    } else {
      const valueWithoutDollar = (swapMetaData.dollarValue || "").replace(
        /\$/g,
        ""
      );

      if (isSwapped) {
        setSwapMetaData({
          ...swapMetaData,
          receiveInputValue: ensureSingleDollarSign(
            formatNumberWithCommas(valueWithoutDollar),
            true
          ),
          dollarValue: receiveInputValue,
          isDollarMode: true,
        });
      } else {
        setSwapMetaData({
          ...swapMetaData,
          sellInputValue: ensureSingleDollarSign(
            formatNumberWithCommas(valueWithoutDollar),
            true
          ),
          dollarValue: sellInputValue,
          isDollarMode: true,
        });
      }
    }
  }, [swapMetaData, isSwapped]);

  // Retry function for errors
  const retryFetchSwapRate = useCallback(() => {
    if (swapRateError || supportedCurrenciesError) {
      triggerSwapRateFetch();
    }

    setIsBackgroundRefresh(true);

    dispatch(swapActions.setSwapRateError(null));
    dispatch(swapActions.setSupportedCurrenciesError(null));

    setTimeout(() => {
      setIsBackgroundRefresh(false);
    }, 3000);
  }, [swapRateError, supportedCurrenciesError, triggerSwapRateFetch, dispatch]);

  return {
    swapMetaData,
    isTransitioning,
    activeInputField,
    isBackgroundRefresh,
    sellCurrency,
    receiveCurrency,
    fetchingSwapRate,
    isSwapped,
    swapRateError,
    supportedCurrenciesError,
    swapRate,
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    triggerDollarCryptoSwap,
    retryFetchSwapRate,
    triggerSwapRateFetch,
  };
};

