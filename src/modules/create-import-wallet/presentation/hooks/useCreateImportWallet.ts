import { GeneralRequestModel, GeneralResponseModel } from "@/src/core/api/http-types";
import { CreateWalletParams, CreateWalletResponse } from "../../domain/entities/params/create-wallet-params";
import { ImportPrivateKeyParams } from "../../domain/entities/params/import-private-key-params";
import { ImportSeedPhraseParams } from "../../domain/entities/params/import-seedphrase-params";
import { RestoreFromCloudParams } from "../../domain/entities/params/restore-from-cloud";
import { WatchAddressParams } from "../../domain/entities/params/watch-address-params";
import { CreateImportWalletUsecases } from "../../domain/usecases/create-import-wallet-usecases";

const useCreateImportWallet = () => {
  return {
    createImportWallet: async (payload: GeneralRequestModel<CreateWalletParams, unknown, unknown> ): Promise<GeneralResponseModel<CreateWalletResponse>> => {
      const usecase = new CreateImportWalletUsecases();
      return usecase.executeCreateWallet(payload);
    },

    importSeedPhrase: async (payload: GeneralRequestModel<ImportSeedPhraseParams, unknown, unknown> ): Promise<GeneralResponseModel<CreateWalletResponse>> => {
      const usecase = new CreateImportWalletUsecases();
      return usecase.executeImportSeedPhrase(payload);
    },

    importPrivateKey: async (payload: GeneralRequestModel<ImportPrivateKeyParams, unknown, unknown> ): Promise<GeneralResponseModel<CreateWalletResponse>> => {
      const usecase = new CreateImportWalletUsecases();
      return usecase.executeImportPrivateKey(payload);
    },

    restoreFromCloud: async (payload: GeneralRequestModel<RestoreFromCloudParams, unknown, unknown> ): Promise<GeneralResponseModel<CreateWalletResponse>> => {
      const usecase = new CreateImportWalletUsecases();
      return usecase.executeRestoreFromCloud(payload);
    },
    
    watchAddress: async (payload: GeneralRequestModel<WatchAddressParams, unknown, unknown> ): Promise<GeneralResponseModel<unknown>> => {
      const usecase = new CreateImportWalletUsecases();
      return usecase.executeWatchAddress(payload);
    },
  };
};

export default useCreateImportWallet;