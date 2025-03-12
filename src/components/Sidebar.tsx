import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Settings, Trash2, ChevronLeft } from 'lucide-react';
import type { Chat, Model } from '../types';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  model: Model;
  onChangeModel: (model: Model) => void;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onOpenSettings,
  model,
  onChangeModel,
  onToggleSidebar,
}) => {
  return (
    <motion.div 
      className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col h-full relative"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-white">GeminiDock</h1>
        <button
          onClick={onToggleSidebar}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      
      <button
        onClick={onNewChat}
        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-lg px-4 py-2 mb-6 hover:bg-blue-700 transition-colors btn-hover-effect"
      >
        <Plus size={18} />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map((chat) => (
          <motion.button
            key={chat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left ${
              chat.id === currentChatId
                ? 'bg-slate-800 text-white'
                : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            <MessageSquare size={16} />
            <span className="truncate flex-1">{chat.title}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 space-y-3 pt-4 border-t border-slate-800">
        <select
          value={model}
          onChange={(e) => onChangeModel(e.target.value as Model)}
          className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
        >
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
        </select>

        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center gap-2 w-full text-gray-300 hover:bg-slate-800 rounded-lg px-4 py-2 transition-colors"
        >
          <Settings size={18} />
          Settings
        </button>
      </div>
    </motion.div>
  );
};