import EditAvatarBottomSheet from "@/components/bottomsheets/preference/EditAvatarBottomSheet";
import EditFirstnameBottomSheet from "@/components/bottomsheets/preference/EditFirstnameBottomSheet";
import EditUsernameBottomSheet from "@/components/bottomsheets/preference/EditUsernameBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

const ItemCard = ({
  title,
  value,
  onPress,
  showBorder = true,
}: {
  title: string;
  value: string;
  onPress: () => void;
  showBorder: boolean;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable onPress={onPress}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={60}
        borderBottomWidth={showBorder ? 0.5 : 0}
        borderBottomColor="borderColor"
      >
        <CustomText
          fontSize={12}
          variant="bodyMedium"
          color="disabledTextColor"
        >
          {title}
        </CustomText>
        <Box flexDirection="row" alignItems="center">
          <CustomText fontSize={14} color="bodyTextColor">
            {value}
          </CustomText>
          <ChevronRight size={20} color={theme.colors.bodyTextColor} />
        </Box>
      </Box>
    </Pressable>
  );
};

const EditProfile = () => {
  const [type, setType] = React.useState<"firstname" | "lastname" | "phone">(
    "firstname"
  );
  // refs
  const { editAvatarRef, editUsernameRef, editFirstnameRef } =
    useBottomSheetRefs();
  const item: {
    title: string;
    value: string;
    onPress: () => void;
  }[] = [
    {
      title: "Username",
      value: "CryptoKing",
      onPress: () => {
        editUsernameRef.current?.snapToIndex(1);
      },
    },
    {
      title: "First name",
      value: "jonathan",
      onPress: () => {
        setType("firstname");
        editFirstnameRef.current?.snapToIndex(1);
      },
    },
    {
      title: "Last name",
      value: "Mayers",
      onPress: () => {
        setType("lastname");
        editFirstnameRef.current?.snapToIndex(1);
      },
    },
    {
      title: "Phone number",
      value: "+234812384948",
      onPress: () => {
        setType("phone");
        editFirstnameRef.current?.snapToIndex(1);
      },
    },
  ];
  return (
    <PageWrapper>
      <SettingsHeader title="Edit Profile" onBackPress={() => router.back()} />
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        <Box width={"100%"} height={"auto"} alignItems="center" mt="l">
          <Box width={60} height={60} borderRadius={30} bg="pendingColor"></Box>
          <CustomText
            textAlign="center"
            mt="m"
            color="tabBarActiveColor"
            fontSize={14}
            onPress={() => editAvatarRef.current?.snapToIndex(1)}
          >
            Change avatar
          </CustomText>
        </Box>

        <Box
          width={"100%"}
          height={"auto"}
          borderRadius={12}
          backgroundColor="secondaryBackgroundColor"
          mt="2xl"
          p="m"
        >
          {item.map((value, index) => (
            <ItemCard
              key={index.toString()}
              {...value}
              showBorder={index < item.length - 1}
            />
          ))}
        </Box>
      </Box>
      <EditAvatarBottomSheet ref={editAvatarRef} />
      <EditUsernameBottomSheet ref={editUsernameRef} />
      <EditFirstnameBottomSheet ref={editFirstnameRef} type={type} />
    </PageWrapper>
  );
};

export default EditProfile;
