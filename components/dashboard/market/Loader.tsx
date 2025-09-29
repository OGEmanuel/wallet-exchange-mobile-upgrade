import LottieView from "lottie-react-native";
import React from "react";
import { Modal } from "react-native";

import Box from "@/components/general/Box";

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  return (
    <Modal transparent visible={visible}>
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <Box
          flex={1}
          alignItems="center"
          justifyContent="center"
          width={100}
          height={100}
          alignSelf="center"
        >
          <LottieView
            source={require("../../../assets/jsons/loader.json")}
            style={{ width: "100%", height: "100%" }}
            autoPlay
            loop
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default Loader;
