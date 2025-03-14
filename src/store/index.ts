import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Settings, Model, Theme, AnimationQuality, TextSize, User } from '../types';
import { saveChatsToSupabase, loadChatsFromSupabase } from '../utils/supabase';

interface State {
  user: User | null;
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
  setUser: (user: User | null) => void;
  setApiKey: (key: string) => void;
  setTheme: (theme: Theme) => void;
  setDefaultModel: (model: Model) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationQuality: (quality: AnimationQuality) => void;
  setSidebarAutoHide: (enabled: boolean) => void;
  setTextSize: (size: TextSize) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, chat: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  deleteAllChats: () => void;
  setCurrentChat: (chatId: string) => void;
  saveChats: () => Promise<void>;
  loadChats: () => Promise<void>;
  setChats: (chats: Chat[]) => void;
}

// Only persist settings in localStorage, not chats
export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      chats: [],
      currentChatId: null,
      settings: {
        defaultModel: 'gemini-2.0-flash',
        theme: 'dark',
        animationsEnabled: true,
        animationSpeed: 1,
        animationQuality: 'medium',
        apiKey: '',
        sidebarAutoHide: false,
        textSize: 'default',
      },
      setUser: (user) => set({ user }),
      setApiKey: (key) =>
        set((state) => ({
          settings: { ...state.settings, apiKey: key },
        })),
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
      setDefaultModel: (model) =>
        set((state) => ({
          settings: { ...state.settings, defaultModel: model },
        })),
      setAnimationsEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, animationsEnabled: true },
        })),
      setAnimationSpeed: (speed) =>
        set((state) => ({
          settings: { ...state.settings, animationSpeed: speed },
        })),
      setAnimationQuality: (quality) =>
        set((state) => ({
          settings: { ...state.settings, animationQuality: quality },
        })),
      setSidebarAutoHide: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, sidebarAutoHide: enabled },
        })),
      setTextSize: (size) =>
        set((state) => ({
          settings: { ...state.settings, textSize: size },
        })),
      addChat: (chat) => {
        set((state) => {
          const newChats = [chat, ...state.chats];
          
          // Only save non-temporary chats to Supabase
          if (state.user && !chat.isTemporary) {
            const permanentChats = newChats.filter(c => !c.isTemporary);
            saveChatsToSupabase(permanentChats, state.user.id).catch(console.error);
          }
          
          return {
            chats: newChats,
            currentChatId: chat.id,
          };
        });
      },
      updateChat: (chatId, updates) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, ...updates } : chat
          );
          
          // Only save non-temporary chats to Supabase
          if (state.user) {
            const permanentChats = updatedChats.filter(c => !c.isTemporary);
            saveChatsToSupabase(permanentChats, state.user.id).catch(console.error);
          }
          
          return {
            chats: updatedChats,
          };
        });
      },
      deleteChat: (chatId) => {
        set((state) => {
          const filteredChats = state.chats.filter((chat) => chat.id !== chatId);
          
          // Only save non-temporary chats to Supabase
          if (state.user) {
            const permanentChats = filteredChats.filter(c => !c.isTemporary);
            saveChatsToSupabase(permanentChats, state.user.id).catch(console.error);
          }
          
          return {
            chats: filteredChats,
            currentChatId:
              state.currentChatId === chatId
                ? filteredChats[0]?.id || null
                : state.currentChatId,
          };
        });
      },
      deleteAllChats: () => {
        set((state) => {
          // Clear chats from Supabase if user is logged in
          if (state.user) {
            saveChatsToSupabase([], state.user.id).catch(console.error);
          }
          return {
            chats: [],
            currentChatId: null,
          };
        });
      },
      setCurrentChat: (chatId) =>
        set({
          currentChatId: chatId,
        }),
      saveChats: async () => {
        const { chats, user } = get();
        if (user) {
          // Only save non-temporary chats to Supabase
          const permanentChats = chats.filter(c => !c.isTemporary);
          await saveChatsToSupabase(permanentChats, user.id);
        }
      },
      loadChats: async () => {
        const { user } = get();
        if (user) {
          try {
            const loadedChats = await loadChatsFromSupabase(user.id);
            set({
              chats: loadedChats,
              currentChatId: loadedChats.length > 0 ? loadedChats[0].id : null,
            });
          } catch (error) {
            console.error('Error loading chats:', error);
          }
        }
      },
      setChats: (chats) => {
        set((state) => {
          // Only save non-temporary chats to Supabase
          if (state.user) {
            const permanentChats = chats.filter(c => !c.isTemporary);
            saveChatsToSupabase(permanentChats, state.user.id).catch(console.error);
          }
          return {
            chats,
            currentChatId: chats.length > 0 ? chats[0].id : null,
          };
        });
      },
    }),
    {
      name: 'ai-chat-settings', // Only store settings in localStorage
      partialize: (state) => ({ settings: state.settings }), // Only persist settings
    }
  )
);