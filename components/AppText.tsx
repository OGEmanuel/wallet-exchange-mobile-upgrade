import React from "react";
import { Text, TextProps } from "react-native";

export type AppTextProps = TextProps & {
  className?: string;
  children?: React.ReactNode;
};

const AppText: React.FC<AppTextProps> = ({ children, ...rest }) => {
  return <Text {...rest}>{children}</Text>;
};

export default AppText;
