import { CountryData } from "@/src/core/utils/countryData";
import { CountryVerificationDocumentModel } from "./document-type-model";
import { VerifiedCountryModel } from "./verified-country-model";

export type DocumentClass = "Credit" | "Identity";

export interface UserModel {
  isGuest?: boolean;
  avatar?: Avatar;
  twoFA?: boolean;
  isTwoFAenabled?: boolean;
  guestId?: string;
  totp?: string;
  username?: string;
  _id?: string;
  userId?: string;
  phone?: string;
  phoneNumberVerified?: boolean;
  email?: string;
  emailVerified?: boolean;
  v1Id?: string;
  platforms?: string[];
  deviceToken?: string[];
  status?: boolean;
  roleIds?: RoleID[];
  countryId?: VerifiedCountryModel;
  verificationIds?: VerificationID[];
  flagId?: string[];
  rating?: number;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  viewedTooltipOnWeb?: boolean;
  viewedTooltipOnMobile?: boolean;
  firstName?: string;
  lastName?: string;
  verificationStatus?: VerificationStatus;
  requiredDocuments?: RequiredDocument[];
  metaData?: MetaDataExtras;
}

export interface Avatar {
  backgroundColor?: string;
  url?: string;
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

export type VerificationDocumentStatus = "pending" | "approved" | "rejected" | "unverified";

export interface VerificationID {
  _id?: string;
  userId?: string;
  idNumber?: string;
  docUrl?: string;
  submittedAt?: string;
  verificationType?: string;
  status?: VerificationDocumentStatus;
  resendCount?: number;
  createdAt?: string;
  updatedAt?: string;
  documentClass?: DocumentClass;
  __v?: number;
}

export interface UserVerification {
  idVerification?: string;
}

export interface ServerTokenModel {
  token?: string;
  refreshToken?: string;
}

// metaData to flag onboarding milestones
// Not to be saved to db but only kept in state
export interface MetaDataExtras {
  idVerificationData?: IDVerificationDataModel | null;
  userPhoneNumberData?: UserPhonenUmberDataModel;
  shownIdentificationOverviewOnboardingIntro?: boolean;
  authBvnVerificationSuccessShown?: boolean;
  bvnMarkedAsVerified?: boolean;
  skippedBvnVerification?: boolean;
  // authData?: AuthData;
  documentVerification?: DocumentVerificationModel;
  manuallySetAllIdenityDocumentToSubmitted?: boolean;
}

export interface DocumentVerificationModel {
  selectedVerifiedCountry?: VerifiedCountryModel | null;
}

// export interface AuthData {
//   googleLogin?: GoogleLoginModel;
//   appleLogin?: AppleLoginModel;
// }

export interface UserPhonenUmberDataModel {
  countryData?: CountryData;
  shownPhoneNumberOnboardingIntro?: boolean;
  userskippedPhoneNumberOnboarding?: boolean;
  shownPhoneNumberInput?: boolean;
}

export interface IDVerificationDataModel {
  firstName?: string;
  lastName?: string;
  documentId?: string;
  dateOfBirth?: string;
  selectedVerifiedCountry?: VerifiedCountryModel;
  documentType?: CountryVerificationDocumentModel;
  shownAuthIdVerificationInput?: boolean;
}

// export interface DocumentType {
//   _id?: string;
//   countryId?: string;
//   isExternal?: SumsubTokenModel;
//   verificationClass?: DocumentClass;
//   verificationType?: string;
//   isRequired?: boolean;
//   requiredFields?: string[];
//   verificationNumberLength?: number;
//   createdAt?: string;
//   updatedAt?: string;
//   __v?: number;
//   providers?: string[];
// }

export interface VerificationStatus {
  totalRequiredDocuments?: number;
  totalApprovedDocuments?: number;
}
