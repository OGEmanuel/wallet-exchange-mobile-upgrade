import Box from "@/components/general/Box";
import ZapLoader from "@/components/general/ZapLoader";
import React from "react";
import { Modal } from "react-native";

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
        <ZapLoader 
          size={100}
          text="Loading..."
          showText={false}
        />
      </Box>
    </Modal>
  );
};

export default Loader;
