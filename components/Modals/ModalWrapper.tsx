import { View, Text, Modal, DimensionValue } from "react-native";
import React, { PropsWithChildren } from "react";
import Box from "../general/Box";
import theme from "@/theme";
import { Pressable } from "react-native-gesture-handler";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  height?: DimensionValue;
}

const ModalWrapper = ({
  isOpen,
  height = "50%",
  children,
  onClose,
}: IProps & PropsWithChildren) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      style={{
        flex: 1,
        zIndex: 1,
      }}
      animationType="slide"
      collapsable
    >
      <Box
        flex={1}
        zIndex={2}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => onClose()}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.49)",
          paddingHorizontal: 15,
          justifyContent: "flex-end",
          paddingBottom: 20,
        }}
      >
        <Box
          width="100%"
          height={height}
          borderRadius={20}
          backgroundColor="secondaryBackgroundColor"
          zIndex={2}
        >
          <Box
            width={"100%"}
            height={30}
            alignItems="center"
            justifyContent="center"
            zIndex={2}
          >
            <Pressable
              style={{
                width: 60,
                height: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.bodyTextColor,
                zIndex: 10,
              }}
              onPress={() => alert("Hello there")}
            />
          </Box>
          <Box flex={1}>{children}</Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalWrapper;
