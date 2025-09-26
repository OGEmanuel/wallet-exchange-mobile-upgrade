import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppBottomSheet } from '../../hooks/useAppBottomSheet';
import { CustomText } from '../general';

const BottomSheetExample: React.FC = () => {
  const { showBottomSheet, hideAllBottomSheets } = useAppBottomSheet();

  const openFirstBottomSheet = () => {
    showBottomSheet({
      component: (
        <View style={styles.content}>
          <CustomText variant="header" fontSize={24} fontWeight="bold" color="white" textAlign="center" mb="l">
            First Bottom Sheet
          </CustomText>
          <CustomText variant="body" fontSize={16} color="white" textAlign="center" mb="l" style={{ opacity: 0.8 }}>
            This is the first bottomsheet. You can open another one from here!
          </CustomText>
          <TouchableOpacity
            style={styles.button}
            onPress={openSecondBottomSheet}
          >
            <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
              Open Second Bottom Sheet
            </CustomText>
          </TouchableOpacity>
        </View>
      ),
      props: {
        snapPoints: ["60%"],
        title: "First Sheet",
        subtitle: "This can trigger another sheet",
      },
    });
  };

  const openSecondBottomSheet = () => {
    showBottomSheet({
      component: (
        <View style={styles.content}>
          <CustomText variant="header" fontSize={24} fontWeight="bold" color="white" textAlign="center" mb="l">
            Second Bottom Sheet
          </CustomText>
          <CustomText variant="body" fontSize={16} color="white" textAlign="center" mb="l" style={{ opacity: 0.8 }}>
            This is the second bottomsheet opened from the first one!
          </CustomText>
          <TouchableOpacity
            style={styles.button}
            onPress={hideAllBottomSheets}
          >
            <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
              Close All Bottom Sheets
            </CustomText>
          </TouchableOpacity>
        </View>
      ),
      props: {
        snapPoints: ["50%"],
        title: "Second Sheet",
        subtitle: "Nested bottomsheet example",
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={openFirstBottomSheet}
      >
        <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
          Open First Bottom Sheet
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
});

export default BottomSheetExample;
