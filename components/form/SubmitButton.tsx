import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { useFormContext } from "react-hook-form";
import { DimensionValue, TouchableOpacity } from "react-native";
import CustomText from "../general/CustomText";

interface IProps {
  onSubmit: (data: any) => void;
  label: string;
  isLoading?: boolean;
  width?: DimensionValue;
}

export const SubmitButton = ({
  onSubmit,
  label,
  isLoading,
  width = "100%",
}: IProps) => {
  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = useFormContext();
  const theme = useTheme<Theme>();

  //disabled={!isDirty || !isValid  ? true: false}
  const handleClick = React.useCallback(() => {
    console.log("clicking....");
    console.log(isLoading);
    if (isLoading) return;
    handleSubmit((data) => console.log(data));
  }, [isLoading]);

  return (
    <>
      <TouchableOpacity
        onPress={isLoading ? () => {} : handleSubmit(onSubmit)}
        style={{
          width,
          height: 48,
          backgroundColor: theme.colors.primaryColor,
          opacity: !isDirty || !isValid ? 0.6 : 1,
          borderRadius: 48,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CustomText
          variant="body"
          fontSize={14}
          style={{
            color: "#FFFFFF",
          }}
        >
          {isLoading ? "submitting..." : label}
        </CustomText>
      </TouchableOpacity>
    </>
  );
};
