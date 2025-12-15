import { UserModel } from "./user-model";

export interface AuthVerificationModel {
  token?:        string;
  user?:         UserModel;
  twoFA?:        boolean;
  refreshToken?: string;
  partialToken?: string;
  userId?: string;
  session?:      Session;
}

interface Session {
  userId?:       string;
  ip?:           string;
  refreshToken?: string;
  jwt?:          string;
  _id?:          string;
  createdAt?:    string;
  updatedAt?:    string;
  __v?:          number;
}
