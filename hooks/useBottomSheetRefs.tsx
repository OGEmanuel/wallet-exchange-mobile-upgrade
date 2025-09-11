import { View, Text } from "react-native";
import React, { createRef, useCallback, useMemo } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";

// create the ref out side for true singletons
const activityFilterRef: React.RefObject<BottomSheetMethods | null> =
  createRef<BottomSheet>();
const buyActivityRef = createRef<BottomSheet>();
const sentActivityRef = createRef<BottomSheet>();
const recieveActivityRef = createRef<BottomSheet>();
const approvedActivityRef = createRef<BottomSheet>();

const useBottomSheetRefs = () => {
  // render method for global bottomsheet
  const render = useCallback(() => {
    return (
      <>
        {/* BOTTOM SHEET */}
        <ActivityFilterBottomSheet ref={activityFilterRef} />
      </>
    );
  }, []);
  return {
    activityFilterRef,
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
    render,
  };
};

export default useBottomSheetRefs;
