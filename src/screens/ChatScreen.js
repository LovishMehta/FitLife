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
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import ChatBubble from '../components/ChatBubble';
import mockAIService from '../services/mockAIService';

/**
 * Chat Screen - AI Coach Ria interface
 */
const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);
  const suggestedActions = mockAIService.getSuggestedActions();

  useEffect(() => {
    const initialMessage = {
      id: Date.now(),
      message: mockAIService.getRandomResponse('default'),
      isUser: false,
      timestamp: getCurrentTime(),
    };
    setMessages([initialMessage]);
  }, []);

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
    setInputText('');
    setIsTyping(true);

    const aiResponse = await mockAIService.getResponse(inputText.trim());
    setIsTyping(false);

    const aiMessage = {
      id: Date.now() + 1,
      message: aiResponse,
      isUser: false,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, aiMessage]);
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

    const aiResponse = await mockAIService.getResponse(suggestion);
    setIsTyping(false);

    const aiMessage = {
      id: Date.now() + 1,
      message: aiResponse,
      isUser: false,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleFeedback = (type) => {
    console.log(`Feedback: ${type}`);
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>R</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.premiumButton}>
              <Ionicons name="star" size={16} color={colors.yellow} />
              <Text style={styles.premiumButtonText}>Premium Feature</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trialButton}>
              <Text style={styles.trialButtonText}>Free Trial +</Text>
            </TouchableOpacity>
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
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  premiumButtonText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  trialButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  trialButtonText: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
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



