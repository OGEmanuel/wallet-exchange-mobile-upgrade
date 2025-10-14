const useAppUtilities = (): {
  getApproximateAmount: (
    amount: number | undefined,
    isCrypto?: boolean,
    forMarket?: boolean
  ) => string;
  truncateString: (
    str: string,
    prefixLength: number,
    suffixLength: number
  ) => string;
} => {
  const getApproximateAmount = (
    amount: number | undefined,
    isCrypto?: boolean,
    forMarket?: boolean
  ): string => {
    if (amount === undefined) return "0.00";

    let decimalPlaces: number;

    if (isCrypto || amount < 1) {
      // If crypto less than 1: use 6 or 8 decimal places depending on the forMarket flag
      // If crypto greater than or equal to 1: use 4 decimal places
      decimalPlaces = amount < 1 ? (forMarket ? 8 : 6) : 4;
    } else {
      decimalPlaces = 2;
    }

    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalPlaces,
    });

    return formatted;
  };

  const truncateString = (str: string, prefixLength = 5, suffixLength = 5) => {
    try {
      if (str.length <= prefixLength + suffixLength) {
        return str;
      }

      const prefix = str.slice(0, prefixLength);
      const suffix = str.slice(-suffixLength);

      return `${prefix}...${suffix}`;
    } catch (error) {
      console.error(error);
      return str;
    }
  };

  return {
    getApproximateAmount,
    truncateString,
  };
};

export default useAppUtilities;
