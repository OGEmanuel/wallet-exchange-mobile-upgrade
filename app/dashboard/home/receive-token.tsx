import React, { useState } from "react";
import DashboardActionItem from "@/components/dashboard/DashboardActionItem";
import Box from "@/components/general/Box";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ScanQrCode } from "lucide-react-native";
import { router } from "expo-router";
import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import CustomText from "@/components/general/CustomText";

const ReceiveTokenActionItem = () => {
  const theme = useTheme<Theme>();
  const [isOpen, setIsOpen] = useState(false);

  return <Box flex={1} backgroundColor="mainBackgroundColor"></Box>;
};

export default ReceiveTokenActionItem;
