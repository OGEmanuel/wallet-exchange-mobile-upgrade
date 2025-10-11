import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import React, { PropsWithChildren } from "react";
import { Modal } from "react-native";
import Box from "../general/Box";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  color?: [string, string];
}

const FullPageModalWrapper = ({
  isOpen,
  children,
  onClose,
  color = ["#6045FF00", "#AA9CFF"],
}: IProps & PropsWithChildren) => {
  const theme = useTheme<Theme>();
  return (
    <Modal
      visible={isOpen}
      style={{
        flex: 1,
        zIndex: 1,
        padding: 20,
      }}
      animationType="slide"
      collapsable
    >
      <LinearGradient
        colors={color}
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 10,
          zIndex: 1,
        }}
        end={{ x: 0.5, y: 0.6 }}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => {
          onClose();
        }}
      >
        <Box zIndex={4} width="100%" height={100} justifyContent="center" mt="m">
          <X color={theme.colors.white} />
        </Box>
        <Box flex={1} zIndex={3}>
          {children}
        </Box>
      </LinearGradient>
    </Modal>
  );
};

export default FullPageModalWrapper;
