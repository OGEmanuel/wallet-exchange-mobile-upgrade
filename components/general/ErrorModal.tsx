import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { AlertTriangle, ExternalLink, RefreshCw, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Box from "./Box";
import CustomButton from "./CustomButton";
import CustomText from "./CustomText";

export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  details?: string;
  type?: "error" | "warning" | "info" | "network" | "wallet" | "validation";
  showRetry?: boolean;
  showSupport?: boolean;
  retryText?: string;
  supportText?: string;
  onClose: () => void;
  onRetry?: () => void;
  onSupport?: () => void;
  primaryAction?: {
    text: string;
    onPress: () => void;
  };
  secondaryAction?: {
    text: string;
    onPress: () => void;
  };
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  details,
  type = "error",
  showRetry = false,
  showSupport = false,
  retryText = "Try Again",
  supportText = "Contact Support",
  onClose,
  onRetry,
  onSupport,
  primaryAction,
  secondaryAction,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();

  const getErrorIcon = () => {
    switch (type) {
      case "network":
        return <RefreshCw size={30} color={theme.colors.pendingColor} />;
      case "wallet":
        return <AlertTriangle size={30} color={theme.colors.error} />;
      case "validation":
        return <AlertTriangle size={30} color={theme.colors.pendingColor} />;
      case "warning":
        return <AlertTriangle size={30} color={theme.colors.pendingColor} />;
      case "info":
        return <AlertTriangle size={30} color={theme.colors.primaryColor} />;
      default:
        return <AlertTriangle size={30} color={theme.colors.error} />;
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case "network":
      case "validation":
      case "warning":
        return theme.colors.pendingColor;
      case "wallet":
      case "error":
        return theme.colors.error;
      case "info":
        return theme.colors.primaryColor;
      default:
        return theme.colors.error;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "network":
      case "validation":
      case "warning":
        return "pendingColor";
      case "wallet":
      case "error":
        return "error";
      case "info":
        return "primaryColor";
      default:
        return "error";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.modalBackgroundColor,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            maxHeight: "80%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mb="m"
          >
            <Box flexDirection="row" alignItems="center" flex={1}>
              <Box
                borderWidth={1}
                borderColor={getBackgroundColor()}
                borderRadius={50}
                width={60}
                height={60}
                justifyContent="center"
                alignItems="center"
                marginRight="m"
              >
                {getErrorIcon()}
              </Box>
              <Box flex={1}>
                <CustomText
                  variant="header"
                  fontSize={18}
                  color="headerTextColor"
                  numberOfLines={2}
                >
                  {title}
                </CustomText>
              </Box>
            </Box>
            <Pressable
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: theme.colors.borderColor,
              }}
            >
              <X size={20} color={theme.colors.placeholderTextColor} />
            </Pressable>
          </Box>

          {/* Message */}
          <CustomText
            variant="body"
            fontSize={14}
            color="bodyTextColor"
            lineHeight={20}
            mb="s"
          >
            {message}
          </CustomText>

          {/* Details */}
          {details && (
            <Box
              backgroundColor="secondaryBackgroundColor"
              borderRadius={8}
              padding="m"
              mt="s"
              mb="l"
            >
              <CustomText
                variant="body"
                fontSize={12}
                color="placeholderTextColor"
                lineHeight={16}
              >
                {details}
              </CustomText>
            </Box>
          )}

          {/* Action Buttons */}
          <Box gap="s">
            {primaryAction && (
              <CustomButton
                text={primaryAction.text}
                onPress={primaryAction.onPress}
                width="100%"
                borderRadius={50}
                bgColor={getErrorColor()}
              />
            )}

            {secondaryAction && (
              <CustomButton
                text={secondaryAction.text}
                onPress={secondaryAction.onPress}
                width="100%"
                borderRadius={50}
                bgColor="transparent"
                color="headerTextColor"
                borderWidth={1}
                borderColor={theme.colors.borderColor}
              />
            )}

            {showRetry && onRetry && (
              <CustomButton
                text={retryText}
                onPress={onRetry}
                width="100%"
                borderRadius={50}
                bgColor={theme.colors.primaryColor}
                leadingIcon={<RefreshCw size={16} color={theme.colors.white} />}
              />
            )}

            {showSupport && onSupport && (
              <CustomButton
                text={supportText}
                onPress={onSupport}
                width="100%"
                borderRadius={50}
                bgColor="transparent"
                color={theme.colors.primaryColor}
                borderWidth={1}
                borderColor={theme.colors.primaryColor}
                trailingIcon={
                  <ExternalLink size={16} color={theme.colors.primaryColor} />
                }
              />
            )}

            <CustomButton
              text="Close"
              onPress={onClose}
              borderWidth={1}
              borderColor={theme.colors.borderColor}
              width="100%"
              borderRadius={50}
              bgColor="transparent"
              color={theme.colors.placeholderTextColor}
            />
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ErrorModal;
