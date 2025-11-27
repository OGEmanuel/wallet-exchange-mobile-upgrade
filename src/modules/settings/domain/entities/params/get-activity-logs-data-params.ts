import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";

export interface IActivityLogsParams {
  userId: string;
  page: number;
  limit: number;
}
