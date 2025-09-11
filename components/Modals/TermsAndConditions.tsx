import CustomText from "../general/CustomText";
import React, { useRef, useState } from "react";
import Box from "../general/Box";
import { ScrollView, TouchableOpacity, Animated } from "react-native";
import CustomButton from "../general/CustomButton";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import { ArrowDown } from "lucide-react-native";

interface TermsAndConditionsProps {
  onAccept: () => void;
}

const TermsAndConditions = ({
  onAccept,
}: TermsAndConditionsProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const theme = useTheme<Theme>();
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const rotationValue = useRef(new Animated.Value(0)).current;

  const scrollStep = scrollViewHeight * 0.8; // Scroll 80% of visible height per step

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const scrollUp = () => {
    // If we're at the bottom, scroll to the very top in one action
    if (isAtBottom) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Otherwise, scroll up by one step
      const newY = Math.max(0, currentScrollY - scrollStep);
      scrollViewRef.current?.scrollTo({ y: newY, animated: true });
    }
  };

  const scrollDown = () => {
    const maxScrollY = contentHeight - scrollViewHeight;
    const newY = Math.min(maxScrollY, currentScrollY + scrollStep);
    scrollViewRef.current?.scrollTo({ y: newY, animated: true });
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottomNow = contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
    const isAtTopNow = contentOffset.y <= 10;

    setCurrentScrollY(contentOffset.y);

    if (isAtBottomNow !== isAtBottom) {
      setIsAtBottom(isAtBottomNow);

      // Animate rotation
      Animated.timing(rotationValue, {
        toValue: isAtBottomNow ? 180 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    setContentHeight(contentHeight);
  };

  const handleLayout = (event: any) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  };

  return (
    <Box>
      <Box pb="m">
        <CustomText variant="header" fontSize={18}>Terms of use</CustomText>
      </Box>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        scrollEventThrottle={16}
      >
        <Box mb="4xl" style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores quo iste, eligendi aspernatur illo, ea praesentium nemo, quos sit id officiis quia error facilis consequuntur maxime ducimus perferendis fuga nulla.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores quo iste, eligendi aspernatur illo, ea praesentium nemo, quos sit id officiis quia error facilis consequuntur maxime ducimus perferendis fuga nulla.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sed quae, veritatis totam quam deserunt dolore laboriosam ab illo iusto voluptates modi, dicta obcaecati cupiditate autem distinctio eum optio consequatur. Nulla praesentium aliquid atque quibusdam nihil minus? Vero veniam totam doloribus dolor accusamus laborum corrupti, provident et ipsa exercitationem! Labore!
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores quo iste, eligendi aspernatur illo, ea praesentium nemo, quos sit id officiis quia error facilis consequuntur maxime ducimus perferendis fuga nulla.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores quo iste, eligendi aspernatur illo, ea praesentium nemo, quos sit id officiis quia error facilis consequuntur maxime ducimus perferendis fuga nulla.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptatem sed quae, veritatis totam quam deserunt dolore laboriosam ab illo iusto voluptates modi, dicta obcaecati cupiditate autem distinctio eum optio consequatur. Nulla praesentium aliquid atque quibusdam nihil minus? Vero veniam totam doloribus dolor accusamus laborum corrupti, provident et ipsa exercitationem! Labore!
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomText variant="body" fontSize={14}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam ratione, delectus voluptate facere nisi dolore non praesentium amet adipisci quae pariatur obcaecati exercitationem fuga? Deserunt asperiores minus esse repellat sed.
          </CustomText>

          <CustomButton
            width={"100%"}
            // height={56}
            borderRadius={56}
            text="Got it"
            onPress={() => {
              onAccept();
            }}
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}

          />
        </Box>
      </ScrollView>

      {/* FAB for scroll actions */}
      <Box
        position="absolute"
        bottom={150}
        right={20}
        style={{
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Dynamic FAB */}
        <TouchableOpacity
          onPress={isAtBottom ? scrollUp : scrollDown}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primaryColor,
            justifyContent: "center",
            alignItems: "center",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotationValue.interpolate({
                    inputRange: [0, 180],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            }}
          >
            <ArrowDown color={theme.colors.white} size={24} />
          </Animated.View>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

export default TermsAndConditions;