import KYCIcon from "@/assets/svg/wallet-icons-components/kyc-icon";
import CustomLink from "@/components/custom-link";
import HeaderText from "@/components/kyc/v2/header-text";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

const Verify = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleGetStarted = () => {
    router.push("/(modal)/kyc-v2/verify-phone");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "ID Verification",
          headerLeft: () => (
            <Pressable
              onPress={handleBack}
              style={{
                marginRight: 16,
              }}
            >
              <ArrowLeft />
            </Pressable>
          ),
          contentStyle: {
            backgroundColor: "#1f232d",
          },
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <HeaderText>Verify Your Identity</HeaderText>
          <View>
            <KYCIcon />
          </View>
          <Text style={styles.desc}>
            To conduct swaps on Zap, you will need to complete KYC with BVN and
            government ID
          </Text>
        </View>
        <CustomLink onPress={handleGetStarted} label="Get Started" />
      </View>
    </>
  );
};

export default Verify;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  desc: {
    lineHeight: 24,
    textAlign: "center",
    marginTop: 24,
    fontWeight: 500,
    color: "#FFFFFF",
  },
});
