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
}: {
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  source?: ImageSourcePropType | undefined;
  height?: number;
  width?: number;
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image source={source} style={{ height, width }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {},
});
