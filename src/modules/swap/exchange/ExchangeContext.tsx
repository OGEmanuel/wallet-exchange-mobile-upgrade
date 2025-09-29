// ExchangeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react"
import { SupportedCurrency } from "./hooks/useFetchCurrencies"

interface ExchangeContextType {
  // Exchange state
  selectedSellCurrency: SupportedCurrency | null
  selectedReceiveCurrency: SupportedCurrency | null
  sellAmount: string
  receiveAmount: string
  exchangeRate: number | null
  isLoading: boolean
  error: string | null

  // Exchange actions
  setSelectedSellCurrency: (currency: SupportedCurrency | null) => void
  setSelectedReceiveCurrency: (currency: SupportedCurrency | null) => void
  setSellAmount: (amount: string) => void
  setReceiveAmount: (amount: string) => void
  setExchangeRate: (rate: number | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  swapCurrencies: () => void
  resetExchange: () => void
  validateExchange: () => boolean
}

const ExchangeContext = createContext<ExchangeContextType | null>(null)

export const ExchangeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSellCurrency, setSelectedSellCurrency] = useState<SupportedCurrency | null>(null)
  const [selectedReceiveCurrency, setSelectedReceiveCurrency] = useState<SupportedCurrency | null>(
    null,
  )
  const [sellAmount, setSellAmount] = useState<string>("")
  const [receiveAmount, setReceiveAmount] = useState<string>("")
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Validation function
  const validateExchange = useCallback((): boolean => {
    if (!selectedSellCurrency) {
      setError("Please select a currency to sell")
      return false
    }

    if (!selectedReceiveCurrency) {
      setError("Please select a currency to receive")
      return false
    }

    if (selectedSellCurrency._id === selectedReceiveCurrency._id) {
      setError("Sell and receive currencies must be different")
      return false
    }

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      setError("Please enter a valid sell amount")
      return false
    }

    setError(null)
    return true
  }, [selectedSellCurrency, selectedReceiveCurrency, sellAmount])

  // Memoized swap function
  const swapCurrencies = useCallback(() => {
    const tempCurrency = selectedSellCurrency
    const tempAmount = sellAmount

    setSelectedSellCurrency(selectedReceiveCurrency)
    setSelectedReceiveCurrency(tempCurrency)
    setSellAmount(receiveAmount)
    setReceiveAmount(tempAmount)
    setError(null) // Clear any existing errors
  }, [selectedSellCurrency, selectedReceiveCurrency, sellAmount, receiveAmount])

  // Memoized reset function
  const resetExchange = useCallback(() => {
    setSelectedSellCurrency(null)
    setSelectedReceiveCurrency(null)
    setSellAmount("")
    setReceiveAmount("")
    setExchangeRate(null)
    setIsLoading(false)
    setError(null)
  }, [])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      selectedSellCurrency,
      selectedReceiveCurrency,
      sellAmount,
      receiveAmount,
      exchangeRate,
      isLoading,
      error,
      setSelectedSellCurrency,
      setSelectedReceiveCurrency,
      setSellAmount,
      setReceiveAmount,
      setExchangeRate,
      setIsLoading,
      setError,
      swapCurrencies,
      resetExchange,
      validateExchange,
    }),
    [
      selectedSellCurrency,
      selectedReceiveCurrency,
      sellAmount,
      receiveAmount,
      exchangeRate,
      isLoading,
      error,
      swapCurrencies,
      resetExchange,
      validateExchange,
    ],
  )

  return <ExchangeContext.Provider value={contextValue}>{children}</ExchangeContext.Provider>
}

export const useExchange = () => {
  const context = useContext(ExchangeContext)
  if (!context) {
    throw new Error("useExchange must be used within an ExchangeProvider")
  }
  return context
}
