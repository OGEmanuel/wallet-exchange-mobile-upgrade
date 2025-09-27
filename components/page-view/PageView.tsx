import React, { useCallback, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

interface PageViewProps {
  children: React.ReactNode[];
  initialPage?: number;
  onPageChanged?: (index: number) => void;
  scrollEnabled?: boolean;
  showPageIndicator?: boolean;
  pageIndicatorStyle?: 'dots' | 'line' | 'none';
  style?: ViewStyle;
}

const PageView: React.FC<PageViewProps> = ({
  children,
  initialPage = 0,
  onPageChanged,
  scrollEnabled = true,
  showPageIndicator = true,
  pageIndicatorStyle = 'none',
  style
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth === 0) return;
    
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / containerWidth);
    
    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < children.length) {
      setCurrentPage(pageIndex);
      onPageChanged?.(pageIndex);
    }
  }, [currentPage, children.length, onPageChanged, containerWidth]);

  const scrollToPage = useCallback((index: number) => {
    if (index >= 0 && index < children.length && containerWidth > 0) {
      scrollViewRef.current?.scrollTo({
        x: index * containerWidth,
        animated: true
      });
    }
  }, [children.length, containerWidth]);

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            style={styles.scrollView}
          >
            {children.map((child, index) => (
              <View key={index} style={[styles.page, { width: containerWidth }]}>
                {child}
              </View>
            ))}
          </ScrollView>

          {showPageIndicator && pageIndicatorStyle !== 'none' && (
            <View style={styles.indicatorContainer}>
              {pageIndicatorStyle === 'dots' ? (
                <DotsIndicator 
                  count={children.length} 
                  currentIndex={currentPage}
                  onDotPress={scrollToPage}
                />
              ) : (
                <LineIndicator 
                  count={children.length} 
                  currentIndex={currentPage}
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

interface IndicatorProps {
  count: number;
  currentIndex: number;
  onDotPress?: (index: number) => void;
}

const DotsIndicator: React.FC<IndicatorProps> = ({ count, currentIndex, onDotPress }) => {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onDotPress?.(index)}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot
          ]}
          activeOpacity={0.7}
        />
      ))}
    </View>
  );
};

const LineIndicator: React.FC<Omit<IndicatorProps, 'onDotPress'>> = ({ count, currentIndex }) => {
  const width = 100 / count;
  
  return (
    <View style={styles.lineContainer}>
      <View style={styles.lineBackground}>
        <View 
          style={[
            styles.lineActive,
            {
              width: `${width}%`,
              transform: [{ translateX: currentIndex * 100 }]
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  scrollView: {
    flex: 1
  },
  page: {
    flex: 1
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  activeDot: {
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  lineContainer: {
    width: 200,
    alignItems: 'center'
  },
  lineBackground: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  lineActive: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2
  }
});

export default PageView;