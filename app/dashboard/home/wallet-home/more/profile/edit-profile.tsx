import EditAvatarBottomSheet from "@/components/bottomsheets/preference/EditAvatarBottomSheet";
import EditFirstnameBottomSheet from "@/components/bottomsheets/preference/EditFirstnameBottomSheet";
import EditUsernameBottomSheet from "@/components/bottomsheets/preference/EditUsernameBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { selectWalletUser } from "@/state/reducers/wallet.reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import { User } from "iconsax-react-nativejs";
import { CheckCircle, ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { useSelector } from "react-redux";

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
  const theme = useTheme<Theme>();
  const user = useSelector(selectWalletUser);

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
      value: user?.username || "",
      onPress: () => {
        editUsernameRef.current?.snapToIndex(1);
      },
    },
    {
      title: "First name",
      value: user?.firstName || "",
      onPress: () => {
        setType("firstname");
        editFirstnameRef.current?.snapToIndex(1);
      },
    },
    {
      title: "Last name",
      value: user?.lastName || "",
      onPress: () => {
        setType("lastname");
        editFirstnameRef.current?.snapToIndex(1);
      },
    },
    {
      title: "Phone number",
      value: user?.phone || "",
      onPress: () => {
        setType("phone");
        editFirstnameRef.current?.snapToIndex(1);
      },
    },
  ];
  return (
    <PageWrapper>
      <SettingsHeader
        title="Account Information"
        onBackPress={() => router.back()}
      />
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        <Box width={"100%"} height={"auto"} alignItems="center" mt="l">
          <Box
            width={60}
            height={60}
            borderRadius={30}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor:
                user?.avatar?.backgroundColor || theme.colors.fadedPrimaryColor,
            }}
          >
            {user?.avatar?.url && (
              <Image
                source={{ uri: user?.avatar?.url }}
                style={{ width: "100%", height: "100%", borderRadius: 30 }}
              />
            )}
            {!user?.avatar?.url && (
              <User
                size={50}
                color={theme.colors.bodyTextColor}
                variant="Bold"
              />
            )}
          </Box>
          <CustomText
            textAlign="center"
            mt="m"
            color="tabBarActiveColor"
            fontSize={14}
            onPress={() => editAvatarRef.current?.snapToIndex(1)}
          >
            Change avatar
          </CustomText>
          Cus
        </Box>

        <Box mt="l" width={"100%"}>
          <CustomInputWithoutForm
            value={user?.username as string}
            onChange={() => {}}
            label="Username"
          />

          <Box
            width={"100%"}
            flexDirection="row"
            mt="m"
            justifyContent="space-between"
          >
            <Box width={"47%"}>
              <CustomInputWithoutForm
                value={user?.firstName as string}
                onChange={() => {}}
                label="First name"
              />
            </Box>

            <Box width={"47%"}>
              <CustomInputWithoutForm
                value={user?.lastName as string}
                onChange={() => {}}
                label="Last name"
              />
            </Box>
          </Box>

          <Box
            width={"100%"}
            height={50}
            p="s"
            mt="m"
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
          >
            <Box
              width={"100%"}
              height={"100%"}
              borderLeftWidth={2}
              borderLeftColor="tabBarActiveColor"
              px="s"
              justifyContent="center"
              flexWrap="wrap"
            >
              <CustomText>
                Your first and last name will be retrived from your BVN and
                government ID
              </CustomText>
            </Box>
          </Box>

          <Box width={"100%"} mt="m">
            <CustomInputWithoutForm
              value={user?.email as string}
              onChange={() => {}}
              label="Email"
            />
          </Box>

          <Box width={"100%"} mt="m">
            <CustomInputWithoutForm
              value={user?.phone as string}
              onChange={() => {}}
              label="Phone"
              iconRight={
                <CheckCircle size={20} color={theme.colors.primaryColor} />
              }
            />
          </Box>

          <Box mt="2xl">
            <CustomButton
              width={"100%"}
              borderRadius={50}
              text="Save Changes"
              onPress={() => {}}
            />
          </Box>
        </Box>
      </Box>
      <EditAvatarBottomSheet ref={editAvatarRef} />
      <EditUsernameBottomSheet ref={editUsernameRef} />
      <EditFirstnameBottomSheet ref={editFirstnameRef} type={type} />
    </PageWrapper>
  );
};

export default EditProfile;
