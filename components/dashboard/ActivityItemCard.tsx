import { Pressable } from "react-native";
import React from "react";
import { Box, CustomText } from "../general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";

interface IProps {
  type?: "BUY" | "SEND" | "RECIEVD" | "SWAP" | "CONTRACT_INTERACTION";
  amount?: number;
  status?: "PENDING" | "SENT" | "FAILED";
}

const ActivityItemCard = ({
  type = "BUY",
  amount = 12.12,
  status = "PENDING",
}: IProps) => {
  const {
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
  } = useBottomSheetRefs();
  const handlePress = () => {
    if (approvedActivityRef.current) {
      approvedActivityRef.current.expand();
    }
  };
  return (
    <Pressable
      style={{
        width: "100%",
        height: "auto",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
      }}
      onPress={handlePress}
    >
      <Box flexDirection="row" alignItems="center">
        <Box
          width={32}
          height={32}
          borderRadius={32}
          bg="secondaryBackgroundColor"
          marginRight="m"
        ></Box>
        <Box>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <CustomText fontSize={14} variant="bodyMedium">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </CustomText>
            <Box
              width={53}
              height={19}
              borderRadius={19}
              justifyContent="center"
              alignItems="center"
              marginLeft="s"
              style={{ backgroundColor: "#393002" }}
            >
              <CustomText fontSize={10} style={{ color: "#FEDB24" }}>
                {status.charAt(0).toUpperCase()}
                {status.slice(1).toLowerCase()}
              </CustomText>
            </Box>
          </Box>
          <CustomText fontSize={12}>To 0xd5321...de32</CustomText>
        </Box>
      </Box>
      <Box justifyContent="center" alignItems="flex-end">
        <CustomText variant="bodyMedium" fontSize={12}>
          +{amount}USDT
        </CustomText>
        <CustomText variant="bodyMedium" fontSize={10}>
          ${amount}
        </CustomText>
      </Box>
    </Pressable>
  );
};

export default ActivityItemCard;
