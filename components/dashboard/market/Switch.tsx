import { Box } from "@/components/general";
import React from "react";
import { Pressable } from "react-native";

const Switch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => {
  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Box
        width={51}
        height={28}
        borderRadius={14}
        style={{
          paddingHorizontal: 4,
        }}
        flexDirection="row"
        alignItems="center"
        bg={value ? "success" : "disabledTextColor"}
        justifyContent={value ? "flex-end" : "flex-start"}
      >
        <Box
          width={22}
          height={22}
          borderRadius={11}
          bg="white"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
          }}
        />
      </Box>
    </Pressable>
  );
};

export default Switch;
