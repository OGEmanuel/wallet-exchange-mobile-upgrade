import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Dimensions, Modal, StyleSheet, View } from "react-native";
import ZapLoader from "../general/ZapLoader";

interface LoadingModalProps {
  isVisible: boolean;
  message?: string;
  onClose?: () => void;
}

const { width, height } = Dimensions.get("window");

const LoadingModal: React.FC<LoadingModalProps> = ({
  isVisible,
  message = "Loading...",
  onClose,
}) => {
  const theme = useTheme<Theme>();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ZapLoader size={80} text={message} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    width: width,
    height: height,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    marginBottom: 20,
    // Add rotation animation here if needed
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default LoadingModal;
