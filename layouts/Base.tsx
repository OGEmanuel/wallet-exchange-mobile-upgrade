import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, View } from "react-native";

interface BaseProps {
  title?: string;
  canGoBack?: boolean;
  onBackPress?: () => void;
  children?: React.ReactNode;
}

const Base: React.FC<BaseProps> = ({
  title,
  canGoBack = false,
  onBackPress,
  children,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {(title || canGoBack) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 12,
            }}
          >
            {canGoBack && (
              <Pressable onPress={handleBack} hitSlop={12}>
                <AppText style={{ fontSize: 18 }}>×</AppText>
              </Pressable>
            )}
            {title && (
              <AppText style={{ fontSize: 16, fontWeight: "600" }}>
                {title}
              </AppText>
            )}
          </View>
        )}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

export default Base;
