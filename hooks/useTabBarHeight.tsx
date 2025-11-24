// hook to get the height of the tab bar
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useTabBarHeight = () => {
  const [tabBarHeight, setTabBarHeight] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS === "ios") {
      setTabBarHeight(90);
    } else {
      setTabBarHeight(70);
    }
  }, []);

  return { tabBarHeight };
};