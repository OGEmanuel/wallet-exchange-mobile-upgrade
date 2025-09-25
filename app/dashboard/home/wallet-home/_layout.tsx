import {
  ThemedCardFilledIcon,
  ThemedCardOutlineIcon,
  ThemedClockFillIcon,
  ThemedSwap1Icon,
  ThemedWalletFilledIcon,
} from "@/assets/svg/wallet-icons-components";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import React from "react";

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
        color={focused ? "tabBarActiveColor" : "bodyTextColor"}
      >
        {label}
      </CustomText>
    </Box>
  );
};

const _layout = () => {
  const theme = useTheme<Theme>();
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.mainBackgroundColor,
          height: 90,
          paddingTop: 20,
        },
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
                      : theme.colors.bodyTextColor
                  }
                  lightModeColor={
                    focused
                      ? theme.colors.tabBarActiveColor
                      : theme.colors.bodyTextColor
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
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="More"
              icon={
                <Image
                  source={require("@/assets/svg/wallet-icons/more.svg")}
                  style={{
                    width: 24,
                    height: 24,
                  }}
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

export default _layout;
