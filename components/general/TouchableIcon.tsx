import React from "react";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function TouchableIcon({
  onPress,
  source,
  height = 20,
  width = 20,
  tintColor,
}: {
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  source?: ImageSourcePropType | undefined;
  height?: number;
  width?: number;
  tintColor?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={source} style={{ height, width }} tintColor={tintColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {},
});
