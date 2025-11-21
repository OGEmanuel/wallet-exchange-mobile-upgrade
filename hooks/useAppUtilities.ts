const useAppUtilities = (): {
  getApproximateAmount: (amount?: number, isCrypto?: boolean, forMarket?: boolean) => string;
} => {
  const getApproximateAmount = (amount?: number, isCrypto?: boolean, forMarket?: boolean): string => {
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
  };

  return {
    getApproximateAmount,
  };
};

export default useAppUtilities;

