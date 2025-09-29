import ActivityFilterBottomSheet from "@/components/bottomsheets/ActivityFilterBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { createRef, useCallback } from "react";

// create the ref out side for true singletons
const activityFilterRef: React.RefObject<BottomSheetMethods | null> =
  createRef<BottomSheet>();
const buyActivityRef = createRef<BottomSheet>();
const sentActivityRef = createRef<BottomSheet>();
const recieveActivityRef = createRef<BottomSheet>();
const approvedActivityRef = createRef<BottomSheet>();
const sendTokenRef = createRef<BottomSheet>();
const networkFeeRef = createRef<BottomSheet>();
const confirmSendRef = createRef<BottomSheet>();
const saveAddressRef = createRef<BottomSheet>();
const recieveTokenRef = createRef<BottomSheet>();
const editAvatarRef = createRef<BottomSheet>();
const editUsernameRef = createRef<BottomSheet>();
const editFirstnameRef = createRef<BottomSheet>();

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
    sendTokenRef,
    networkFeeRef,
    confirmSendRef,
    saveAddressRef,
    recieveTokenRef,
    editAvatarRef,
    editUsernameRef,
    editFirstnameRef,
    render,
  };
};

export default useBottomSheetRefs;
