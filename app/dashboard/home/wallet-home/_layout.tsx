import {
  ThemedCardFilledIcon,
  ThemedCardOutlineIcon,
  ThemedClockFillIcon,
  ThemedSwap1Icon,
  ThemedWalletFilledIcon,
} from "@/assets/svg/wallet-icons-components";
import ThemedMoreIcon from "@/assets/svg/wallet-icons-components/ThemedMoreIcon";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
const OS = Platform.OS;

const TabBarIcon = ({
  focused,
  label,
  icon,
  activeIcon = null,
}: {
  focused: boolean;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}) => {
  return (
    <Box width={70} alignItems="center" justifyContent="center">
      {focused && activeIcon && activeIcon}
      {!focused && icon}
      {focused && !activeIcon && icon}
      <CustomText
        variant="body"
        fontSize={10}
        color={focused ? "tabBarActiveColor" : "inActiveBtnColor"}
      >
        {label}
      </CustomText>
    </Box>
  );
};

const Layout = () => {
  const theme = useTheme<Theme>();
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(19, 23, 34, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          height: OS === "ios" ? 90 : 70,
          paddingTop: 20,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          backdropFilter: "blur(20px)",
        },
        tabBarInactiveTintColor: theme.colors.inActiveBtnColor,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Home"
              icon={
                <ThemedWalletFilledIcon
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                />
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Cards"
              activeIcon={
                <ThemedCardFilledIcon
                  width={24}
                  height={24}
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                />
              }
              icon={
                <ThemedCardOutlineIcon
                  width={24}
                  height={24}
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                />
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />

      <Tabs.Screen
        name="exchange"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Swap"
              icon={
                <ThemedSwap1Icon
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                />
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />

      <Tabs.Screen
        name="swap"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Swap"
              icon={
                <ThemedSwap1Icon
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.bodyTextColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.bodyTextColor
                  }
                />
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Activity"
              icon={
                <ThemedClockFillIcon
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                />
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="More"
              icon={
                <ThemedMoreIcon
                  width={24}
                  height={24}
                  darkModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.inActiveBtnColor
                  }
                />
              }
            />
          ),
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
};

export default Layout;
