import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppBottomSheet } from '../../hooks/useAppBottomSheet';
import { CustomText } from '../general';

const BottomSheetTest: React.FC = () => {
  const { showBottomSheet, hideAllBottomSheets } = useAppBottomSheet();

  const openTestBottomSheet = () => {
    const id = showBottomSheet({
      component: (
        <View style={styles.content}>
          <CustomText variant="header" fontSize={24} fontWeight="bold" color="white" textAlign="center" mb="l">
            Test Bottom Sheet
          </CustomText>
          <CustomText variant="body" fontSize={16} color="white" textAlign="center" mb="l" style={{ opacity: 0.8 }}>
            This is a test bottomsheet. Try opening another one!
          </CustomText>
          <TouchableOpacity
            style={styles.button}
            onPress={openSecondBottomSheet}
          >
            <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
              Open Second Bottom Sheet
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'rgba(255,0,0,0.3)' }]}
            onPress={hideAllBottomSheets}
          >
            <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
              Close All
            </CustomText>
          </TouchableOpacity>
        </View>
      ),
      props: {
        snapPoints: ["60%"],
        title: "Test Sheet",
        subtitle: "Testing the bottomsheet system",
      },
    });
    
    console.log('Opened bottomsheet with ID:', id);
  };

  const openSecondBottomSheet = () => {
    const id = showBottomSheet({
      component: (
        <View style={styles.content}>
          <CustomText variant="header" fontSize={24} fontWeight="bold" color="white" textAlign="center" mb="l">
            Second Bottom Sheet
          </CustomText>
          <CustomText variant="body" fontSize={16} color="white" textAlign="center" mb="l" style={{ opacity: 0.8 }}>
            This is the second bottomsheet! The first one should still be visible behind this one.
          </CustomText>
          <TouchableOpacity
            style={styles.button}
            onPress={openThirdBottomSheet}
          >
            <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
              Open Third Bottom Sheet
            </CustomText>
          </TouchableOpacity>
        </View>
      ),
      props: {
        snapPoints: ["50%"],
        title: "Second Sheet",
        subtitle: "Nested bottomsheet",
      },
    });
    
    console.log('Opened second bottomsheet with ID:', id);
  };

  const openThirdBottomSheet = () => {
    const id = showBottomSheet({
      component: (
        <View style={styles.content}>
          <CustomText variant="header" fontSize={24} fontWeight="bold" color="white" textAlign="center" mb="l">
            Third Bottom Sheet
          </CustomText>
          <CustomText variant="body" fontSize={16} color="white" textAlign="center" mb="l" style={{ opacity: 0.8 }}>
            This is the third bottomsheet! You should see all three stacked.
          </CustomText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'rgba(0,255,0,0.3)' }]}
            onPress={() => {
              Alert.alert('Success!', 'The bottomsheet system is working correctly!');
              hideAllBottomSheets();
            }}
          >
            <CustomText variant="body" fontSize={16} fontWeight="bold" color="white" textAlign="center">
              Test Complete!
            </CustomText>
          </TouchableOpacity>
        </View>
      ),
      props: {
        snapPoints: ["40%"],
        title: "Third Sheet",
        subtitle: "Final test",
      },
    });
    
    console.log('Opened third bottomsheet with ID:', id);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={openTestBottomSheet}
      >
        <CustomText variant="body" fontSize={18} fontWeight="bold" color="white" textAlign="center">
          Test Bottom Sheet System
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
  mainButton: {
    backgroundColor: '#6045FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
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

export default BottomSheetTest;
