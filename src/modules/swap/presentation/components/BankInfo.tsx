import React from "react";
import { StyleSheet, Text, View } from "react-native";
// import { TokenImage } from "@/components";

interface BankInfoProps {
  icon?: string;
  name?: string;
}

const BankInfo = ({ icon, name }: BankInfoProps) => (
  <View style={styles.container}>
    <View style={styles.iconWrapper}>
      {/* <TokenImage uri={icon} name={name} size={20} /> */}
    </View>
    <Text>{name}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default BankInfo;
