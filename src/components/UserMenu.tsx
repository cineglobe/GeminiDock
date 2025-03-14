import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Trash, Download } from 'lucide-react';
import { signOut, deleteAllUserChats } from '../utils/supabase';
import { exportChatsAsZip } from '../utils/fileStorage';
import type { Chat } from '../types';

interface UserMenuProps {
  userEmail: string;
  userId: string;
  chats: Chat[];
  onLogout: () => void;
  onDeleteAllChats: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  userEmail,
  userId,
  chats,
  onLogout,
  onDeleteAllChats,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAllChats = async () => {
    if (window.confirm('Are you sure you want to delete all your chats? This action cannot be undone.')) {
      try {
        await deleteAllUserChats(userId);
        onDeleteAllChats();
      } catch (error) {
        console.error('Error deleting chats:', error);
      }
    }
  };

  const handleDownloadChats = async () => {
    try {
      await exportChatsAsZip(chats);
    } catch (error) {
      console.error('Error downloading chats:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        title="Account"
      >
        <User size={20} className="text-gray-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-700">
              <div className="font-medium text-white truncate">{userEmail}</div>
              <div className="text-xs text-gray-400 mt-1">Logged in</div>
            </div>

            <div className="p-2">
              <button
                onClick={handleDownloadChats}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                <Download size={16} />
                <span>Download Chats</span>
              </button>

              <button
                onClick={handleDeleteAllChats}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                <Trash size={16} />
                <span>Delete All Chats</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 