// import {
//   Box,
//   CustomButton,
//   CustomText,
//   PageWrapper,
// } from "@/components/general";
// import { Theme } from "@/theme";
// import { useTheme } from "@shopify/restyle";
// import { router } from "expo-router";
// import { ChevronLeft } from "lucide-react-native";
// import React from "react";

// const DeleteAccount = () => {
//   const theme = useTheme<Theme>();
//   return (
//     <PageWrapper>
//       <Box
//         width={"100%"}
//         height={50}
//         borderBottomColor="borderColor"
//         borderBottomWidth={1}
//         alignItems="center"
//         justifyContent="space-between"
//         flexDirection="row"
//         paddingHorizontal="m"
//       >
//         <ChevronLeft
//           size={25}
//           color={theme.colors.bodyTextColor}
//           onPress={() => router.back()}
//         />
//         <CustomText variant="medium">Delete Account</CustomText>
//         <Box />
//       </Box>

//       <Box padding="m" gap="l">
//         <CustomText variant="subheader">
//           Mind sharing why you're creating this request
//         </CustomText>

//         <Box
//           backgroundColor="modalBackgroundColor"
//           borderRadius={10}
//           p="m"
//           mb="2xl"
//         >
//           <CustomText color="bodyTextColor">
//             I don't want to use Zap anymore
//           </CustomText>
//           <CustomText color="bodyTextColor">
//             The app is not working properly
//           </CustomText>
//           <CustomText color="bodyTextColor">
//             I no longer use this service
//           </CustomText>
//           <CustomText color="bodyTextColor">
//             I'm worried about my data
//           </CustomText>
//           <CustomText color="bodyTextColor">Performance</CustomText>
//         </Box>

//         <CustomButton
//           width={"100%"}
//           borderRadius={50}
//           bgColor={theme.colors.primaryColor}
//           text="Next"
//           onPress={() => {}}
//         />
//       </Box>
//     </PageWrapper>
//   );
// };

// export default DeleteAccount;

import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";

interface ReasonOption {
  id: string;
  label: string;
  selected: boolean;
}

const DeleteAccount = () => {
  const theme = useTheme<Theme>();
  const [selectedReasons, setSelectedReasons] = useState<ReasonOption[]>([
    { id: "1", label: "I don't want to use Zap anymore", selected: false },
    { id: "2", label: "The app is not working properly", selected: false },
    { id: "3", label: "I no longer use this service", selected: false },
    { id: "4", label: "I'm worried about my data", selected: false },
    { id: "5", label: "Performance", selected: false },
  ]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const selectReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.map((reason) => ({
        ...reason,
        selected: reason.id === id,
      }))
    );
  };

  const handleNext = () => {
    const hasSelectedReason = selectedReasons.some((reason) => reason.selected);
    if (hasSelectedReason) {
      setShowConfirmationModal(true);
    }
  };

  const handleDeleteAccount = () => {
    const selectedReason = selectedReasons.find((reason) => reason.selected);
    console.log("Deleting account with reason:", selectedReason?.label);
    setShowConfirmationModal(false);
  };

  const handleKeepAccount = () => {
    setShowConfirmationModal(false);
  };

  const selectedReasonsCount = selectedReasons.filter(
    (reason) => reason.selected
  ).length;

  const styles = createStyles(theme);

  return (
    <PageWrapper>
      <Box
        width={"100%"}
        height={50}
        borderBottomColor="borderColor"
        borderBottomWidth={1}
        alignItems="center"
        justifyContent="space-between"
        flexDirection="row"
        paddingHorizontal="m"
      >
        <ChevronLeft
          size={25}
          color={theme.colors.bodyTextColor}
          onPress={() => router.back()}
        />
        <CustomText variant="medium">Delete Account</CustomText>
        <Box />
      </Box>

      <Box padding="m" gap="l" flex={1}>
        <CustomText variant="subheader">
          Mind sharing why you're creating this request?
        </CustomText>

        <Box
          backgroundColor="modalBackgroundColor"
          borderRadius={15}
          p="m"
          mb="l"
        >
          {selectedReasons.map((reason) => (
            <Pressable
              key={reason.id}
              onPress={() => selectReason(reason.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
              }}
            >
              <Box
                width={20}
                height={20}
                borderRadius={5}
                borderWidth={2}
                borderColor={reason.selected ? "primaryColor" : "bodyTextColor"}
                justifyContent="center"
                alignItems="center"
                marginRight="m"
              >
                {reason.selected && (
                  <Check
                    size={12}
                    color={
                      reason.selected
                        ? theme.colors.primaryColor
                        : theme.colors.bodyTextColor
                    }
                    onPress={() => router.back()}
                  />
                )}
              </Box>

              <CustomText color="bodyTextColor">{reason.label}</CustomText>
            </Pressable>
          ))}
        </Box>

        <Box marginTop="m" marginBottom="m">
          <CustomButton
            width={"100%"}
            borderRadius={50}
            bgColor={theme.colors.primaryColor}
            text="Next"
            onPress={handleNext}
            disabled={selectedReasonsCount === 0}
          />
        </Box>
      </Box>

      {showConfirmationModal && (
        <Modal
          visible={showConfirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowConfirmationModal(!showConfirmationModal)
          }
        >
          <Pressable style={styles.overlay}>
            <Pressable
              style={styles.modal}
              onPress={(e) => e.stopPropagation()}
            >
              <CustomText variant="subheader" marginBottom="m">
                Delete Account?{" "}
              </CustomText>

              <CustomText
                variant="body"
                marginBottom="xl"
                color="bodyTextColor"
              >
                Are you sure you want to permanently delete your account? Once
                completed this action is irreversible and cannot be undone
              </CustomText>

              <Box gap="m">
                <CustomButton
                  width={"100%"}
                  borderRadius={50}
                  bgColor={theme.colors.error}
                  text="Delete my account"
                  onPress={handleDeleteAccount}
                />

                <CustomButton
                  width={"100%"}
                  borderRadius={50}
                  bgColor={theme.colors.secondaryBackgroundColor}
                  text="Keep my account"
                  color={theme.colors.bodyTextColor}
                  onPress={handleKeepAccount}
                />
              </Box>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </PageWrapper>
  );
};

export default DeleteAccount;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(31, 35, 45, 0.8)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: theme.colors.mainBackgroundColor,
      borderRadius: 20,
      marginHorizontal: 20,
      maxWidth: 400,
      width: "100%",
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
  });
