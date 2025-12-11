import { IdentityVerification } from "@/components";
import { Stack } from "expo-router";

const Identity = () => {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Phone Number Verification",
          contentStyle: {
            backgroundColor: "#1f232d",
          },
        }}
      />
      <IdentityVerification />
    </>
  );
};

export default Identity;
