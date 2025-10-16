import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
import { UserModel } from "../../kyc/domain/entities/models/user-model";

export abstract class ExchangeRepo {
  abstract fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>>;
}
