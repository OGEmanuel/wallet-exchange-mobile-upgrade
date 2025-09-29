import { CoinData } from "@/interfaces/account.interface";
import { SIZES } from "@/lib/utils/screen-sizes";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface NewsCardProps {
  data: {
    source: string;
    date: string;
    title: string;
    sourceInfo: {
      img: string;
    };
    image_url?: string;
  };
  coin: CoinData;
}

export default function NewsCard({ data, coin }: NewsCardProps) {
  console.log("coin", data);

  const navigation = useNavigation<NavigationProp<any>>();
  const { colorScheme } = useColorScheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return {
        time: "Just now",
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    } else if (diffInHours < 24) {
      return {
        time: `${diffInHours}h ago`,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return {
        time: `${diffInDays}d ago`,
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        className="bg-card dark:bg-dark-background border border-cardBorder dark:border-cardBorder rounded-lg p-4 mb-2 flex-row justify-between items-center"
        style={styles.container}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate("ViewNews", { data, coin })}
      >
        <View style={styles.left}>
          <View>
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded bg-placeholder mr-2 overflow-hidden">
                <Image
                  source={{ uri: data?.sourceInfo?.img }}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-text dark:text-dark-text capitalize font-bold">
                {data?.source}
              </Text>
            </View>
          </View>
          <Text
            className="text-text dark:text-dark-text mb-1"
            style={styles.title}
            numberOfLines={2}
          >
            {data?.title}
          </Text>
          <Text
            className="text-placeholder dark:text-placeholder"
            style={styles.info}
          >
            {formatDateTime(data?.date).time} • {formatDateTime(data.date).date}
          </Text>
        </View>
        <View style={styles.box}>
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["#2F333D", "#393C45"]
                : ["#F1F1FF", "#E0E0E0"]
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.box}
          >
            {data?.image_url && (
              <Image
                source={{ uri: data.image_url }}
                style={styles.box}
                resizeMode="cover"
              />
            )}
          </LinearGradient>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZES.width - 32,
    alignSelf: "center",
    marginBottom: 10,
  },
  left: {
    flex: 1,
  },
  title: {
    lineHeight: 21,
    width: SIZES.width - 140,
  },
  info: {
    lineHeight: 15,
    width: 173,
  },
  box: {
    height: 64,
    width: 64,
    borderRadius: 8,
    overflow: "hidden",
  },
});
