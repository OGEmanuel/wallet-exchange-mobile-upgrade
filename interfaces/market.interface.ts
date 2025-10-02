import { HistoryItem } from "@/lib/utils/market/helpers"

export interface CurrencyDetail {
  chainIcon: string
  chainId: string
  createdAt: string
  icon: string
  id: string
  isCrypto: boolean
  name: string
  network: string
  ticker: string
  updatedAt: string
}

export interface NgnRates {
  ngnAllTimeHighUsd: number
  ngnMarketCap: number
  ngnVolume: number
}

export interface CoinData {
  id: string
  allTimeHighUsd: number
  currencyDetail: CurrencyDetail
  history: HistoryItem[]
  icon: string
  lastPrice: number
  marketCap: number
  ngnRates: NgnRates
  percentChange1hr: string
  percentChange24hr: string
  priceChangePercent: string
  symbol: string
  usdPrice: number
  volume: number
  historyDaily: HistoryItem[]
}