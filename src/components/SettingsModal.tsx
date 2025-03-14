import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Trash } from 'lucide-react';
import type { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onDeleteAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDeleteAllChats,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-xl p-6 w-[500px] max-w-full border border-gray-700 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sliders size={20} />
                Settings
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your Gemini API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Model
                </label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) =>
                    onUpdateSettings({ defaultModel: e.target.value as any })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    onUpdateSettings({ theme: e.target.value as any })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Auto-hide Sidebar
                </label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.sidebarAutoHide}
                    onChange={(e) =>
                      onUpdateSettings({ sidebarAutoHide: e.target.checked })
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Text Size
                  </label>
                  <span className="text-xs text-gray-400">
                    {settings.textSize === 'smaller' ? 'Smaller' : 
                     settings.textSize === 'default' ? 'Default' : 'Larger'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">A</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    value={settings.textSize === 'smaller' ? 0 : settings.textSize === 'default' ? 1 : 2}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const size = value === 0 ? 'smaller' : value === 1 ? 'default' : 'larger';
                      onUpdateSettings({ textSize: size as any });
                    }}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-base font-bold text-gray-400">A</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-700">
                <button
                  onClick={onDeleteAllChats}
                  className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash size={16} />
                  Delete All Chats
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};