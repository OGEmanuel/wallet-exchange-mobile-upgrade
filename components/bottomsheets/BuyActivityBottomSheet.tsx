import { ThemedClockOutlineIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useState } from "react";
import { Pressable } from "react-native";
import { CustomButton, CustomText } from "../general";
import Box from "../general/Box";

// innner components
const Summary = () => {
  return (
    <Box>
      <Box
        width={"100%"}
        alignItems="center"
        bg="secondaryBackgroundColor"
        borderRadius={10}
        height={280}
        mt="s"
        paddingVertical="m"
        paddingHorizontal="m"
      >
        <CustomText textAlign="center" fontSize={12} width={"70%"}>
          Make your deposit using the account details provided below.
        </CustomText>

        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          height={30}
          mb="m"
          mt="l"
        >
          <CustomText color="disabledTextColor" fontSize={12}>
            Bank
          </CustomText>
          <CustomText fontSize={12}>SafeHaven MFB</CustomText>
        </Box>

        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          height={30}
          mb="m"
        >
          <CustomText color="disabledTextColor" fontSize={12}>
            Account Name
          </CustomText>
          <CustomText fontSize={12}>ZAP TechnologyLi/Jonathan Doe</CustomText>
        </Box>

        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          height={30}
          mb="m"
        >
          <CustomText color="disabledTextColor" fontSize={12}>
            Account Number
          </CustomText>
          <CustomText fontSize={12}>2000680462</CustomText>
        </Box>

        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          height={30}
          mb="m"
        >
          <CustomText color="disabledTextColor" fontSize={12}>
            Status
          </CustomText>
          <CustomButton
            text="Pending"
            variant="bodySubheader"
            width={76}
            height={25}
            borderRadius={20}
            borderWidth={1}
            borderColor="#FEDB24"
            bgColor="#393002"
            color="#FEDB24"
            onPress={() => {}}
          />
        </Box>
      </Box>

      <Box
        backgroundColor="tabBarActiveColor"
        p="m"
        borderRadius={10}
        height={52}
        mt="s"
        style={{ backgroundColor: "#5752205E" }}
      >
        <Box
          flex={1}
          borderLeftWidth={2}
          borderLeftColor="tabBarActiveColor"
          paddingLeft="s"
          flexWrap="wrap"
          overflow="hidden"
          width={"100%"}
        >
          <CustomText variant="body" fontSize={12} numberOfLines={3}>
            We will complete your transaction of 4,844,800 NGN after we confirm
            receipt of your deposit
          </CustomText>
        </Box>
      </Box>
    </Box>
  );
};
const DepositDetails = () => {
  return (
    <Box
      width={"100%"}
      alignItems="center"
      bg="secondaryBackgroundColor"
      borderRadius={10}
      height={280}
      mt="s"
      paddingVertical="m"
      paddingHorizontal="m"
    >
      <CustomText textAlign="center" fontSize={12} width={"70%"}>
        Make your deposit using the account details provided below.
      </CustomText>

      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={30}
        mb="m"
        mt="l"
      >
        <CustomText color="disabledTextColor" fontSize={12}>
          Bank
        </CustomText>
        <CustomText fontSize={12}>SafeHaven MFB</CustomText>
      </Box>

      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={30}
        mb="m"
      >
        <CustomText color="disabledTextColor" fontSize={12}>
          Account Name
        </CustomText>
        <CustomText fontSize={12}>ZAP TechnologyLi/Jonathan Doe</CustomText>
      </Box>

      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={30}
        mb="m"
      >
        <CustomText color="disabledTextColor" fontSize={12}>
          Account Number
        </CustomText>
        <CustomText fontSize={12}>2000680462</CustomText>
      </Box>

      <Box
        width={"50%"}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        height={34}
        borderRadius={40}
        backgroundColor="mainBackgroundColor"
        marginTop="m"
      >
        <ThemedClockOutlineIcon width={13} height={13} />
        <CustomText fontSize={12} ml="s">
          Expires in{" "}
          <CustomText color="success" fontSize={12}>
            30:00
          </CustomText>
        </CustomText>
      </Box>
    </Box>
  );
};

const BuyActivityBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const theme = useTheme<Theme>();
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["90%", "80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
        </Box>
      )}
    >
      <BottomSheetView
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 20,
          paddingTop: 30,
        }}
      >
        <CustomText variant="bodyMedium" fontSize={18} textAlign="center">
          Buy
        </CustomText>
        <CustomText variant="body" fontSize={12} mt="s" textAlign="center">
          June 23, 2024 at 12.00 PM
        </CustomText>

        {/* TAB */}
        <Box width={"100%"} alignItems="center" mt="l">
          <Box
            width={"65%"}
            height={49}
            p="s"
            borderRadius={40}
            bg="secondaryBackgroundColor"
            flexDirection="row"
            alignItems="center"
          >
            <Pressable
              style={{
                width: "50%",
                height: "100%",
                borderRadius: 40,
                backgroundColor:
                  activeTab === 1 ? theme.colors.white : "transparent",
                justifyContent: "center",
              }}
              onPress={() => setActiveTab(1)}
            >
              <CustomText
                fontSize={12}
                textAlign="center"
                color={activeTab === 1 ? "black" : "disabledTextColor"}
              >
                Sumary
              </CustomText>
            </Pressable>

            <Pressable
              style={{
                width: "50%",
                height: "100%",
                borderRadius: 40,
                backgroundColor:
                  activeTab === 2 ? theme.colors.white : "transparent",
                justifyContent: "center",
              }}
              onPress={() => setActiveTab(2)}
            >
              <CustomText
                fontSize={12}
                textAlign="center"
                color={activeTab === 2 ? "black" : "disabledTextColor"}
              >
                Deposit Details
              </CustomText>
            </Pressable>
          </Box>
        </Box>

        <Box
          width={"100%"}
          alignItems="center"
          justifyContent="center"
          bg="secondaryBackgroundColor"
          borderRadius={10}
          height={91}
          mt="s"
        >
          <CustomText>You're Sending</CustomText>
          <Box flexDirection="row" alignItems="center" mt="s">
            <Box
              width={35}
              height={35}
              borderRadius={40}
              bg="mainBackgroundColor"
            ></Box>
            <CustomText variant="subheader" fontSize={22} ml="s">
              850,000 NGN
            </CustomText>
          </Box>
        </Box>

        {activeTab === 1 && <Summary />}
        {activeTab === 2 && <DepositDetails />}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default BuyActivityBottomSheet;
