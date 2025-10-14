import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ViewStyle } from 'react-native';
import Box from './Box';
import CustomButton from './CustomButton';
import CustomText from './CustomText';
import ZapLoader from './ZapLoader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoaderWrapperProps {
  /**
   * Whether the component is in a loading state
   */
  isLoading: boolean;

  /**
   * Whether the component encountered an error
   */
  isError: boolean;

  /**
   * Error message to display when isError is true
   */
  errorMessage?: string | null;

  /**
   * Whether the loading/error state should cover the full screen
   */
  fullScreen?: boolean;

  /**
   * Optional custom loader component
   */
  customLoader?: React.ReactNode;

  /**
   * Optional custom error component
   */
  customError?: React.ReactNode;

  /**
   * Children to render when not loading and no error
   */
  children: React.ReactNode;

  /**
   * Optional callback for retry action when error occurs
   */
  onRetry?: () => void;

  /**
   * Whether to keep content mounted during loading/error states
   * @default true
   */
  keepContentMounted?: boolean;

  /**
   * Animation duration in milliseconds
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Whether authentication is required to view the content
   * @default false
   */
  requiresAuth?: boolean;

  /**
   * Whether to allow guest users to view the content
   * When true, guest users can view content without being required to authenticate
   * @default false
   */
  allowGuests?: boolean;

  /**
   * Custom message to show when authentication is required
   */
  authRequiredMessage?: string;

  /**
   * Optional className to apply to the container.
   * These classes will be merged with the default classes.
   * This allows for customization while maintaining the component's base styling.
   * 
   * To override default styles, use the !important modifier or stronger selectors.
   * Example: "!min-h-20" will override the default min-height.
   * 
   * @default ""
   */
  className?: string;

  /**
   * Optional empty state component to show when data is empty
   */
  emptyComponent?: React.ReactNode;

  /**
   * Whether the current data state is empty
   * @default false
   */
  isEmpty?: boolean | null;

  /**
   * Data that, if present, should prevent loading state from showing
   * This allows the wrapper to intelligently handle loading states when data is already available
   */
  existingData?: unknown;

  /**
   * Animation type for content transitions
   * @default 'fade'
   */
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce';
}

const LoaderWrapper: React.FC<LoaderWrapperProps> = ({
  isLoading,
  isError,
  errorMessage = 'Something went wrong. Please try again.',
  fullScreen = false,
  customLoader,
  customError,
  children,
  onRetry,
  keepContentMounted = true,
  transitionDuration = 300,
  requiresAuth = false,
  allowGuests = false,
  authRequiredMessage = 'Authentication is required to view this content.',
  className = '',
  emptyComponent,
  isEmpty = false,
  existingData,
  animationType = 'fade',
}) => {
  const theme = useTheme<Theme>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Check if we should show loading state
  const shouldShowLoading = isLoading && !existingData;
  
  // Check if we should show error state
  const shouldShowError = isError && !existingData;
  
  // Check if we should show empty state
  const shouldShowEmpty = isEmpty && !isLoading && !isError && !existingData;

  // Check authentication requirement
  const needsAuth = requiresAuth && !allowGuests;
  // Note: In a real implementation, you would check actual auth state here
  // For now, we'll assume user is authenticated if not explicitly requiring auth
  const isAuthenticated = !needsAuth;

  useEffect(() => {
    if (shouldShowLoading || shouldShowError || shouldShowEmpty || !isAuthenticated) {
      // Animate out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: transitionDuration,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate in based on animation type
      const animations = [];
      
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: transitionDuration,
          useNativeDriver: true,
        })
      );

      switch (animationType) {
        case 'slide':
          animations.push(
            Animated.timing(slideAnim, {
              toValue: 1,
              duration: transitionDuration,
              useNativeDriver: true,
            })
          );
          break;
        case 'scale':
          animations.push(
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: transitionDuration,
              useNativeDriver: true,
            })
          );
          break;
        case 'bounce':
          animations.push(
            Animated.sequence([
              Animated.timing(bounceAnim, {
                toValue: 1.1,
                duration: transitionDuration * 0.6,
                useNativeDriver: true,
              }),
              Animated.timing(bounceAnim, {
                toValue: 1,
                duration: transitionDuration * 0.4,
                useNativeDriver: true,
              }),
            ])
          );
          break;
      }

      Animated.parallel(animations).start();
    }
  }, [shouldShowLoading, shouldShowError, shouldShowEmpty, isAuthenticated, animationType, transitionDuration]);

  const getAnimatedStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      opacity: fadeAnim,
    };

    switch (animationType) {
      case 'slide':
        return {
          ...baseStyle,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'scale':
        return {
          ...baseStyle,
          transform: [
            {
              scale: scaleAnim,
            },
          ],
        };
      case 'bounce':
        return {
          ...baseStyle,
          transform: [
            {
              scale: bounceAnim,
            },
          ],
        };
      default:
        return baseStyle;
    }
  };

  const renderLoader = () => {
    if (customLoader) {
      return customLoader;
    }

    return (
      <ZapLoader 
        size={100}
        text="Loading..."
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: theme.spacing.l,
          ...(fullScreen ? { minHeight: screenHeight } : {})
        }}
      />
    );
  };

  const renderError = () => {
    if (customError) {
      return customError;
    }

    return (
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="l"
        style={fullScreen ? { minHeight: screenHeight } : {}}
      >
        <CustomText
          variant="bodySubheader"
          fontSize={18}
          textAlign="center"
          marginBottom="s"
          color="bodyTextColor"
        >
          Oops! Something went wrong
        </CustomText>

        <CustomText
          variant="body"
          fontSize={14}
          textAlign="center"
          color="disabledTextColor"
          marginBottom="l"
        >
          {errorMessage}
        </CustomText>

        {onRetry && (
          <CustomButton
            text="Try Again"
            onPress={onRetry}
            // width="auto"
            // height={48}
            paddingHorizontal={16}
            paddingVertical={8}
            borderRadius={8}
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
          />
        )}
      </Box>
    );
  };

  const renderEmpty = () => {
    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="l"
        style={fullScreen ? { minHeight: screenHeight } : {}}
      >
        <CustomText
          variant="bodySubheader"
          fontSize={18}
          textAlign="center"
          marginBottom="s"
          color="bodyTextColor"
        >
          No data available
        </CustomText>

        <CustomText
          variant="body"
          fontSize={14}
          textAlign="center"
          color="disabledTextColor"
        >
          There&apos;s nothing to show here yet.
        </CustomText>
      </Box>
    );
  };

  const renderAuthRequired = () => (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="l"
      style={fullScreen ? { minHeight: screenHeight } : {}}
    >
      <CustomText
        variant="bodySubheader"
        fontSize={18}
        textAlign="center"
        marginBottom="s"
        color="bodyTextColor"
      >
        Authentication Required
      </CustomText>

      <CustomText
        variant="body"
        fontSize={14}
        textAlign="center"
        color="disabledTextColor"
        marginBottom="l"
      >
        {authRequiredMessage}
      </CustomText>

      <CustomButton
        text="Sign In"
        onPress={() => {
          // In a real implementation, navigate to login screen
          console.log('Navigate to login');
        }}
        width="auto"
        height={48}
        paddingHorizontal={24}
        paddingVertical={12}
        borderRadius={8}
        bgColor={theme.colors.primaryColor}
        color={theme.colors.white}
      />
    </Box>
  );

  const renderContent = () => {
    if (!isAuthenticated) {
      return renderAuthRequired();
    }

    if (shouldShowLoading) {
      return renderLoader();
    }

    if (shouldShowError) {
      return renderError();
    }

    if (shouldShowEmpty) {
      return renderEmpty();
    }

    return null;
  };

  return (
    <Box flex={1} className={className}>
      {renderContent()}
      
      {keepContentMounted && !shouldShowLoading && !shouldShowError && !shouldShowEmpty && isAuthenticated && (
        <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
          {children}
        </Animated.View>
      )}
      
      {!keepContentMounted && !shouldShowLoading && !shouldShowError && !shouldShowEmpty && isAuthenticated && (
        <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
          {children}
        </Animated.View>
      )}
    </Box>
  );
};

export default LoaderWrapper;
