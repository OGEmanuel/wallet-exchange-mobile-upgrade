import React, { ReactNode } from "react";

type IfProps = {
  children: ReactNode;
  condition: boolean;
};

export default function If({ condition, children }: IfProps) {
  return condition ? <>{children}</> : null;
}
