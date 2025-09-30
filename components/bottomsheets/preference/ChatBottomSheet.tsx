import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: string;
  seen?: boolean;
}

const ChatBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const [message, setMessage] = useState("");
  
  // Sample messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello there, I've had a transaction pending for a while now",
      sender: "user",
      timestamp: "12:03 PM",
      seen: true
    },
    {
      id: "2",
      text: "Hello Jonathan",
      sender: "support",
      timestamp: "12:03 PM"
    },
    {
      id: "3",
      text: "Thank you for reaching out to us.",
      sender: "support",
      timestamp: "12:03 PM"
    },
    {
      id: "4",
      text: "Can you please share your transaction ID?",
      sender: "support",
      timestamp: "12:03 PM"
    }
  ]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const renderDateHeader = () => (
    <Box alignItems="center" my="m">
      <Box bg="secondaryBackgroundColor" px="m" py="s" borderRadius={16}>
        <CustomText variant="body" >27. May 2023</CustomText>
      </Box>
    </Box>
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
        </Box>
      )}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <BottomSheetView
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.mainBackgroundColor,
          }}
        >
          {/* Chat Header */}
          <Box flexDirection="row" alignItems="center" px="m" py="s">
            <TouchableOpacity onPress={() => {
              if (ref && 'current' in ref && ref.current) {
                ref.current.close();
              }
            }}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            
            <Box ml="m" flexDirection="row" alignItems="center">
              <Box 
                width={40} 
                height={40} 
                borderRadius={20} 
                bg="white" 
                justifyContent="center" 
                alignItems="center"
                mr="s"
              >
                <CustomText variant="body" color="black">T</CustomText>
              </Box>
              <CustomText variant="header" color="white">Thomas</CustomText>
            </Box>
          </Box>
          
          {/* Messages Area */}
          <BottomSheetScrollView 
            contentContainerStyle={styles.messagesContainer}
            style={{ flex: 1 }}
          >
            {renderDateHeader()}
            
            {messages.map((msg) => (
              <Box 
                key={msg.id} 
                alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                maxWidth="80%"
                mb="m"
              >
                <Box 
                  bg={msg.sender === "user" ? "primaryColor" : "secondaryBackgroundColor"}
                  borderRadius={16}
                  px="m"
                  py="s"
                >
                  <CustomText variant="body" color={msg.sender === "user" ? "white" : "white"}>
                    {msg.text}
                  </CustomText>
                </Box>
                
                {msg.sender === "user" && msg.seen && (
                  <Box alignItems="flex-end" mt="s">
                    <CustomText variant="xs" color="disabledTextColor">
                      Seen {msg.timestamp}
                    </CustomText>
                  </Box>
                )}
                
                {msg.sender === "support" && (
                  <Box mt="s">
                    <CustomText variant="xs" color="disabledTextColor">
                      {msg.timestamp}
                    </CustomText>
                  </Box>
                )}
              </Box>
            ))}
          </BottomSheetScrollView>
          
          {/* Message Input */}
          <Box 
            flexDirection="row" 
            alignItems="center" 
            px="m" 
            py="s"
            bg="mainBackgroundColor"
            borderTopWidth={1}
            borderTopColor="secondaryBackgroundColor"
          >
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color={theme.colors.disabledTextColor} />
            </TouchableOpacity>
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.secondaryBackgroundColor,
                  color: theme.colors.white
                }
              ]}
              placeholder="Send a message"
              placeholderTextColor={theme.colors.disabledTextColor}
              value={message}
              onChangeText={setMessage}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { backgroundColor: message.trim() ? theme.colors.primaryColor : theme.colors.secondaryBackgroundColor }
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Ionicons 
                name="send" 
                size={18} 
                color={message.trim() ? theme.colors.white : theme.colors.disabledTextColor} 
              />
            </TouchableOpacity>
          </Box>
        </BottomSheetView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  attachButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ChatBottomSheet;
