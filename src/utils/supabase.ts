import { createClient } from '@supabase/supabase-js';
import type { Chat, User } from '../types';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User authentication functions
export const signUp = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }

  if (data.user) {
    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  }

  return null;
};

export const signIn = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  if (data.user) {
    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  }

  return null;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  if (data.user) {
    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  }

  return null;
};

// User settings functions
export const saveApiKey = async (userId: string, apiKey: string): Promise<void> => {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ 
      user_id: userId, 
      api_key: apiKey,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
};

export const loadApiKey = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('api_key')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found for this user
      return null;
    }
    console.error('Error loading API key:', error);
    throw error;
  }

  return data?.api_key || null;
};

// Chat data functions
export const saveChatsToSupabase = async (chats: Chat[], userId: string): Promise<void> => {
  // First, delete all existing chats for this user
  const { error: deleteError } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error deleting existing chats:', deleteError);
    throw deleteError;
  }

  // Then insert all current chats
  if (chats.length > 0) {
    const chatsWithUserId = chats.map(chat => ({
      id: chat.id,
      user_id: userId,
      chat_data: chat,
    }));

    const { error: insertError } = await supabase
      .from('chats')
      .insert(chatsWithUserId);

    if (insertError) {
      console.error('Error saving chats to Supabase:', insertError);
      throw insertError;
    }
  }
};

export const loadChatsFromSupabase = async (userId: string): Promise<Chat[]> => {
  const { data, error } = await supabase
    .from('chats')
    .select('chat_data')
    .eq('user_id', userId);

  if (error) {
    console.error('Error loading chats from Supabase:', error);
    throw error;
  }

  return data?.map(item => item.chat_data as Chat) || [];
};

export const deleteAllUserChats = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting all user chats:', error);
    throw error;
  }
}; 