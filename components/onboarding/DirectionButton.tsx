import icons from "@/assets/icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import If from "../general/If";
import ThemedText from "../general/ThemedText";

type DirectionButtonProp = {
  onPress?:
    | ((event: GestureResponderEvent) => Promise<void>)
    | null
    | undefined;
  style?: StyleProp<ViewStyle>;
  title?: string;
  color?: string;
  size?: number;
  loading?: boolean;
};

export default function DirectionButton({
  onPress,
  style = {},
  title,
  color = "#fff",
  size = 20,
  loading = false,
}: DirectionButtonProp) {
  const navigation = useNavigation<NavigationProp<any>>();
  const inset = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: 30 + inset?.bottom }, style]}
      onPress={async (e) => {
        if (onPress) {
          await onPress(e);
        } else {
          navigation.reset({
            index: 0, // The active route index (0 for the first route)
            routes: [
              {
                name: "NameWallet",
              },
            ],
          });
        }
      }}
    >
      <If condition={size > 16}>
        <View style={{ ...styles.icon, height: size, width: size }} />
      </If>
      <If condition={loading}>
        <ActivityIndicator size={"small"} color={color} />
      </If>
      <If condition={!loading}>
        <ThemedText type="default" color={color || "#FBFBFB"}>
          {title || "Get Started"}
        </ThemedText>
      </If>
      <Image
        source={icons.arrowRight}
        style={{
          ...styles.icon,
          height: size,
          width: size,
          tintColor: color,
        }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: 180,
    alignSelf: "center",
    backgroundColor: "#FBFBFB",
    borderRadius: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "absolute",
  },
  icon: {
    width: 20,
    height: 20,
  },
});
