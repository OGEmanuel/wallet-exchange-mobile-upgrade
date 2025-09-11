// import React, { useRef, useEffect } from "react";
// import FullPageModalWrapper from "./FullPaperModalWrapper";
// import Box from "../general/Box";
// import { Image } from "expo-image";
// import CustomButton from "../general/CustomButton";
// import CustomText from "../general/CustomText";
// import { useTheme } from "@shopify/restyle";
// import { Theme } from "@/theme";
// import useActiveTheme from "@/hooks/useTheme";
// import { Pressable, Dimensions, Animated } from "react-native";

// const { width } = Dimensions.get("window");

// const ImportSuccessfulModal = ({
//   isOpen,
//   onClose,
//   onContinue,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onContinue: () => void;
// }) => {
//   const theme = useTheme<Theme>();
//   const activeTheme = useActiveTheme();

//   // Animation values for each card
//   const card1Anim = useRef(new Animated.Value(0)).current;
//   const card2Anim = useRef(new Animated.Value(0)).current;
//   const card3Anim = useRef(new Animated.Value(0)).current;
//   const card4Anim = useRef(new Animated.Value(0)).current;

//   // Animation values for chain icons
//   const chainIcon1Anim = useRef(new Animated.Value(0)).current; // arb
//   const chainIcon2Anim = useRef(new Animated.Value(0)).current; // op
//   const chainIcon3Anim = useRef(new Animated.Value(0)).current; // bnb
//   const chainIcon4Anim = useRef(new Animated.Value(0)).current; // eth
//   const chainIcon5Anim = useRef(new Animated.Value(0)).current; // btc

//   useEffect(() => {
//     // Staggered animation sequence
//     const animations = [
//       Animated.timing(card1Anim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(card2Anim, {
//         toValue: 1,
//         duration: 200,
//         delay: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(card3Anim, {
//         toValue: 1,
//         duration: 200,
//         delay: 400,
//         useNativeDriver: true,
//       }),
//       Animated.timing(card4Anim, {
//         toValue: 1,
//         duration: 200,
//         delay: 600,
//         useNativeDriver: true,
//       }),
//     ];

//     // Start all animations
//     Animated.parallel(animations).start(() => {
//       // Start chain icon animations after cards complete
//       const chainAnimations = [
//         Animated.timing(chainIcon1Anim, {
//           toValue: 1,
//           duration: 300,
//           delay: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(chainIcon2Anim, {
//           toValue: 1,
//           duration: 300,
//           delay: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(chainIcon3Anim, {
//           toValue: 1,
//           duration: 300,
//           delay: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(chainIcon4Anim, {
//           toValue: 1,
//           duration: 300,
//           delay: 400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(chainIcon5Anim, {
//           toValue: 1,
//           duration: 300,
//           delay: 500,
//           useNativeDriver: true,
//         }),
//       ];

//       Animated.parallel(chainAnimations).start();
//     });
//   }, []);

//   return (
//     <FullPageModalWrapper
//       isOpen={isOpen}
//       onClose={onClose}
//       color={
//         activeTheme === "dark"
//           ? ["#7055FF", "#000000DD"]
//           : ["#7055FF", "#FFFFFF"]
//       }
//     >
//       <Box flex={1} justifyContent="center">
//         {/* Confetti Background */}
//         <Box position="absolute" top={-50} left={0} right={0} bottom={0}>
//           <Image
//             source={require("@/assets/images/wallet-created/confetti-celebration.png")}
//             style={{
//               width: width,
//               height: width * 0.8,
//               resizeMode: "contain",
//             }}
//           />
//         </Box>

//         {/* Main Content */}
//         <Box flex={1} padding="m" justifyContent="center" alignItems="center">
//           {/* Wallet Created Text */}
//           <Box alignItems="center" flexDirection="row" mb="xl">
//             <CustomText variant="header" fontSize={32}>
//               Wallet Created! 1111
//             </CustomText>
//             <CustomText fontSize={24} ml="s">
//               🎉
//             </CustomText>
//           </Box>

//           {/* Stacked Wallet Cards */}
//           <Box alignItems="center" mb="xl">
//             {/* Bottom Card (peeking from left) */}
//             <Animated.View
//               style={{
//                 position: "absolute",
//                 top: -60,
//                 opacity: card1Anim,
//                 transform: [
//                   {
//                     translateY: card1Anim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [100, 0],
//                     }),
//                   },
//                 ],
//               }}
//             >
//               <Image
//                 source={require("@/assets/images/wallet-created/wallet-card-background.png")}
//                 style={{
//                   width: width * 0.6,
//                   height: 280,
//                   resizeMode: "contain",
//                   borderRadius: 20,
//                 }}
//               />
//             </Animated.View>

//             {/* Second Card */}
//             <Animated.View
//               style={{
//                 position: "absolute",
//                 top: -40,
//                 opacity: card2Anim,
//                 transform: [
//                   {
//                     translateY: card2Anim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [100, 0],
//                     }),
//                   },
//                 ],
//               }}
//             >
//               <Image
//                 source={require("@/assets/images/wallet-created/wallet-card-middle.png")}
//                 style={{
//                   width: width * 0.7,
//                   height: 280,
//                   resizeMode: "contain",
//                   borderRadius: 20,
//                 }}
//               />
//             </Animated.View>

//             {/* Third Card */}
//             <Animated.View
//               style={{
//                 position: "absolute",
//                 top: -20,
//                 opacity: card3Anim,
//                 transform: [
//                   {
//                     translateY: card3Anim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [100, 0],
//                     }),
//                   },
//                 ],
//               }}
//             >
//               <Image
//                 source={require("@/assets/images/wallet-created/wallet-card-front.png")}
//                 style={{
//                   width: width * 0.8,
//                   height: 280,
//                   resizeMode: "contain",
//                   borderRadius: 20,
//                 }}
//               />
//             </Animated.View>

//             {/* Main Card */}
//             <Animated.View
//               style={{
//                 position: "relative",
//                 opacity: card4Anim,
//                 transform: [
//                   {
//                     translateY: card4Anim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [100, 0],
//                     }),
//                   },
//                 ],
//               }}
//             >
//               <Image
//                 source={require("@/assets/images/wallet-created/wallet-card-main.png")}
//                 style={{
//                   width: width * 0.9,
//                   height: 280,
//                   resizeMode: "contain",
//                   borderRadius: 20,
//                 }}
//               />
//               <Animated.View
//                 style={{
//                   position: "absolute",
//                   bottom: 65,
//                   left: width * 0.6,
//                   opacity: chainIcon1Anim,
//                   transform: [
//                     {
//                       scale: chainIcon1Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0.3, 1],
//                       }),
//                     },
//                     {
//                       translateY: chainIcon1Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [20, 0],
//                       }),
//                     },
//                   ],
//                 }}
//               >
//                 <Image
//                   source={require("@/assets/images/wallet-created/chains/arb.png")}
//                   style={{
//                     width: 30,
//                     height: 30,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </Animated.View>
//               <Animated.View
//                 style={{
//                   position: "absolute",
//                   bottom: 65,
//                   left: width * 0.65,
//                   opacity: chainIcon2Anim,
//                   transform: [
//                     {
//                       scale: chainIcon2Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0.3, 1],
//                       }),
//                     },
//                     {
//                       translateY: chainIcon2Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [20, 0],
//                       }),
//                     },
//                   ],
//                 }}
//               >
//                 <Image
//                   source={require("@/assets/images/wallet-created/chains/op.png")}
//                   style={{
//                     width: 30,
//                     height: 30,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </Animated.View>
//               <Animated.View
//                 style={{
//                   position: "absolute",
//                   bottom: 65,
//                   left: width * 0.7,
//                   opacity: chainIcon3Anim,
//                   transform: [
//                     {
//                       scale: chainIcon3Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0.3, 1],
//                       }),
//                     },
//                     {
//                       translateY: chainIcon3Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [20, 0],
//                       }),
//                     },
//                   ],
//                 }}
//               >
//                 <Image
//                   source={require("@/assets/images/wallet-created/chains/bnb.png")}
//                   style={{
//                     width: 30,
//                     height: 30,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </Animated.View>
//               <Animated.View
//                 style={{
//                   position: "absolute",
//                   bottom: 65,
//                   left: width * 0.75,
//                   opacity: chainIcon4Anim,
//                   transform: [
//                     {
//                       scale: chainIcon4Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0.3, 1],
//                       }),
//                     },
//                     {
//                       translateY: chainIcon4Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [20, 0],
//                       }),
//                     },
//                   ],
//                 }}
//               >
//                 <Image
//                   source={require("@/assets/images/wallet-created/chains/eth.png")}
//                   style={{
//                     width: 30,
//                     height: 30,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </Animated.View>
//               <Animated.View
//                 style={{
//                   position: "absolute",
//                   bottom: 65,
//                   left: width * 0.8,
//                   opacity: chainIcon5Anim,
//                   transform: [
//                     {
//                       scale: chainIcon5Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0.3, 1],
//                       }),
//                     },
//                     {
//                       translateY: chainIcon5Anim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [20, 0],
//                       }),
//                     },
//                   ],
//                 }}
//               >
//                 <Image
//                   source={require("@/assets/images/wallet-created/chains/btc.png")}
//                   style={{
//                     width: 30,
//                     height: 30,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </Animated.View>
//             </Animated.View>
//           </Box>
//         </Box>
//       </Box>
//       <Box width="100%" height={60} justifyContent="center">
//         <Pressable
//           onPress={(e) => {
//             e?.stopPropagation();
//             onContinue();
//             onClose();
//           }}
//         >
//           <CustomButton
//             width={"100%"}
//             height={56}
//             borderRadius={56}
//             text="Continue"
//             bgColor={theme.colors.primaryColor}
//             color={theme.colors.white}
//             onPress={() => {}}
//           />
//         </Pressable>
//       </Box>
//     </FullPageModalWrapper>
//   );
// };

// export default ImportSuccessfulModal;
