import { DocumentClass } from "./user-model";

export interface Login2FaResponseModel {
  token?: string;
  user?: User;
  refreshToken?: string;
  session?: Session;
}

export interface Session {
  userId?: string;
  ip?: string;
  refreshToken?: string;
  jwt?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface User {
  isGuest?: boolean;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  username?: string;
  v1Id?: string;
  phone?: string;
  platforms?: string[];
  googleId?: string;
  deviceToken?: string[];
  joinDate?: string;
  status?: boolean;
  physicalAddressId?: null;
  phoneNumberVerified?: boolean;
  roleIds?: RoleID[];
  countryId?: CountryID;
  verificationIds?: VerificationID[];
  isTwoFAenabled?: boolean;
  viewedTooltipOnMobile?: boolean;
  viewedTooltipOnWeb?: boolean;
  flagId?: string[];
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  totp?: string;
}

export interface CountryID {
  _id?: string;
  name?: string;
  alpha2?: string;
  alpha3?: string;
  flagUrl?: string;
  states?: string[];
  currencyId?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  requiredDocuments?: RequiredDocument[];
}

export interface RequiredDocument {
  _id?: string;
  documentClass?: DocumentClass;
  documentTypes?: string[];
  total?: number;
}

export interface RoleID {
  _id?: string;
  name?: string;
  description?: string;
  key?: string;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  _id?: string;
  resource?: string;
  actions?: string[];
  scope?: string;
  description?: string;
}

export interface VerificationID {
  _id?: string;
  userId?: string;
  idNumber?: string;
  docUrl?: string;
  submittedAt?: string;
  verificationType?: string;
  status?: string;
  resendCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
