import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenHistoryDetailModel } from "../../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";
import { AddToWatchlistParams } from "../../domain/entities/params/add-to-watchlist-params";
import { MarketRemoteDataSource, PriceAlertData, PriceAlertResponse } from "./market-remote-datasource";

export class MarketZapSdkDataSourceImpl implements MarketRemoteDataSource {
  async fetchMarketTokens(_: GeneralRequestModel<unknown, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel[]>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.markets.getMarkets();

    return {
      success: true,
      message: "Success",
      data: result,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async toggleAddRemoveTokenToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<MarketTokenModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.markets.addToWatchlist(payload.body);
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async tokenDetails(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenDetailModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.markets.getTokenDetails(payload.body || "");
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async tokenHistory(payload: GeneralRequestModel<string | null, unknown, unknown>): Promise<GeneralResponseModel<TokenHistoryDetailModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.markets.getHistoricalRates(payload.body || "");
    console.log("Market History Result:", result);
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  } 

  async fetchWatchlistTokens(payload: GeneralRequestModel<unknown, unknown, UserModel | null>): Promise<GeneralResponseModel<WatchlistTokenModel[]>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.markets.getUserWatchlist(payload.extra?._id || "");
    return {
      success: true,
      message: "Success",
      data: result,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async createPriceAlert(payload: GeneralRequestModel<PriceAlertData, unknown, unknown>): Promise<GeneralResponseModel<PriceAlertResponse>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.priceAlerts.create(payload.body);
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async addToWatchlist(payload: GeneralRequestModel<AddToWatchlistParams, unknown, unknown>): Promise<GeneralResponseModel<WatchlistTokenModel>> {
    const sdk = zapSDKService.getSDK();
    const result = await sdk.markets.addToWatchlist(payload.body);
    return {
      success: result.success,
      message: result.message,
      data: result.data,
      token: null,
      refreshToken: null,
      error: null,
    };
  }

  async removeFromWatchlist(payload: GeneralRequestModel<string, unknown, unknown>): Promise<GeneralResponseModel<{ success: boolean; message: string }>> {
    const sdk = zapSDKService.getSDK();
    await sdk.markets.removeFromWatchlist(payload.body);
    return {
      success: true,
      message: "Success",
      data: null,
      token: null,
      refreshToken: null,
      error: null,
    };
  }
}   