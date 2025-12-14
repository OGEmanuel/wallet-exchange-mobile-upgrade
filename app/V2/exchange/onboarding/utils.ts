import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";

/**
 * Checks if user has submitted all required verification documents
 */
export const submittedAllVerificationDocuments = (user?: UserModel | null): boolean => {
  const listOfCountryRequiredDocumentClasses = user?.countryId?.requiredDocuments?.map(
    (document) => document.documentClass
  );
  const listOfSubmittedDocumentClasses = Array.from(
    new Set(
      user?.verificationIds
        ?.filter((verificationId) => verificationId.status !== "rejected")
        .map((verificationId) => verificationId.documentClass)
    )
  );

  return (
    listOfCountryRequiredDocumentClasses?.length === listOfSubmittedDocumentClasses.length
  );
};

/**
 * Checks if user has submitted credit type verification
 */
export const userHasSubmittedCreditTypeVerification = (
  user?: UserModel | null
): boolean => {
  return (
    user?.verificationIds?.find(
      (verificationId) => verificationId.documentClass === "Credit"
    )?.status === "approved"
  );
};

/**
 * Checks if user is fully onboarded (has completed all onboarding steps)
 */
export const isUserFullyOnboarded = (user?: UserModel | null): boolean => {
  let userIsFullyVerified = false;

  if (
    user?.verificationStatus?.totalApprovedDocuments &&
    user.verificationStatus.totalRequiredDocuments
  ) {
    if (user.phoneNumberVerified && submittedAllVerificationDocuments(user)) {
      userIsFullyVerified = true;
    }
  }

  return userIsFullyVerified;
};

