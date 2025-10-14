import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { RefreshCw, WifiOff } from "lucide-react-native";
import React from "react";
import { Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NetworkErrorModalProps {
  visible: boolean;
  onRetry: () => void;
  onClose: () => void;
  title?: string;
  message?: string;
  showRetryButton?: boolean;
}

const NetworkErrorModal: React.FC<NetworkErrorModalProps> = ({
  visible,
  onRetry,
  onClose,
  title = "No Internet Connection",
  message = "Please check your internet connection and try again.",
  showRetryButton = true,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Box
        flex={1}
        backgroundColor="modalBackgroundColor"
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="l"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Box
          backgroundColor="modalBackgroundColor"
          borderRadius={16}
          padding="xl"
          width="100%"
          maxWidth={400}
          alignItems="center"
        >
          {/* Icon */}
          <Box
            backgroundColor="error"
            borderRadius={50}
            width={80}
            height={80}
            justifyContent="center"
            alignItems="center"
            marginBottom="l"
          >
            <WifiOff size={40} color={theme.colors.error} />
          </Box>

          {/* Title */}
          <CustomText
            variant="header"
            fontSize={20}
            color="headerTextColor"
            textAlign="center"
            marginBottom="s"
          >
            {title}
          </CustomText>

          {/* Message */}
          <CustomText
            variant="body"
            color="disabledTextColor"
            textAlign="center"
            marginBottom="xl"
            lineHeight={22}
          >
            {message}
          </CustomText>

          {/* Buttons */}
          <Box width="100%" gap="m">
            {showRetryButton && (
              <CustomButton
                text="Try Again"
                onPress={onRetry}
                variant="body"
                icon={<RefreshCw size={20} color={theme.colors.white} />}
              />
            )}

            <CustomButton text="Close" onPress={onClose} variant="body" />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default NetworkErrorModal;
