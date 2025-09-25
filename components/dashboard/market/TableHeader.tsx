import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import React from "react";

const TableHeader = () => {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingHorizontal="m"
      height={41}
      borderBottomWidth={0.3}
      borderBottomColor="disabledTextColor"
    >
      <Box flexDirection="row" alignItems="center" gap="s">
        <CustomText variant="body" fontSize={12} color="bodyTextColor">
          #
        </CustomText>
        <CustomText variant="body" fontSize={12} color="bodyTextColor">
          Token
        </CustomText>
      </Box>
      <Box flexDirection="row" alignItems="center" gap="xl">
        <CustomText variant="body" fontSize={12} color="bodyTextColor">
          Price
        </CustomText>
        <CustomText variant="body" fontSize={12} color="bodyTextColor">
          24H
        </CustomText>
      </Box>
    </Box>
  );
};

export default TableHeader;
