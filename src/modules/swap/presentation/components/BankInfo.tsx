import { Box, CustomText } from "@/components/general";
import BankIcon from "@/components/general/BankIcon";
import { Bank } from "@zap/blockchain-sdk";
import React from "react";
import { StyleSheet } from "react-native";

interface BankInfoProps {
  icon?: string;
  name?: string;
  bank?: Bank | null;
}

const BankInfo = ({ icon, name, bank }: BankInfoProps) => {
  // Use bank object if provided, otherwise create a minimal bank object from props
  const bankObj = bank || (icon || name ? { icon, name } as Bank : null);
  
  return (
    <Box style={styles.container}>
      <BankIcon
        bank={bankObj}
        size={20}
        borderRadius={4}
      />
      <CustomText fontSize={14}>{name}</CustomText>
    </Box>
  );
};

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
