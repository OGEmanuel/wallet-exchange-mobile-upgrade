import { useBottomSheetContext } from '@/src/core/contexts/bottomsheet';
import { BottomSheetItem } from '@/src/core/contexts/bottomsheet/types';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import AppBottomSheet, { AppBottomSheetRef } from './AppBottomSheet';

const BottomSheetManager: React.FC = () => {
  const { getBottomSheets, closeBottomSheet } = useBottomSheetContext();
  const bottomSheets = getBottomSheets();
  const refs = useRef<Map<string, AppBottomSheetRef>>(new Map());

  const handleClose = (id: string) => {
    const ref = refs.current.get(id);
    if (ref) {
      ref.close();
    }
    // Remove from context immediately since AppBottomSheet handles the delay
    refs.current.delete(id);
    closeBottomSheet(id);
  };

  const setRef = (id: string, ref: AppBottomSheetRef | null) => {
    if (ref) {
      refs.current.set(id, ref);
      // Open the bottomsheet when ref is set
      setTimeout(() => {
        ref.open();
      }, 100);
    } else {
      refs.current.delete(id);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {bottomSheets.map((sheet: BottomSheetItem) => (
        <AppBottomSheet
          key={sheet.id}
          ref={ref => setRef(sheet.id, ref)}
          snapPoints={sheet.props?.snapPoints}
          enablePanDownToClose={sheet.props?.enablePanDownToClose}
          showGradientHandle={sheet.props?.showGradientHandle}
          gradientColors={sheet.props?.gradientColors}
          backgroundColor={sheet.props?.backgroundColor}
          title={sheet.props?.title}
          subtitle={sheet.props?.subtitle}
          onClose={() => handleClose(sheet.id)}
        >
          {sheet.component}
        </AppBottomSheet>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

export default BottomSheetManager;
