import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Settings, Model, Theme, AnimationQuality } from '../types';

interface State {
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
  setApiKey: (key: string) => void;
  setTheme: (theme: Theme) => void;
  setDefaultModel: (model: Model) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationQuality: (quality: AnimationQuality) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, chat: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  deleteAllChats: () => void;
  setCurrentChat: (chatId: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      chats: [],
      currentChatId: null,
      settings: {
        defaultModel: 'gemini-1.5-pro',
        theme: 'dark',
        animationsEnabled: true,
        animationSpeed: 1,
        animationQuality: 'medium',
        apiKey: '',
      },
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
          settings: { ...state.settings, animationsEnabled: enabled },
        })),
      setAnimationSpeed: (speed) =>
        set((state) => ({
          settings: { ...state.settings, animationSpeed: speed },
        })),
      setAnimationQuality: (quality) =>
        set((state) => ({
          settings: { ...state.settings, animationQuality: quality },
        })),
      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
          currentChatId: chat.id,
        })),
      updateChat: (chatId, updates) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, ...updates } : chat
          ),
        })),
      deleteChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          currentChatId:
            state.currentChatId === chatId
              ? state.chats[0]?.id || null
              : state.currentChatId,
        })),
      deleteAllChats: () =>
        set({
          chats: [],
          currentChatId: null,
        }),
      setCurrentChat: (chatId) =>
        set({
          currentChatId: chatId,
        }),
    }),
    {
      name: 'ai-chat-storage',
    }
  )
);