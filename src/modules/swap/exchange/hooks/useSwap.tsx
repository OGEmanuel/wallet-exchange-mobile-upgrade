import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import {
  setBaseAmount,
  setTargetAmount,
  setBaseCurrency,
  setTargetCurrency,
  setIsReversed,
  setSelectedBank,
  setCurrencies,
  setSelectedOption,
  setMarketRate,
  setIsRateLoading,
  setBaseInputIsDollar,
  swapCurrencies,
} from "../slices/swap.slice"
import { useDebouncedRates } from "./useDebouncedRates"
import { formatTargetAmount } from "../utils/formatting"

// useSwap hook using Redux for state management
export const useSwap = () => {
  const dispatch = useDispatch()

  // Select state from Redux store
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    isReversed,
    selectedBank,
    currencies,
    selectedOption,
    marketRate,
    isRateLoading,
    baseInputIsDollar,
  } = useSelector((state: RootState) => state.swap)

  // Use debounced rate fetching
  const { refetchRates } = useDebouncedRates({
    debounceDelay: 500, // 500ms delay
    minAmount: 0.01, // Minimum amount to trigger rate fetch
  })

  // Redux-powered methods
  const setBaseInput = useCallback(
    (value: boolean) => {
      console.log("setBaseInput called with:", value)
      dispatch(setBaseInputIsDollar(value))
    },
    [dispatch],
  )

  const handleBaseAmountFormat = useCallback(() => {
    console.log("handleBaseAmountFormat called")
    return baseAmount?.toString() || "0"
  }, [baseAmount])

  const handleTargetAmountFormat = useCallback(() => {
    console.log("handleTargetAmountFormat called")
    return formatTargetAmount({ targetAmount, targetCurrency })
  }, [targetAmount])

  const handleTargetAmountChange = useCallback(
    (amount: string) => {
      console.log("handleTargetAmountChange called with:", amount)
      const numAmount = parseFloat(amount) || 0
      dispatch(setTargetAmount(numAmount))
    },
    [dispatch],
  )

  const handleBaseAmountChange = useCallback(
    (amount: string) => {
      console.log("handleBaseAmountChange called with:", amount)
      const numAmount = parseFloat(amount) || 0
      console.log("Dispatching setBaseAmount with:", numAmount)
      dispatch(setBaseAmount(numAmount))
    },
    [dispatch],
  )

  const handleSwapCurrencies = useCallback(() => {
    console.log("handleSwapCurrencies called")
    dispatch(swapCurrencies())
  }, [dispatch])

  const handleBaseToUsdFormat = useCallback(() => {
    console.log("handleBaseToUsdFormat called")
    return baseAmount?.toString() || "0"
  }, [baseAmount])

  const setChangedByUser = useCallback((type: string) => {
    console.log("setChangedByUser called with:", type)
  }, [])

  // Enhanced currency setters that trigger immediate rate fetch
  const setBaseCurrencyWithRates = useCallback(
    (currency: any) => {
      dispatch(setBaseCurrency(currency))
      // Trigger immediate rate fetch when currency changes
      setTimeout(() => refetchRates(), 100)
    },
    [dispatch, refetchRates],
  )

  const setTargetCurrencyWithRates = useCallback(
    (currency: any) => {
      dispatch(setTargetCurrency(currency))
      // Trigger immediate rate fetch when currency changes
      setTimeout(() => refetchRates(), 100)
    },
    [dispatch, refetchRates],
  )

  return {
    // State properties
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    isReversed,
    selectedBank,
    currencies,
    selectedOption,
    marketRate,
    isRateLoading,
    baseInputIsDollar,

    // Redux setters (wrapped in dispatch)
    setBaseAmount: (amount: number) => dispatch(setBaseAmount(amount)),
    setTargetAmount: (amount: number) => dispatch(setTargetAmount(amount)),
    setBaseCurrency: setBaseCurrencyWithRates,
    setTargetCurrency: setTargetCurrencyWithRates,
    setSelectedBank: (bank: any) => dispatch(setSelectedBank(bank)),
    setCurrencies: (currencies: any[]) => dispatch(setCurrencies(currencies)),
    setSelectedOption: (option: string) => dispatch(setSelectedOption(option)),
    setMarketRate: (rate: any) => dispatch(setMarketRate(rate)),
    setIsRateLoading: (loading: boolean) => dispatch(setIsRateLoading(loading)),

    // Methods
    setBaseInput,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleTargetAmountChange,
    handleBaseAmountChange,
    handleSwapCurrencies,
    handleBaseToUsdFormat,
    setChangedByUser,
    refetchRates, // Expose manual refetch function
  }
}
