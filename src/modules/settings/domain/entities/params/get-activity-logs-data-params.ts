import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";

export interface IActivityLogsParams {
  user?: UserModel;
  page: number;
  limit: number;
}
