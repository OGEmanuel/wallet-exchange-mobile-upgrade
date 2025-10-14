import { ThemedCancelIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Animated, Modal, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Box from "../general/Box";

interface AppBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
  dismissable?: boolean;
}

const AppBottomSheet = ({
  isVisible,
  onClose,
  children,
  minHeight,
  maxHeight,
  dismissable = true,
}: AppBottomSheetProps) => {
  const theme = useTheme<Theme>();

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={onClose}
          disabled={!dismissable}
        />

        <GestureDetector gesture={Gesture.Pan()}>
          <Animated.View
            style={{
              backgroundColor: theme.colors.mainBackgroundColor,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 20,
              minHeight: minHeight,
              maxHeight: maxHeight,
            }}
          >
            <Box
              style={{
                width: 60,
                height: 4,
                borderRadius: 10,
                backgroundColor: theme.colors.bodyTextColor,
                marginBottom: dismissable ? 20 : 0,
                alignSelf: "center",
              }}
            ></Box>

            {!dismissable && (
              <Box zIndex={4} width="100%" justifyContent="center" my="m">
                <TouchableOpacity onPress={onClose} activeOpacity={1}>
                  <ThemedCancelIcon />
                </TouchableOpacity>
              </Box>
            )}
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

export default AppBottomSheet;
