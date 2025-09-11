import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentPage,
  setCurrentPage,
  resetCurrentPage,
} from "@/state/reducers/currentPage.reducer";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Check, ChevronLeft } from "lucide-react-native";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import CustomButton from "@/components/general/CustomButton";
import { router } from "expo-router";
import BackupCompleteModal from "@/components/Modals/BackupCompleteModal";
import AppBar from "@/components/general/AppBar";

const FirstPage = ({ handleNext }: { handleNext: () => void }) => {
  const theme = useTheme<Theme>();
  const [password, setPassword] = React.useState("");

  const items = [
    "Min. 12 characters",
    "Numbers",
    "Symbols",
    "Mixed Case Letters",
  ];

  return (
    <Box flex={1}>
      <Box flex={1}>
        <CustomText variant="subheader" fontSize={22}>
          Create password
        </CustomText>
        <CustomText variant="body" mt="s" fontSize={14}>
          This password will secure your secret recovery phrase in the cloud. We
          can’t recover it if you lose it, so keep it very safe
        </CustomText>

        <CustomInputWithoutForm
          onChange={(e) => setPassword(e)}
          value={password}
          label=""
          placeholder="Enter you password"
          placeholderTextColor={theme.colors.bodyTextColor}
          isPassword
        />

        <Box height={50} />

        <Box>
          <Box flexDirection="row" justifyContent="space-between">
            <CustomText variant="body" fontSize={12}>
              Password Strength
            </CustomText>
            <CustomText variant="body" fontSize={12}>
              Strong
            </CustomText>
          </Box>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" mt="m">
          {Array.from([1, 2, 3, 4]).map((item, index) => (
            <Box
              key={index}
              width={"23%"}
              height={5}
              borderRadius={5}
              bg={index < 3 ? "primaryColor" : "secondaryBackgroundColor"}
            />
          ))}
        </Box>
        <Box mt="l">
          {items.map((item, index) => (
            <Box flexDirection="row" key={index} mb="s">
              <Check
                color={
                  index < 3
                    ? theme.colors.primaryColor
                    : theme.colors.bodyTextColor
                }
              />
              <CustomText fontSize={12} variant="body" ml="s">
                {item}
              </CustomText>
            </Box>
          ))}
        </Box>
      </Box>

      <Box width="100%" height={100} justifyContent="center">
        <CustomButton
          onPress={handleNext}
          text="Confirm Password"
          bgColor={theme.colors.primaryColor}
          color={theme.colors.bodyTextColor}
          width={"100%"}
          height={56}
          borderRadius={56}
        />
      </Box>
    </Box>
  );
};

const SecondPage = ({ handleNext }: { handleNext: () => void }) => {
  const theme = useTheme<Theme>();
  const [password, setPassword] = React.useState("");

  const items = [
    "Min. 12 characters",
    "Numbers",
    "Symbols",
    "Mixed Case Letters",
  ];

  return (
    <Box flex={1}>
      <Box flex={1}>
        <CustomText variant="subheader" fontSize={22}>
          Confirm password
        </CustomText>
        <CustomText variant="body" mt="s" fontSize={12}>
          Re-enter your password to complete your iCloud backup
        </CustomText>

        <CustomInputWithoutForm
          onChange={(e) => setPassword(e)}
          value={password}
          label=""
          placeholder="Enter Password"
          placeholderTextColor={theme.colors.bodyTextColor}
          isPassword
        />

        <Box flexDirection="row" marginVertical="m" alignItems="center">
          <Check color={theme.colors.success} />
          <CustomText fontSize={12} color="success" ml="s">
            Password Match
          </CustomText>
        </Box>

        <Box height={10} />

        <CustomButton
          onPress={handleNext}
          text="Complete Backup"
          bgColor={theme.colors.primaryColor}
          color={theme.colors.bodyTextColor}
          width={"100%"}
          height={56}
          borderRadius={56}
        />
      </Box>
    </Box>
  );
};

const CreatePasswordPage = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentPage);
  const [currentPage, setPage] = React.useState(1);
  const [showModal, setShowModal] = React.useState(false);

  const handleNext = () => {
    dispatch(resetCurrentPage());
    router.push("/setup");
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
      dispatch(setCurrentPage(currentStep - 1));
    }
  };
  return (
    <Box flex={1} paddingHorizontal="m">
      <BackupCompleteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onContinue={() => router.push("/dashboard/home/wallet-home")}
      />
      <Box width="100%" height={70}>
        <AppBar
          title="ICloud Backup"
          fontSize={16}
          leading={
            <ChevronLeft
              size={25}
              color={theme.colors.bodyTextColor}
              onPress={handleBack}
            />
          }
          trailing={<Box width={50} height={50} />}
          paddingHorizontal={0}
        />
      </Box>
      <Box height={20} />
      {currentPage === 1 && <FirstPage handleNext={() => setPage(2)} />}
      {currentPage === 2 && (
        <SecondPage handleNext={() => setShowModal(true)} />
      )}
    </Box>
  );
};

export default CreatePasswordPage;
