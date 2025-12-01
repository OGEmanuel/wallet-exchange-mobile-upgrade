import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../core/api/query-keys";
import { useWallet } from "../core/wallet/wallet-context";

export const useGetExchangeUser = () => {
  const { getExchangeUser } = useWallet();

  return useQuery({
    queryKey: queryKeys.exchangeUser.all,
    queryFn: async () => await getExchangeUser(),
  });
};
