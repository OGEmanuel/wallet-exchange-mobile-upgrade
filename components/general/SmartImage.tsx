/**
 * SmartImage Component - Intelligently chooses the right image component based on URL
 * 
 * This component automatically detects whether an image URL is an SVG or regular image
 * and uses the appropriate component:
 * - SvgUri from react-native-svg for SVG images
 * - Image from expo-image for regular images (PNG, JPG, etc.)
 * 
 * Features:
 * - Automatic format detection by URL extension
 * - Fallback handling for errors
 * - Supports all common Image props
 * - Handles both remote URLs and local require() sources
 */

import { ImageProps as ExpoImageProps, Image, ImageContentFit } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';

export interface SmartImageProps {
  /**
   * Image source - can be a URL string, URI object, or require() source
   */
  source: string | { uri: string } | number | { uri: string; [key: string]: any };
  
  /**
   * Width of the image
   */
  width?: number;
  
  /**
   * Height of the image
   */
  height?: number;
  
  /**
   * Style object for the container/image
   */
  style?: ViewStyle | ViewStyle[];
  
  /**
   * Resize mode for non-SVG images (maps to expo-image's contentFit)
   */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  
  /**
   * Border radius for rounded images
   */
  borderRadius?: number;
  
  /**
   * Called when image loads successfully
   */
  onLoad?: () => void;
  
  /**
   * Called when image fails to load
   */
  onError?: (error: any) => void;
  
  /**
   * Called when image starts loading
   */
  onLoadStart?: () => void;
  
  /**
   * Called when image finishes loading (success or error)
   */
  onLoadEnd?: () => void;
  
  /**
   * Placeholder component or image to show while loading
   */
  placeholder?: React.ReactNode;
  
  /**
   * Fallback component or image to show on error
   */
  fallback?: React.ReactNode;
  
  /**
   * Additional props to pass to the underlying Image component
   */
  imageProps?: Partial<ExpoImageProps>;
  
  /**
   * Additional props to pass to SvgUri component
   */
  svgProps?: {
    [key: string]: any;
  };
  
  /**
   * Whether to force SVG rendering (overrides auto-detection)
   */
  forceSvg?: boolean;
  
  /**
   * Whether to force regular Image rendering (overrides auto-detection)
   */
  forceImage?: boolean;
}

const SmartImage: React.FC<SmartImageProps> = ({
  source,
  width,
  height,
  style,
  resizeMode = 'contain',
  borderRadius,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  placeholder,
  fallback,
  imageProps,
  svgProps,
  forceSvg = false,
  forceImage = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Extract URI from source
  const getUri = (): string | null => {
    if (typeof source === 'string') {
      return source;
    }
    if (typeof source === 'object' && 'uri' in source) {
      return source.uri;
    }
    // Local require() source - use Image component
    return null;
  };

  const uri = getUri();
  const isLocalSource = uri === null && typeof source === 'number';
  
  // Determine if the image is SVG
  const isSvg = useCallback(() => {
    if (forceImage) return false;
    if (forceSvg) return true;
    if (!uri) return false;
    
    // Check by file extension
    const lowerUri = uri.toLowerCase();
    return lowerUri.endsWith('.svg') || lowerUri.includes('.svg?');
  }, [uri, forceSvg, forceImage]);

  // Handle load events
  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((err: any) => {
    setLoading(false);
    setError(true);
    onError?.(err);
  }, [onError]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  // Map resizeMode to expo-image's contentFit
  const mapResizeMode = (mode?: 'cover' | 'contain' | 'stretch' | 'center'): ImageContentFit => {
    switch (mode) {
      case 'cover':
        return 'cover';
      case 'contain':
        return 'contain';
      case 'stretch':
        return 'fill';
      case 'center':
        return 'scale-down';
      default:
        return 'contain';
    }
  };

  // Combine styles
  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    ...(Array.isArray(style) ? Object.assign({}, ...style) : style),
  };

  // Extract image-specific styles (remove View-only properties)
  const imageStyle: ImageStyle = {
    width,
    height,
    borderRadius,
  };

  // Local require() source - always use Image
  if (isLocalSource) {
    return (
      <Image
        source={source as number}
        style={imageStyle}
        contentFit={mapResizeMode(resizeMode)}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        {...imageProps}
      />
    );
  }

  // No URI - show fallback or placeholder
  if (!uri) {
    return (
      <View style={containerStyle}>
        {error && fallback ? fallback : placeholder || null}
      </View>
    );
  }

  // SVG images - use SvgUri
  if (isSvg()) {
    return (
      <View style={containerStyle}>
        {loading && placeholder ? (
          <View style={StyleSheet.absoluteFill}>
            {placeholder}
          </View>
        ) : null}
        {!error ? (
          <SvgUri
            uri={uri}
            width={width || containerStyle.width as number || 32}
            height={height || containerStyle.height as number || 32}
            onLoad={handleLoad}
            onError={handleError}
            {...svgProps}
          />
        ) : (
          <View style={StyleSheet.absoluteFill}>
            {fallback || placeholder || null}
          </View>
        )}
      </View>
    );
  }

  // Regular images - use Expo Image
  return (
    <View style={containerStyle}>
      <Image
        source={{ uri }}
        style={imageStyle}
        contentFit={mapResizeMode(resizeMode)}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        {...imageProps}
      />
      {loading && placeholder ? (
        <View style={StyleSheet.absoluteFill}>
          {placeholder}
        </View>
      ) : null}
      {error && fallback ? (
        <View style={StyleSheet.absoluteFill}>
          {fallback}
        </View>
      ) : null}
    </View>
  );
};

export default SmartImage;

