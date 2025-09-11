import React, { useRef, useEffect } from "react";
import FullPageModalWrapper from "./FullPaperModalWrapper";
import Box from "../general/Box";
import { Image } from "expo-image";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import useActiveTheme from "@/hooks/useTheme";
import { Pressable, Dimensions, Animated } from "react-native";
import { WalletImportedSuccessfully } from "../general";

const { width } = Dimensions.get("window");

const ImportSuccessfulModal = ({
  isOpen,
  onClose,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}) => {
  const theme = useTheme<Theme>();
  const activeTheme = useActiveTheme();

  // Animation values for each card
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card4Anim = useRef(new Animated.Value(0)).current;

  // Animation values for chain icons
  const chainIcon1Anim = useRef(new Animated.Value(0)).current; // arb
  const chainIcon2Anim = useRef(new Animated.Value(0)).current; // op
  const chainIcon3Anim = useRef(new Animated.Value(0)).current; // bnb
  const chainIcon4Anim = useRef(new Animated.Value(0)).current; // eth
  const chainIcon5Anim = useRef(new Animated.Value(0)).current; // btc

  useEffect(() => {
    if (isOpen) {
      // Reset all animations to 0 when modal opens
      card1Anim.setValue(0);
      card2Anim.setValue(0);
      card3Anim.setValue(0);
      card4Anim.setValue(0);
      chainIcon1Anim.setValue(0);
      chainIcon2Anim.setValue(0);
      chainIcon3Anim.setValue(0);
      chainIcon4Anim.setValue(0);
      chainIcon5Anim.setValue(0);

      // Staggered animation sequence
      const animations = [
        Animated.timing(card1Anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(card2Anim, {
          toValue: 1,
          duration: 200,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(card3Anim, {
          toValue: 1,
          duration: 200,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(card4Anim, {
          toValue: 1,
          duration: 200,
          delay: 600,
          useNativeDriver: true,
        }),
      ];

      // Start all animations
      Animated.parallel(animations).start(() => {
        // Start chain icon animations after cards complete
        const chainAnimations = [
          Animated.timing(chainIcon1Anim, {
            toValue: 1,
            duration: 300,
            delay: 100,
            useNativeDriver: true,
          }),
          Animated.timing(chainIcon2Anim, {
            toValue: 1,
            duration: 500,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(chainIcon3Anim, {
            toValue: 1,
            duration: 500,
            delay: 500,
            useNativeDriver: true,
          }),
          Animated.timing(chainIcon4Anim, {
            toValue: 1,
            duration: 500,
            delay: 400,
            useNativeDriver: true,
          }),
          Animated.timing(chainIcon5Anim, {
            toValue: 1,
            duration: 500,
            delay: 500,
            useNativeDriver: true,
          }),
        ];

        Animated.parallel(chainAnimations).start();
      });
    }
  }, [
    isOpen,
    card1Anim,
    card2Anim,
    card3Anim,
    card4Anim,
    chainIcon1Anim,
    chainIcon2Anim,
    chainIcon3Anim,
    chainIcon4Anim,
    chainIcon5Anim,
  ]);

  return (
    <FullPageModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      color={
        activeTheme === "dark"
          ? ["#7055FF", "#000000DD"]
          : ["#7055FF", "#FFFFFF"]
      }
    >
      <WalletImportedSuccessfully
        onContinue={() => {
          onContinue();
          onClose();
        }}
      />
    </FullPageModalWrapper>
  );
};

export default ImportSuccessfulModal;
