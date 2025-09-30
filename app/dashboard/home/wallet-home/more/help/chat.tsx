import ChatBottomSheet from "@/components/bottomsheets/preference/ChatBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const Chat = () => {
  const { chatBottomSheetRef } = useBottomSheetRefs();
  const conversations = [
    {
      id: "1",
      name: "Thomas",
      preview: "Preview of a message sent by a user",
      time: "19:00",
      unread: true,
    },
    {
      id: "2",
      name: "Thomas",
      preview: "Preview of a message sent by a user",
      time: "19:00",
      unread: true,
    },
    {
      id: "3",
      name: "Malik",
      preview: "Preview of a message sent by a user",
      time: "29 Jul",
      unread: true,
    },
  ];

  return (
    <PageWrapper>
      <SettingsHeader title="Conversations" onBackPress={() => router.back()} />
      <Box flex={1} bg="mainBackgroundColor" px="m">
        {/* ACT Logo Section */}
        <Box
          bg="secondaryBackgroundColor"
          borderRadius={12}
          alignItems="center"
          py="l"
          px="m"
          mb="m"
          mt="l"
        >
          <Box justifyContent="center" alignItems="center" mb="m">
            <Image
              source={require("@/assets/images/act.png")}
              style={{ width: 150, height: 50 }}
              contentFit="contain"
            />
          </Box>

          {/* Start Conversation Button */}
          <TouchableOpacity style={styles.startButton}>
            <CustomText variant="body" color="black" mr="s">
              Start a conversation
            </CustomText>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={16} color="#0066FF" />
            </View>
          </TouchableOpacity>

          {/* Response Time */}
          <Box
            borderRadius={20}
            py="s"
            px="m"
            mt="s"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <CustomText variant="body" color="white">
              We typically reply in 20 minutes
            </CustomText>
          </Box>
        </Box>

        {/* Conversations Title */}
        <Box py="s">
          <CustomText variant="header" color="white">
            Conversations
          </CustomText>
        </Box>

        {/* Conversation List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationItem}
              onPress={() => chatBottomSheetRef.current?.snapToIndex(1)}
            >
              <Box
                width={40}
                height={40}
                borderRadius={20}
                bg="secondaryBackgroundColor"
                justifyContent="center"
                alignItems="center"
                mr="m"
              >
                <CustomText variant="body" color="white">
                  {conversation.name.charAt(0)}
                </CustomText>
              </Box>
              <Box flex={1}>
                <CustomText variant="body" color="white" mb="s">
                  {conversation.name}
                </CustomText>
                <CustomText variant="body">{conversation.preview}</CustomText>
              </Box>
              <Box alignItems="flex-end">
                <CustomText variant="body" mb="s">
                  {conversation.time}
                </CustomText>
                {conversation.unread && (
                  <Box width={8} height={8} borderRadius={4} bg="error" />
                )}
              </Box>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Box>
      <ChatBottomSheet ref={chatBottomSheetRef} />
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    marginBottom: 8,
  },
  arrowContainer: {
    backgroundColor: "#E6F0FF",
    borderRadius: 50,
    padding: 4,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default Chat;
