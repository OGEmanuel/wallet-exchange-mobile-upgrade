import { View, Text } from "react-native";
import React from "react";
import ModalWrapper from "./ModalWrapper";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

const CreatePinModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} height={"50%"}>
      <Box flex={1} padding="s">
        <CustomText>Hello there people</CustomText>
      </Box>
    </ModalWrapper>
  );
};

export default CreatePinModal;
