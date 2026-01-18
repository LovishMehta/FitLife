import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import ChatBubble from '../components/ChatBubble';
import aiService from '../services/aiService';
import chatService from '../services/chatService';

/**
 * Chat Screen - AI Coach Ria interface
 */
const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  const suggestedActions = aiService.getSuggestedActions();

  useEffect(() => {
    loadChatHistory();
    
    // Cleanup on unmount - sync remaining messages
    return () => {
      chatService.onLeaveChatScreen();
    };
  }, []);

  const loadChatHistory = async () => {
    // Load existing conversation from local storage
    const conversation = await chatService.getCurrentConversation();
    
    if (conversation.length > 0) {
      // Use existing conversation
      const formattedMessages = conversation.map(msg => ({
        id: msg.id,
        message: msg.message,
        isUser: msg.isUser,
        timestamp: formatTimestamp(msg.createdAt),
      }));
      setMessages(formattedMessages);
    } else {
      // New conversation - show welcome message
      const welcomeMessage = {
        id: Date.now(),
        message: "Hi! I'm Ria, your AI health coach. 😊\n\nI can help you with step goals, motivation, and fitness tips. What would you like to know?",
        isUser: false,
        timestamp: getCurrentTime(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const formatTimestamp = (isoDate) => {
    const date = new Date(isoDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: inputText.trim(),
      isUser: true,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      // Use real AI service (handles auth check and fallback)
      const aiResponse = await aiService.getResponse(messageText);
      setIsTyping(false);

      const aiMessage = {
        id: Date.now() + 1,
        message: aiResponse,
        isUser: false,
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
      
      const errorMessage = {
        id: Date.now() + 1,
        message: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        isUser: false,
        timestamp: getCurrentTime(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestion = async (suggestion) => {
    const userMessage = {
      id: Date.now(),
      message: suggestion,
      isUser: true,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiResponse = await aiService.getResponse(suggestion);
      setIsTyping(false);

      const aiMessage = {
        id: Date.now() + 1,
        message: aiResponse,
        isUser: false,
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    }
  };

  const handleFeedback = (type) => {
    console.log(`Feedback: ${type}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.headerTitle}>Ria</Text>
          </View>
          <View style={styles.headerRight}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          <Text style={styles.dateLabel}>Today</Text>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
              onFeedback={handleFeedback}
            />
          ))}
          {isTyping && (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>Ria is typing...</Text>
            </View>
          )}

          {/* Suggested Actions */}
          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              {suggestedActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestion(action)}
                >
                  <Text style={styles.suggestionText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputIcon}>
            <Ionicons name="mic" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask Ria anything..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline={true}
          />
          <TouchableOpacity style={styles.inputIcon}>
            <Ionicons name="happy-outline" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputIcon}>
            <Ionicons name="grid-outline" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? colors.background : colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.padding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.md,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  typingContainer: {
    paddingHorizontal: spacing.padding,
    paddingVertical: spacing.sm,
  },
  typingText: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingHorizontal: spacing.padding,
    paddingTop: spacing.md,
  },
  suggestionButton: {
    backgroundColor: colors.lightTeal,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radius,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.padding,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  inputIcon: {
    padding: spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    color: colors.textPrimary,
    paddingHorizontal: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});

export default ChatScreen;



