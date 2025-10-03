import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CountryVerificationDocumentModel } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { AppDispatch } from "@/state";
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
  };
};

export default useUtilities;
