import { renderHook, act } from "@testing-library/react-hooks"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { useDebouncedRates } from "../useDebouncedRates"
import swapReducer from "../../slices/swap.slice"

// Mock the API function
jest.mock("../../api/getEngineRates", () => ({
  getEngineRates: jest.fn(),
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      swap: swapReducer,
    },
    preloadedState: {
      swap: {
        baseAmount: 0,
        targetAmount: 0,
        baseCurrency: null,
        targetCurrency: null,
        isReversed: false,
        baseInputIsDollar: false,
        selectedBank: null,
        selectedOption: "exchange",
        currencies: [],
        marketRate: null,
        isRateLoading: false,
        lastEditedField: null,
        ...initialState,
      },
    },
  })
}

const wrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>{children}</Provider>
)

describe("useDebouncedRates", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should not fetch rates when currencies are not set", () => {
    const store = createMockStore()
    const { getEngineRates } = require("../../api/getEngineRates")

    renderHook(() => useDebouncedRates(), {
      wrapper: ({ children }) => wrapper({ children, store }),
    })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(getEngineRates).not.toHaveBeenCalled()
  })

  it("should not fetch rates when amount is below minimum", () => {
    const store = createMockStore({
      baseAmount: 0.005, // Below minimum of 0.01
      baseCurrency: { id: "USD" },
      targetCurrency: { id: "NGN" },
    })
    const { getEngineRates } = require("../../api/getEngineRates")

    renderHook(() => useDebouncedRates({ minAmount: 0.01 }), {
      wrapper: ({ children }) => wrapper({ children, store }),
    })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(getEngineRates).not.toHaveBeenCalled()
  })

  it("should fetch rates when conditions are met", async () => {
    const store = createMockStore({
      baseAmount: 100,
      baseCurrency: { id: "USD" },
      targetCurrency: { id: "NGN" },
    })
    const { getEngineRates } = require("../../api/getEngineRates")
    getEngineRates.mockResolvedValue({ data: { rate: 1500 } })

    renderHook(() => useDebouncedRates({ debounceDelay: 500 }), {
      wrapper: ({ children }) => wrapper({ children, store }),
    })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(getEngineRates).toHaveBeenCalledWith("USD", "NGN", 100, 0, false, null, 100)
  })

  it("should debounce multiple rapid changes", () => {
    const store = createMockStore({
      baseAmount: 100,
      baseCurrency: { id: "USD" },
      targetCurrency: { id: "NGN" },
    })
    const { getEngineRates } = require("../../api/getEngineRates")
    getEngineRates.mockResolvedValue({ data: { rate: 1500 } })

    const { rerender } = renderHook(() => useDebouncedRates({ debounceDelay: 500 }), {
      wrapper: ({ children }) => wrapper({ children, store }),
    })

    // Simulate rapid changes
    act(() => {
      jest.advanceTimersByTime(100)
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    // Should not have called yet
    expect(getEngineRates).not.toHaveBeenCalled()

    // Complete the debounce period
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Should have called only once
    expect(getEngineRates).toHaveBeenCalledTimes(1)
  })

  it("should provide refetchRates function", () => {
    const store = createMockStore({
      baseAmount: 100,
      baseCurrency: { id: "USD" },
      targetCurrency: { id: "NGN" },
    })
    const { getEngineRates } = require("../../api/getEngineRates")
    getEngineRates.mockResolvedValue({ data: { rate: 1500 } })

    const { result } = renderHook(() => useDebouncedRates(), {
      wrapper: ({ children }) => wrapper({ children, store }),
    })

    expect(typeof result.current.refetchRates).toBe("function")

    act(() => {
      result.current.refetchRates()
    })

    expect(getEngineRates).toHaveBeenCalledWith("USD", "NGN", 100, 0, false, null, 100)
  })
})
