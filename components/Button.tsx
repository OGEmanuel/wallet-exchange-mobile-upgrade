import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

export type ButtonProps = TouchableOpacityProps & {
  className?: string;
  children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} {...rest}>
      {children}
    </TouchableOpacity>
  );
};

export default Button;
