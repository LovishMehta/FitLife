/**
 * FatToFit Chat Store
 * Manages AI coach chat state and history
 */

import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { OPENAI_CONFIG } from '../utils/constants';

const useChatStore = create((set, get) => ({
  // State
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  totalTokensUsed: 0,

  // Fetch chat history
  fetchMessages: async (userId, limit = 50) => {
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      set({ messages: data || [], isLoading: false });
      return data;
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  // Send a message to the AI coach
  sendMessage: async (userId, message, context = {}) => {
    if (!userId || !message.trim()) return { success: false };

    try {
      set({ isSending: true, error: null });

      // Save user message to database
      const { data: userMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          role: 'user',
          message: message.trim(),
          context_snapshot: context,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Add to local state immediately
      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Call the AI coach edge function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'coach-chat',
        {
          body: {
            message: message.trim(),
            context,
            history: get().messages.slice(-OPENAI_CONFIG.MAX_CONTEXT_MESSAGES),
          },
        }
      );

      if (aiError) throw aiError;

      // Save AI response to database
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          role: 'assistant',
          message: aiResponse.message,
          tokens_used: aiResponse.tokens_used,
          model_used: aiResponse.model,
          response_time_ms: aiResponse.response_time_ms,
        })
        .select()
        .single();

      if (assistantError) throw assistantError;

      // Update local state
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isSending: false,
        totalTokensUsed: state.totalTokensUsed + (aiResponse.tokens_used || 0),
      }));

      return { success: true, data: assistantMessage };
    } catch (error) {
      console.error('Send message error:', error);
      set({ error: error.message, isSending: false });
      return { success: false, error };
    }
  },

  // Send message with local OpenAI (for when edge function not available)
  sendMessageDirect: async (userId, message, context = {}, apiKey) => {
    if (!userId || !message.trim() || !apiKey) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      set({ isSending: true, error: null });

      // Save user message
      const { data: userMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          role: 'user',
          message: message.trim(),
          context_snapshot: context,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Build messages array for OpenAI
      const systemPrompt = get().buildSystemPrompt(context);
      const chatHistory = get().messages.slice(-OPENAI_CONFIG.MAX_CONTEXT_MESSAGES);

      const openaiMessages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((m) => ({
          role: m.role,
          content: m.message,
        })),
        { role: 'user', content: message.trim() },
      ];

      // Call OpenAI API directly
      const startTime = Date.now();
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.MODEL,
          messages: openaiMessages,
          max_tokens: OPENAI_CONFIG.MAX_TOKENS,
          temperature: OPENAI_CONFIG.TEMPERATURE,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content;
      const tokensUsed = data.usage?.total_tokens || 0;

      // Save AI response
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          role: 'assistant',
          message: aiMessage,
          tokens_used: tokensUsed,
          model_used: OPENAI_CONFIG.MODEL,
          response_time_ms: responseTime,
        })
        .select()
        .single();

      if (assistantError) throw assistantError;

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isSending: false,
        totalTokensUsed: state.totalTokensUsed + tokensUsed,
      }));

      return { success: true, data: assistantMessage };
    } catch (error) {
      console.error('Send message direct error:', error);
      set({ error: error.message, isSending: false });
      return { success: false, error };
    }
  },

  // Build system prompt with context
  buildSystemPrompt: (context) => {
    const { COACH_SYSTEM_PROMPT, buildUserContext } = require('../utils/prompts');
    return COACH_SYSTEM_PROMPT + buildUserContext(context);
  },

  // Add a local message (for optimistic updates or system messages)
  addLocalMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Clear chat history (local only)
  clearMessages: () => {
    set({ messages: [], totalTokensUsed: 0 });
  },

  // Delete all chat history from database
  deleteAllMessages: async (userId) => {
    if (!userId) return { success: false };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      set({ messages: [], totalTokensUsed: 0 });
      return { success: true };
    } catch (error) {
      console.error('Delete messages error:', error);
      return { success: false, error };
    }
  },

  // Get suggested prompts based on context
  getSuggestedPrompts: (context) => {
    const { SUGGESTED_PROMPTS } = require('../utils/prompts');

    // Determine context type
    const hour = new Date().getHours();
    const hasWorkoutToday = context?.todayStats?.workoutCompleted;

    if (hour < 10) {
      return SUGGESTED_PROMPTS.general;
    } else if (hour < 12 && !hasWorkoutToday) {
      return SUGGESTED_PROMPTS.preworkout;
    } else if (hasWorkoutToday) {
      return SUGGESTED_PROMPTS.postworkout;
    } else if (hour >= 11 && hour <= 14) {
      return SUGGESTED_PROMPTS.nutrition;
    } else if (hour >= 18) {
      return SUGGESTED_PROMPTS.planning;
    }

    return SUGGESTED_PROMPTS.general;
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useChatStore;


