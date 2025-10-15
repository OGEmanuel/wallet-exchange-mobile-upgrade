import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
<<<<<<< HEAD
<<<<<<< HEAD
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
import { UserModel } from "../../kyc/domain/entities/models/user-model";

export abstract class ExchangeRepo {
  abstract fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>>;
=======
import { ExchangeActivity } from '@zap/blockchain-sdk';
import { UserModel } from "../../kyc/domain/entities/models/user-model";

export abstract class ExchangeRepo {
  abstract fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivity[]>>;
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
import { UserModel } from "../../kyc/domain/entities/models/user-model";

export abstract class ExchangeRepo {
  abstract fetchExchangeActivities(payload: GeneralRequestModel<UserModel, unknown, unknown>): Promise<GeneralResponseModel<ExchangeActivityModel[]>>;
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
}
