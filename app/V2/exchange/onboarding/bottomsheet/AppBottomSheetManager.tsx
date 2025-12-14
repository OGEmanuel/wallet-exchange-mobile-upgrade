import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useAppBottomSheetContext } from "./AppBottomSheetContext";
import { AppBottomSheet, BottomSheetRef } from "./BottomSheet";

export const AppBottomSheetManager: React.FC = () => {
  const { getBottomSheets, closeBottomSheet } = useAppBottomSheetContext();
  const bottomSheets = getBottomSheets();
  const refs = useRef<Map<number, BottomSheetRef>>(new Map());

  // Debug: log when bottom sheets change
  React.useEffect(() => {
    console.log("AppBottomSheetManager: bottomSheets changed", bottomSheets.length);
  }, [bottomSheets.length]);

  const handleClose = (id: number) => {
    const ref = refs.current.get(id);
    if (ref) {
      ref.close();
    }
    refs.current.delete(id);
    closeBottomSheet(id);
  };

  const setRef = (id: number, ref: BottomSheetRef | null) => {
    if (ref) {
      refs.current.set(id, ref);
      // Open the bottom sheet when ref is set
      // Use a longer timeout to ensure the component is fully mounted
      setTimeout(() => {
        ref.open();
      }, 200);
    } else {
      refs.current.delete(id);
    }
  };

  // Only show the topmost bottom sheet
  const topSheet = bottomSheets.length > 0 ? bottomSheets[bottomSheets.length - 1] : null;

  if (!topSheet) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <AppBottomSheet
        ref={(ref) => setRef(topSheet.id, ref)}
        isOpen={true}
        onClose={() => handleClose(topSheet.id)}
        snapPoints={topSheet.options?.snapPoints || ["50%", "90%"]}
        isDismissible={topSheet.options?.isDismissible ?? false}
        showCloseButton={topSheet.options?.showCloseButton ?? true}
        onOpened={topSheet.options?.onOpened}
        onClosed={topSheet.options?.onClosed}
      >
        {topSheet.content}
      </AppBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

