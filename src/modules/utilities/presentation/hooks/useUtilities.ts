import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { AppDispatch } from "@/state";
import { ExchangeActivityModel, TransactionStatus } from "@zap/blockchain-sdk";
import { useDispatch } from "react-redux";
import { VerifiedCountryModel } from "../../domain/entities/models/verified-country-model";
import { UtilitiesUsecases } from "../../domain/usecases/utilities-usecases";
import { utilitiesActions } from "../state/utilities-slice";

const useUtilities = () => {
  const dispatch = useDispatch<AppDispatch>();
  const utilitiesUsecases = new UtilitiesUsecases();

  return {
    fetchCurrencies: async (payload: GeneralRequestModel<unknown, unknown, unknown>) => {
      const response = await utilitiesUsecases.fetchCurrencies(payload);

      if (response?.data) {
        dispatch(utilitiesActions.setCurrencies(response.data || null));
      }
    },

    fetchSupportedCurrencies: async (payload: GeneralRequestModel<unknown, unknown, unknown>) => {
      return await utilitiesUsecases.fetchSupportedCurrencies(payload);
    },

    fetchVerifiedCountries: async (payload: GeneralRequestModel<unknown, unknown, unknown>) => {
      const response = await utilitiesUsecases.fetchVerifiedCountries(payload);

      if (response?.data) {
        dispatch(utilitiesActions.setVerifiedCountries(response.data || null));
      }
    },

    fetchDocumentTypes: async (payload: GeneralRequestModel<VerifiedCountryModel | null, unknown, unknown>): Promise<GeneralResponseModel<CountryVerificationDocumentModel[] | null | undefined>> => {
      const response = await utilitiesUsecases.fetchDocumentTypes(payload);

      return response;
    },

    uploadFile: async (payload: GeneralRequestModel<FormData, unknown, unknown>) => {
      const response = await utilitiesUsecases.uploadFile(payload);

      return response;
    },

    getApproximateAmount: (amount?: number, isCrypto?: boolean, forMarket?: boolean): string => {
      if (amount === undefined) return '0.00';
  
      let decimalPlaces: number;
  
      if (isCrypto) {
        // If crypto less than 1: use 6 or 8 decimal places depending on the forMarket flag
        // If crypto greater than or equal to 1: use 4 decimal places
        decimalPlaces = amount < 1 ? (forMarket ? 8 : 6) : 4;
      } else {
        decimalPlaces = 2;
      }
  
      const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces
      });
  
      return formatted;
    },

    getActualTransactionStatus: (transaction?: ExchangeActivityModel | null): TransactionStatus | undefined => {
      return (transaction?.childOrder && transaction.childOrder.status !== "PENDING") ? transaction.childOrder.status : transaction?.status;
    },
  
    getAmountToReceive: (transaction?: ExchangeActivityModel | null): number => {
      return transaction?.amountToReceive || 0;
    },
  };
};

export default useUtilities;
