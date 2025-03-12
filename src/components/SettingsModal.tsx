import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders } from 'lucide-react';
import type { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onExportChats: () => void;
  onDeleteAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportChats,
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
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
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

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Animation Settings
                </label>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Enable Animations</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.animationsEnabled}
                      onChange={(e) =>
                        onUpdateSettings({ animationsEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {settings.animationsEnabled && (
                  <>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Animation Speed</span>
                        <span className="text-sm text-gray-400">{settings.animationSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.animationSpeed}
                        onChange={(e) => onUpdateSettings({ animationSpeed: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Animation Quality</span>
                        <span className="text-sm text-gray-400">{settings.animationQuality}</span>
                      </div>
                      <select
                        value={settings.animationQuality}
                        onChange={(e) => onUpdateSettings({ animationQuality: e.target.value as any })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-700">
                <button
                  onClick={onExportChats}
                  className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                >
                  Export Chats
                </button>
                <button
                  onClick={onDeleteAllChats}
                  className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition-colors"
                >
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