import { GeneralRequestModel } from "@/src/core/api/http-types";
import { AppDispatch } from "@/state";
import { useDispatch } from "react-redux";
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
  };
};

export default useUtilities;
