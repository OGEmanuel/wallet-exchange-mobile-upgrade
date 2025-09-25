import { GeneralResponseModel } from "@/src/core/api/http-types";
import { AuthEmailParams } from "../../domain/entities/params/auth-email-params";
import { KycUsecases } from "../../domain/usecases/kyc-usecase";

const useKyc = () => {
  return {
    authEmail: async (payload: AuthEmailParams): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new KycUsecases();
      const response = await usecase.executeAuthEmail({
        body: payload,
        params: null,
        extra: null,
      });

      return response;
    },
  };
};

export default useKyc; 