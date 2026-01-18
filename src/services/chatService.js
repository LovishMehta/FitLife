import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured, getSession } from './supabaseService';

/**
 * Chat Service - MVP Implementation (OPTIMIZED)
 * 
 * Per MVP doc - Chat History & AI Context:
 * - Conversation: Messages with gaps < 4 hours between them
 * - Summary: Persistent memory of user's preferences, facts, patterns
 * - Session End: When user closes app or goes to background
 * 
 * Storage Strategy: Local First + Event-Driven Sync
 * - All messages stored locally (no limit)
 * - User summary cached locally, refreshed after each session
 * - Batch sync to Supabase (every 10 messages or 5 minutes)
 * 
 * OPTIMIZED: Messages link directly to user_id (no conversations table)
 */

const CHAT_KEYS = {
  MESSAGES: '@chat_messages',
  USER_SUMMARY: '@user_summary',
  LAST_MESSAGE_SYNC: '@last_message_sync',
  PENDING_MESSAGES: '@pending_messages',
  LAST_SUMMARY_UPDATE: '@last_summary_update',
  MESSAGES_SINCE_SUMMARY: '@messages_since_summary',
};

const CONVERSATION_GAP_HOURS = 4;
const MAX_CONVERSATION_MESSAGES = 50;
const SYNC_BATCH_SIZE = 10;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

class ChatService {
  constructor() {
    this.pendingMessages = [];
    this.lastSyncTime = 0;
  }

  /**
   * Save a message locally
   * Per MVP: "All messages stored locally (no limit)"
   */
  async saveMessage(message) {
    try {
      const messages = await this.getAllMessages();
      const newMessage = {
        id: Date.now().toString(),
        message: message.message,
        isUser: message.isUser,
        createdAt: new Date().toISOString(),
      };
      
      messages.push(newMessage);
      await AsyncStorage.setItem(CHAT_KEYS.MESSAGES, JSON.stringify(messages));
      
      // Add to pending sync queue
      this.pendingMessages.push(newMessage);
      
      // Increment messages since last summary
      await this.incrementMessagesSinceSummary();
      
      // Check if we should batch sync
      if (this.pendingMessages.length >= SYNC_BATCH_SIZE) {
        this.syncMessagesToCloud(); // Don't await - async
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  /**
   * Get all messages from local storage
   */
  async getAllMessages() {
    try {
      const data = await AsyncStorage.getItem(CHAT_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Get current conversation (messages with gaps < 4 hours)
   * Per MVP: "Conversation: Messages with gaps < 4 hours between them"
   */
  async getCurrentConversation() {
    try {
      const allMessages = await this.getAllMessages();
      if (allMessages.length === 0) return [];
      
      const result = [];
      let previousTime = new Date();
      
      // Work backwards from most recent
      for (let i = allMessages.length - 1; i >= 0; i--) {
        const msg = allMessages[i];
        const msgTime = new Date(msg.createdAt);
        const gapHours = (previousTime - msgTime) / (1000 * 60 * 60);
        
        // Gap > 4 hours = different conversation
        if (gapHours > CONVERSATION_GAP_HOURS) break;
        
        result.unshift(msg);
        previousTime = msgTime;
        
        // Cap at 50 messages
        if (result.length >= MAX_CONVERSATION_MESSAGES) break;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  }

  /**
   * Get user summary (cached locally)
   * Per MVP: "User Summary: ~500 words, preferences, patterns, achievements"
   */
  async getUserSummary() {
    try {
      const cached = await AsyncStorage.getItem(CHAT_KEYS.USER_SUMMARY);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Try to fetch from Supabase if authenticated
      const session = await getSession();
      if (session?.user?.id && isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('user_summaries')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (!error && data) {
          await AsyncStorage.setItem(CHAT_KEYS.USER_SUMMARY, JSON.stringify(data));
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user summary:', error);
      return null;
    }
  }

  /**
   * Increment messages since last summary update
   */
  async incrementMessagesSinceSummary() {
    try {
      const count = await AsyncStorage.getItem(CHAT_KEYS.MESSAGES_SINCE_SUMMARY);
      const newCount = (parseInt(count, 10) || 0) + 1;
      await AsyncStorage.setItem(CHAT_KEYS.MESSAGES_SINCE_SUMMARY, newCount.toString());
      return newCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get messages since last summary update
   */
  async getMessagesSinceSummary() {
    try {
      const count = await AsyncStorage.getItem(CHAT_KEYS.MESSAGES_SINCE_SUMMARY);
      return parseInt(count, 10) || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Sync messages to Supabase
   * OPTIMIZED: Messages link directly to user_id (no conversations table)
   * Per MVP: "Batch of 10 or 5 min" sync triggers
   */
  async syncMessagesToCloud() {
    if (!isSupabaseConfigured()) return;
    
    const session = await getSession();
    if (!session?.user?.id) return;
    
    if (this.pendingMessages.length === 0) return;
    
    try {
      const userId = session.user.id;
      
      // Prepare messages for insert (direct to user, no conversation needed)
      const messagesToSync = this.pendingMessages.map(msg => ({
        user_id: userId,
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.message,
        created_at: msg.createdAt,
      }));
      
      const { error } = await supabase
        .from('messages')
        .insert(messagesToSync);
      
      if (error) {
        console.error('Error syncing messages:', error);
        return;
      }
      
      // Clear pending messages
      this.pendingMessages = [];
      this.lastSyncTime = Date.now();
      
      console.log(`📱 Synced ${messagesToSync.length} messages to cloud`);
    } catch (error) {
      console.error('Error syncing messages:', error);
    }
  }

  /**
   * Fetch messages from cloud (for multi-device sync)
   * OPTIMIZED: Direct query by user_id, no joins needed
   */
  async fetchMessagesFromCloud(limit = 50) {
    if (!isSupabaseConfigured()) return [];
    
    const session = await getSession();
    if (!session?.user?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      // Convert to local format
      return (data || []).map(msg => ({
        id: msg.id,
        message: msg.content,
        isUser: msg.role === 'user',
        createdAt: msg.created_at,
      })).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Handle app going to background
   * Per MVP: "App goes to background = Sync immediately"
   */
  async onAppBackground() {
    console.log('📱 Chat: App going to background - syncing...');
    
    // 1. Sync pending messages
    await this.syncMessagesToCloud();
    
    // 2. Check if summary needs update
    const newMsgCount = await this.getMessagesSinceSummary();
    
    if (newMsgCount >= 10 && isSupabaseConfigured()) {
      const session = await getSession();
      if (session?.user?.id) {
        // Async call - don't block
        supabase.functions.invoke('update-user-summary', {
          body: { userId: session.user.id },
        }).then(() => {
          console.log('📱 User summary update triggered');
          AsyncStorage.setItem(CHAT_KEYS.MESSAGES_SINCE_SUMMARY, '0');
        }).catch(err => {
          console.log('📱 Summary update skipped:', err.message);
        });
      }
    }
  }

  /**
   * Handle leaving chat screen
   * Per MVP: "User leaves chat screen = Sync remaining"
   */
  async onLeaveChatScreen() {
    if (this.pendingMessages.length > 0) {
      await this.syncMessagesToCloud();
    }
  }

  /**
   * Clear all chat data (for privacy/data deletion)
   */
  async clearAllChatData() {
    try {
      await AsyncStorage.multiRemove([
        CHAT_KEYS.MESSAGES,
        CHAT_KEYS.USER_SUMMARY,
        CHAT_KEYS.LAST_MESSAGE_SYNC,
        CHAT_KEYS.PENDING_MESSAGES,
        CHAT_KEYS.LAST_SUMMARY_UPDATE,
        CHAT_KEYS.MESSAGES_SINCE_SUMMARY,
      ]);
      
      this.pendingMessages = [];
      console.log('📱 Chat data cleared');
    } catch (error) {
      console.error('Error clearing chat data:', error);
    }
  }
}

export default new ChatService();
