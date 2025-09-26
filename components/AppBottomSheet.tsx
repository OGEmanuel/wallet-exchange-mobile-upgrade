
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import AnimatedGradientBottomSheet, {
  AnimatedGradientBottomSheetRef,
} from './bottomsheets/AnimatedGradientBottomSheet';

export interface AppBottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

interface AppBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  showGradientHandle?: boolean;
  gradientColors?: string[];
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}

const AppBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
  (
    {
      children,
      snapPoints = ["100%"],
      enablePanDownToClose = true,
      showGradientHandle = true,
      gradientColors,
      backgroundColor = "rgba(0,0,0,0.5)",
      title,
      subtitle,
      onClose,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);
    const bgGradientColors = gradientColors || [
      "#393181", // Purple at the start
      "#1f232d", // Dark purple transition
      "#1f232d"  // Dark at the end
    ];

    const handleClose = useCallback(() => {
      // Delay the onClose callback to allow animation to complete
      setTimeout(() => {
        onClose?.();
      }, 350);
    }, [onClose]);

    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.open();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    return (
      <AnimatedGradientBottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        showGradientHandle={showGradientHandle}
        gradientColors={bgGradientColors}
        backgroundColor={backgroundColor}
        title={title}
        subtitle={subtitle}
        onClose={handleClose}
        locations={[0.01, 1, 0.35, 1]}
      >
        {children}
      </AnimatedGradientBottomSheet>
    );
  }
);

AppBottomSheet.displayName = 'AppBottomSheet';

export default AppBottomSheet;
