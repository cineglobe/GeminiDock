import React, { useState, useEffect, useRef } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { useStore } from './store';
import { Plus, Settings } from 'lucide-react';
import type { FileAttachment } from './types';

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 data from the data URL
        const base64Data = reader.result.split(',')[1];
        if (base64Data) {
          resolve(base64Data);
        } else {
          reject(new Error('Failed to extract base64 data'));
        }
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sidebarTimeout = useRef<number | null>(null);
  const {
    chats,
    currentChatId,
    settings,
    setApiKey,
    setTheme,
    setDefaultModel,
    setAnimationsEnabled,
    setAnimationSpeed,
    setAnimationQuality,
    addChat,
    updateChat,
    deleteAllChats,
    setCurrentChat,
  } = useStore();

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  useEffect(() => {
    if (chats.length === 0) {
      handleNewChat();
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.clientX <= 20) {
      if (sidebarTimeout.current !== null) {
        clearTimeout(sidebarTimeout.current);
        sidebarTimeout.current = null;
      }
      setIsSidebarOpen(true);
    } else if (e.clientX > 256 && isSidebarOpen) {
      sidebarTimeout.current = window.setTimeout(() => {
        setIsSidebarOpen(false);
      }, 300);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: Math.random().toString(36).substring(7),
      title: 'New Chat',
      messages: [],
      model: 'gemini-2.0-flash', // Always use Gemini 2.0 Flash
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addChat(newChat);
  };

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentChat || !settings.apiKey) return;

    // Create user message
    const userMessage = {
      id: Math.random().toString(36).substring(7),
      content,
      role: 'user' as const,
      timestamp: Date.now(),
      attachments,
    };

    // Add user message to chat immediately for better UX
    updateChat(currentChat.id, {
      messages: [...currentChat.messages, userMessage],
      updatedAt: Date.now(),
    });

    // Update title for new chats
    if (currentChat.messages.length === 0) {
      const title = content.split(' ').slice(0, 5).join(' ');
      updateChat(currentChat.id, { title });
    }

    // Start loading state
    setIsLoading(true);

    try {
      // Prepare the request to Gemini API
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.apiKey}`;
      
      // Create the content array for the request
      const contentArray = [];
      
      // Process image attachments first if any
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.type === 'image') {
            try {
              // Convert file to base64 using ArrayBuffer for better compatibility
              const base64Data = await fileToBase64(attachment.file);
              
              // Add the image as inlineData with the correct format
              contentArray.push({
                inlineData: {
                  mimeType: attachment.file.type,
                  data: base64Data
                }
              });
            } catch (error) {
              console.error('Error processing image:', error);
            }
          }
        }
      }
      
      // Add text content after images (as recommended in the docs)
      if (content.trim()) {
        contentArray.push({ text: content });
      } else if (contentArray.length === 0) {
        // If no content and no images, add a placeholder
        contentArray.push({ text: "Please analyze these images." });
      }
      
      // Prepare the request body with the correct format
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: contentArray
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };
      
      // Add conversation history if available
      if (currentChat.messages.length > 0) {
        const history = [];
        // Only use the last 5 messages for context
        const contextMessages = currentChat.messages.slice(-5);
        
        for (const msg of contextMessages) {
          // Skip messages with attachments in history to save tokens
          if (!msg.attachments || msg.attachments.length === 0) {
            history.push({
              role: msg.role,
              parts: [{ text: msg.content }]
            });
          }
        }
        
        if (history.length > 0) {
          requestBody.contents = [...history, requestBody.contents[0]];
        }
      }

      console.log('Sending request to Gemini API:', JSON.stringify(requestBody, null, 2));

      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!response.ok) {
        let errorMessage = `API Error: Status ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = `API Error: ${errorData.error?.message || response.statusText}`;
          console.error('Gemini API error response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', responseText);
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log('Gemini API response:', data);
      
      // Extract the response text
      const modelResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from the model.';

      // Create assistant message
      const assistantMessage = {
        id: Math.random().toString(36).substring(7),
        content: modelResponse,
        role: 'assistant' as const,
        timestamp: Date.now(),
      };

      // Update chat with assistant response
      updateChat(currentChat.id, {
        messages: [...currentChat.messages, userMessage, assistantMessage],
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Create error message
      const errorMessage = {
        id: Math.random().toString(36).substring(7),
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from Gemini API'}`,
        role: 'assistant' as const,
        timestamp: Date.now(),
      };

      // Update chat with error message
      updateChat(currentChat.id, {
        messages: [...currentChat.messages, userMessage, errorMessage],
        updatedAt: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportChats = () => {
    const dataStr = JSON.stringify(chats, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportName = `geminidock-chats-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  return (
    <div 
      className={`h-screen flex ${settings.theme === 'dark' ? 'dark' : 'light'}`}
      onMouseMove={handleMouseMove}
    >
      <div 
        className={`fixed top-0 left-0 h-screen sidebar-transition ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}
        style={{ width: '256px', zIndex: 50 }}
      >
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChat}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          model={settings.defaultModel}
          onChangeModel={setDefaultModel}
          onToggleSidebar={() => setIsSidebarOpen(false)}
        />
      </div>

      {!isSidebarOpen && (
        <button
          onClick={handleNewChat}
          className="fixed top-4 left-4 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors z-40 shadow-lg"
        >
          <Plus size={20} />
        </button>
      )}

      <main className="flex-1 bg-gray-800 dark:bg-gray-900 p-4 ml-0">
        {!settings.apiKey ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
              <h2 className="text-xl font-bold mb-2">API Key Required</h2>
              <p>Please enter your Gemini API key in the settings to start chatting.</p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="mt-4 bg-white text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Open Settings
              </button>
            </div>
          </div>
        ) : currentChat ? (
          <ChatWindow
            messages={currentChat.messages}
            onSendMessage={handleSendMessage}
            model={currentChat.model}
            onChangeModel={(model) => updateChat(currentChat.id, { model })}
            isSidebarOpen={isSidebarOpen}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isLoading={isLoading}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Select a chat or start a new one</p>
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(updates) => {
          if (updates.apiKey !== undefined) setApiKey(updates.apiKey);
          if (updates.theme !== undefined) setTheme(updates.theme);
          if (updates.defaultModel !== undefined) setDefaultModel(updates.defaultModel);
          if (updates.animationsEnabled !== undefined) setAnimationsEnabled(updates.animationsEnabled);
          if (updates.animationSpeed !== undefined) setAnimationSpeed(updates.animationSpeed);
          if (updates.animationQuality !== undefined) setAnimationQuality(updates.animationQuality);
        }}
        onExportChats={handleExportChats}
        onDeleteAllChats={deleteAllChats}
      />
    </div>
  );
}

export default App;