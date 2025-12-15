import { Theme } from "@/theme";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet } from "react-native";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  isDismissible?: boolean;
  showCloseButton?: boolean;
  onOpened?: () => void;
  onClosed?: () => void;
}

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

export const AppBottomSheet = React.forwardRef<
  BottomSheetRef,
  BottomSheetProps
>(
  (
    {
      isOpen,
      onClose,
      children,
      snapPoints = ["50%", "90%"],
      isDismissible = false,
      showCloseButton = true,
      onOpened,
      onClosed,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { colors } = useTheme<Theme>();

    useEffect(() => {
      if (isOpen) {
        // Use requestAnimationFrame to ensure the ref is ready
        requestAnimationFrame(() => {
          bottomSheetRef.current?.expand();
          onOpened?.();
        });
      } else {
        bottomSheetRef.current?.close();
        onClosed?.();
      }
    }, [isOpen, onOpened, onClosed]);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          // Always allow dismissal when swiped down
          onClose();
          onClosed?.();
        }
      },
      [onClose, onClosed]
    );

    useImperativeHandle(ref, () => ({
      open: () => {
        console.log("AppBottomSheet: open() called");
        bottomSheetRef.current?.expand();
        onOpened?.();
      },
      close: () => {
        console.log("AppBottomSheet: close() called");
        bottomSheetRef.current?.close();
        onClosed?.();
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    // Always render the BottomSheet, but control visibility with index
    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={isOpen ? 0 : -1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <LinearGradient
          colors={[
            colors.primaryColor,
            colors.mainBackgroundColor,
            colors.mainBackgroundColor,
          ]}
          locations={[0, 0.25, 1] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <BottomSheetView style={styles.contentContainer}>
            <Image
              source={require("@/assets/images/zapLogoDark.png")}
              style={{
                height: 40,
                width: 120,
                alignSelf: "center",
                marginTop: 16,
              }}
            />
            {children}
          </BottomSheetView>
          {/* </AnimatedGradientBottomSheet> */}
        </LinearGradient>
      </BottomSheet>
    );
  }
);

AppBottomSheet.displayName = "AppBottomSheet";

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#1f232d",
    flexDirection: "column",
    flex: 1,
  },
  handleIndicator: {
    backgroundColor: "#666",
    padding: 0,
  },
  contentContainer: {
    flexDirection: "column",
    paddingTop: 40,
    paddingBottom: 20,
    gap: 8,
    height: "100%",
  },
  closeButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  closeIconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
  },
  closeIcon: {
    width: 20,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 1,
  },
});
