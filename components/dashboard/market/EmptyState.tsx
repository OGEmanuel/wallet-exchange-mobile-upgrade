import React from "react";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
} from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";

import { CustomText } from "@/components/general";
import CustomButton from "@/components/general/CustomButton";

const DURATION = 600;
const BASE_DELAY = 100;

interface EmptyStateProps {
  title: string;
  info: string;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
  children?: React.ReactNode;
  source?: ImageSourcePropType | undefined;
  hasNoBtn?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  info,
  onPress,
  children,
  source,
  hasNoBtn,
}) => {
  const glass = require("../../../assets/images/glass.png");

  return (
    <Animated.View
      style={{ alignItems: "center", gap: 8 }}
      entering={FadeInUp.duration(DURATION)
        .easing(Easing.bezierFn(0.16, 1, 0.3, 1))
        .springify()
        .damping(15)}
    >
      <Animated.View
        entering={FadeInUp.delay(BASE_DELAY)
          .duration(DURATION)
          .easing(Easing.bezierFn(0.16, 1, 0.3, 1))}
      >
        <Image
          source={source || glass}
          style={{ maxWidth: 300, maxHeight: 200 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(BASE_DELAY * 2)
          .duration(DURATION)
          .easing(Easing.bezierFn(0.16, 1, 0.3, 1))}
      >
        <CustomText variant="bodySubheader" fontSize={20} color="bodyTextColor">
          {title}
        </CustomText>
      </Animated.View>

      <Animated.View
        style={{ width: "100%", paddingHorizontal: 24 }}
        entering={FadeInUp.delay(BASE_DELAY * 3)
          .duration(DURATION)
          .easing(Easing.bezierFn(0.16, 1, 0.3, 1))}
      >
        <CustomText
          variant="body"
          fontSize={14}
          color="disabledTextColor"
          textAlign="center"
          marginBottom="xl"
          lineHeight={20}
        >
          {info}
        </CustomText>
      </Animated.View>

      {!hasNoBtn && (
        <Animated.View
          entering={FadeInUp.delay(BASE_DELAY * 4)
            .duration(DURATION)
            .easing(Easing.bezierFn(0.16, 1, 0.3, 1))}
        >
          <CustomButton
            text={children?.toString() || "Zap Now"}
            onPress={() => onPress?.({} as GestureResponderEvent)}
            width={133}
            borderRadius={50}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default EmptyState;
