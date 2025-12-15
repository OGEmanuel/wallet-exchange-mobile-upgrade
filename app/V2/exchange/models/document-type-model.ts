import { SumsubTokenModel } from "./sumsub-model";
import { DocumentClass, UserModel } from "./user-model";

export interface CountryVerificationDocumentModel {
  _id?: string;
  countryId?: string;
  isExternal?: SumsubTokenModel;
  verificationClass?: DocumentClass;
  verificationType?: string;
  isRequired?: boolean;
  requiredFields?: string[];
  verificationNumberLength?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  providers?: string[];
}

// Check if the user has submitted the document in a particular class
export const userSubmittedDocumentIsApprovedOrPending = (countryVerificationDoc?: CountryVerificationDocumentModel[], user?: UserModel | null): CountryVerificationDocumentModel | null | undefined => {
  return countryVerificationDoc?.find(document => {
    return user?.verificationIds?.find(verificationId => {
      return (verificationId.documentClass === document.verificationClass) && (verificationId.status === 'approved' || verificationId.status === 'pending');
    })
  });
};

export const getApprovedDocumentCount = (user?: UserModel | null): number => {
  return user?.verificationIds?.filter(verificationId => verificationId.status === "approved").length || 0;
}

export interface FilteredVerifiedCountryDocumentModel {
  credit?: CountryVerificationDocumentModel[];
  identity?: CountryVerificationDocumentModel[];
}

export const filterVerificationClasses = (
  arr: CountryVerificationDocumentModel[] | null | undefined
): string[] => {
  const set = new Set(arr?.map((item) => item.verificationClass).filter(Boolean) as string[]);

  return Array.from(set).sort((a, b) => {
    // Define the desired order: Credit first, then Identity, then others alphabetically
    const order: Record<string, number> = { 'Credit': 0, 'Identity': 1 };
    const aOrder = a in order ? order[a] : 999;
    const bOrder = b in order ? order[b] : 999;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // If both have the same priority (or are both "other"), sort alphabetically
    return a.localeCompare(b);
  });
}

// Function to group documents by verification class
export const groupByVerificationClass = (
  arr: CountryVerificationDocumentModel[] | null | undefined
): Record<string, CountryVerificationDocumentModel[]> => {
  // Return an empty object if the input array is null or undefined.
  if (!arr) return {};

  return arr.reduce((acc: Record<string, CountryVerificationDocumentModel[]>, item) => {
    // Create a lowercase key from verificationClass if it exists; otherwise, use "undefined".
    const key = item.verificationClass ? item.verificationClass.toLowerCase() : "undefined";

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
};

export const userHasAtleastOneDocumentApproved = (user?: UserModel | null): boolean => {
  return user?.verificationIds?.find((verificationId) => verificationId.status === "approved") ? true : false;
}
