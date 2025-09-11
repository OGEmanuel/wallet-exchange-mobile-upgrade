import { Box, CustomText } from "@/components/general";
import React from "react";

const Setup = () => {
  return (
    <Box
      flex={1}
      bg="mainBackgroundColor"
      justifyContent="center"
      alignItems="center"
    >
      <CustomText color="primaryColor">Hello There</CustomText>
    </Box>
  );
};

export default Setup;
