import { Box, CustomText } from "@/components/general";
import React from "react";
import { Image, StyleSheet } from "react-native";

interface BankInfoProps {
  icon?: string;
  name?: string;
}

const BankInfo = ({ icon, name }: BankInfoProps) => (
  <Box style={styles.container}>
    <Box style={styles.iconWrapper}>
      <Image source={{ uri: icon }} style={{ width: 20, height: 20 }} />
    </Box>
    <CustomText fontSize={14}>{name}</CustomText>
  </Box>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default BankInfo;
