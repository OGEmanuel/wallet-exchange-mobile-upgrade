import { Box, CustomButton } from "@/components/general";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Modal } from "react-native";
import { CustomText } from "../general";

interface IProps {
  visible: boolean;
  onClose: () => void;
}

const LogoutModal = ({ visible, onClose }: IProps) => {
  const { logoutFromExchange } = useWallet();
  const handleLogout = async () => {
    await logoutFromExchange();
    router.push("/dashboard/home/wallet-home/swap");
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      allowSwipeDismissal
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
      style={{ height: 40 }}
    >
      <LinearGradient
        colors={["#6045FF", "#1B1251"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          width: "100%",
          height: "100%",
          paddingHorizontal: 20,
          paddingBottom: 10,
          justifyContent: "flex-start",
        }}
      >
        <Box borderRadius={16} paddingHorizontal="m" alignItems="center">
          <Image
            source={require("@/assets/images/zapLogoDark.png")}
            style={{
              height: 40,
              width: 120,
              alignSelf: "center",
              marginTop: 30,
              marginBottom: 30,
            }}
            resizeMode="contain"
          />
          <CustomText
            variant="header"
            fontSize={24}
            fontWeight="bold"
            color="white"
            textAlign="center"
            mb="s"
          >
            Disconnect from zap exchange
          </CustomText>
          <CustomText
            variant="body"
            fontSize={16}
            color="bodyTextColor"
            textAlign="center"
          >
            Are you sure you want to disconnect from zap exchange
          </CustomText>
          <Box
            mt="l"
            flexDirection="column"
            justifyContent="space-between"
            width="100%"
          >
            <Box width={"100%"}>
              <CustomButton
                text="Cancel"
                onPress={() => onClose()}
                width={"100%"}
                borderRadius={100}
              />
            </Box>
            <Box width={"100%"} mt="m">
              <CustomButton
                text="Disconnect"
                onPress={() => handleLogout()}
                width={"100%"}
                borderRadius={100}
                bgColor="red"
                color="white"
              />
            </Box>
          </Box>
        </Box>
      </LinearGradient>
    </Modal>
  );
};

export default LogoutModal;
