/**
 * Example App.tsx showing how to integrate the SwapScreen
 * 
 * This is a standalone example that you can use as a reference
 * when integrating into your existing React Native app.
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store';
import SwapScreen from './screens/SwapScreen';

function App(): JSX.Element {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <SwapScreen
          defaultTokenSymbol="BTC"
          onSwapComplete={(data) => {
            console.log('Swap completed:', data);
            // Handle swap completion - make API calls, navigate, etc.
          }}
        />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#131722',
  },
});

export default App;

