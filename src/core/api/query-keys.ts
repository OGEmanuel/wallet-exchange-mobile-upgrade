export const queryKeys = {
  activity: {
    all: ["activity"],
    logs: (page?: number, limit?: number) => [
      ...queryKeys.activity.all,
      "logs",
      { page, limit },
    ],
    transactions: (page?: number, limit?: number) => [
      ...queryKeys.activity.all,
      "transactions",
      { page },
    ],
    searchLogs: (search?: string) => [...queryKeys.activity.logs(), search],
    searchTransactions: (search?: string) => [
      ...queryKeys.activity.transactions(),
      search,
    ],
  },
  exchangeUser: {
    all: ["userData"],
  },
};
