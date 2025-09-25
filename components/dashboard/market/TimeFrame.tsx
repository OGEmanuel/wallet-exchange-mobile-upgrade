import React from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

type TimeFrameProps = {
  active: boolean;
  range: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  disabled?: boolean;
};

export default function TimeFrame({
  active,
  range,
  onPress,
  disabled = false,
}: TimeFrameProps) {
  return (
    <TouchableOpacity
      className={`px-[8px] py-[4px] rounded-md self-start ${
        active ? "bg-swapBg text-red" : disabled ? "bg-[#F9F9F9]" : "bg-base"
      }`}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Text
        className={`text-xs text-md font-medium ${
          active ? "text-dark-text" : "text-text"
        }`}
      >
        {range}
      </Text>
    </TouchableOpacity>
  );
}
