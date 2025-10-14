import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

interface Props {
  onPress: () => void;
  isLoading?: boolean;
}

const SwapButton: React.FC<Props> = ({ onPress, isLoading = false }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation for shake effect
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Repeat the shake animation every 10 seconds
    const interval = setInterval(() => {
      translateY.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isLoading) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isLoading]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle, pulseStyle]}>
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles.button,
            isDark && styles.buttonDark,
            isLoading && styles.buttonLoading,
          ]}
        >
          <Text style={styles.icon}>⇅</Text>
        </TouchableOpacity>
      </Animated.View>
      {isLoading && (
        <View style={styles.loadingTextContainer}>
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Fetching rates...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 2,
    zIndex: 10,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  buttonDark: {
    backgroundColor: '#2F333D',
    borderColor: '#1F232D',
  },
  buttonLoading: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 20,
    transform: [{ rotate: '90deg' }],
  },
  loadingTextContainer: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6D7076',
  },
  loadingTextDark: {
    color: '#A7A7AF',
  },
});

export default SwapButton;

