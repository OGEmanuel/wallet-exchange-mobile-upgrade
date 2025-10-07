import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomButton, CustomText } from "@/components/general";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { IUpdateUserDetailsParams } from "@/src/modules/settings/domain/entities/params/update-user-details-params";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { kycActions, selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const EditFirstnameBottomSheet = forwardRef<
  BottomSheet,
  { type: "firstname" | "lastname" | "phone" }
>((props, ref) => {
  const { type } = props;
  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = React.useState(false);
  const [value, setValue] = React.useState("");

  const { updateUser } = useSettings();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (type === "firstname") {
      setValue(user?.firstName || "");
    } else if (type === "lastname") {
      setValue(user?.lastName || "");
    } else if (type === "phone") {
      setValue(user?.phone || "");
    }
  }, [type, user]);

  const handleUpdateUser = useCallback(async () => {
    try {
      if (value === "") {
        alert(`Your ${type} is required`);
        return;
      }

      const payload: Partial<IUpdateUserDetailsParams> = {};
      if (type === "firstname") {
        payload.firstName = value;
      } else if (type === "lastname") {
        payload.lastName = value;
      } else if (type === "phone") {
        payload.phone = value;
      }
      setIsLoading(true);
      const response = await updateUser(payload, user as UserModel);
      dispatch(kycActions.setUser(response.data as UserModel));
      console.log(response.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [updateUser, user]);

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
      snapPoints={["80%", "60%"]}
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
          paddingHorizontal: 0,
          paddingTop: 20,
        }}
      >
        <SettingsHeader title={`Change ${type}`} onBackPress={() => {}} />
        <Box paddingHorizontal="m" mt="m" width={"100%"} flex={1}>
          <CustomText fontSize={14} mb="m">
            Set your {type}
          </CustomText>

          <CustomInputWithoutForm value={value} onChange={(e) => setValue(e)} />
          <CustomText fontSize={12} mt="s" mb="l">
            15 characters maximium
          </CustomText>

          <CustomButton
            text={type === "phone" ? "Set phone" : "Set name"}
            isLoading={isLoading}
            onPress={() => handleUpdateUser()}
            width={"100%"}
            borderRadius={50}
            disabled={value === ""}
            disabledColor={theme.colors.disabledTextColor}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default EditFirstnameBottomSheet;
