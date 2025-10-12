import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CheckCircle, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, View } from "react-native";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = "Continue",
  onButtonPress,
}) => {
  const theme = useTheme<Theme>();

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Box
          backgroundColor="mainBackgroundColor"
          borderRadius={20}
          padding="xl"
          width="90%"
          maxWidth={400}
          alignItems="center"
        >
          {/* Close Button */}
          <Pressable
            onPress={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            <X size={24} color={theme.colors.disabledTextColor} />
          </Pressable>

          {/* Success Icon */}
          <Box
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="success"
            justifyContent="center"
            alignItems="center"
            marginBottom="l"
          >
            <CheckCircle size={40} color="white" />
          </Box>

          {/* Title */}
          <CustomText
            variant="bodyBold"
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
            fontSize={16}
            color="disabledTextColor"
            textAlign="center"
            marginBottom="xl"
            lineHeight={24}
          >
            {message}
          </CustomText>

          {/* Button */}
          <CustomButton
            onPress={handleButtonPress}
            text={buttonText}
            width="100%"
            height={56}
            fontSize={16}
            bgColor={theme.colors.primaryColor}
            color="white"
            borderRadius={30}
          />
        </Box>
      </View>
    </Modal>
  );
};

export default SuccessModal;
