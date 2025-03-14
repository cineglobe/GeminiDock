import React, { useState, useEffect, useRef } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { AuthForm } from './components/AuthForm';
import { UserMenu } from './components/UserMenu';
import { useStore } from './store';
import { Plus, Settings } from 'lucide-react';
import type { FileAttachment, Chat, User } from './types';
import { getCurrentUser, loadApiKey, saveApiKey } from './utils/supabase';
import { exportChatsAsZip, importChatsFromZip } from './utils/fileStorage';

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
  const [isInitializing, setIsInitializing] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const sidebarTimeout = useRef<number | null>(null);
  const {
    user,
    setUser,
    chats,
    currentChatId,
    settings,
    setApiKey,
    setTheme,
    setDefaultModel,
    setSidebarAutoHide,
    setTextSize,
    addChat,
    updateChat,
    deleteAllChats,
    setCurrentChat,
    loadChats,
    setChats,
  } = useStore();

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  // Check for existing user session on load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          
          // Load user's API key from Supabase
          const apiKey = await loadApiKey(currentUser.id);
          if (apiKey) {
            setApiKey(apiKey);
          }
          
          await loadChats();
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkUser();
  }, []);

  // Create a new chat if there are none
  useEffect(() => {
    if (!isInitializing && user && chats.length === 0) {
      handleNewChat();
    }
  }, [isInitializing, user, chats.length]);

  // Fix for image previews when switching chats
  useEffect(() => {
    if (currentChat) {
      // Ensure all attachments have valid previews
      currentChat.messages.forEach(message => {
        if (message.attachments) {
          message.attachments.forEach(attachment => {
            // Check if the preview is a blob URL that's no longer valid
            if (attachment.preview.startsWith('blob:') && !isValidBlobUrl(attachment.preview)) {
              // Regenerate the preview
              if (attachment.file) {
                attachment.preview = URL.createObjectURL(attachment.file);
              }
            }
          });
        }
      });
    }
  }, [currentChatId, currentChat]);

  // Helper function to check if a blob URL is valid
  const isValidBlobUrl = (url: string): boolean => {
    try {
      // Try to create an image element with the URL
      const img = new Image();
      img.src = url;
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only auto-hide if the setting is enabled
    if (!settings.sidebarAutoHide) return;
    
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

  // Reset sidebar visibility when sidebarAutoHide setting changes
  useEffect(() => {
    if (!settings.sidebarAutoHide) {
      setIsSidebarOpen(true);
    }
  }, [settings.sidebarAutoHide]);

  const handleNewChat = () => {
    const newChat = {
      id: Math.random().toString(36).substring(7),
      title: 'New Chat',
      messages: [],
      model: 'gemini-2.0-flash' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTemporary: true, // Mark as temporary until a message is sent
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

    // If this is the first message in a temporary chat, mark it as permanent
    const isFirstMessage = currentChat.messages.length === 0;
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      updatedAt: Date.now(),
      isTemporary: false, // No longer temporary once a message is sent
    };

    // Update title for new chats
    if (isFirstMessage) {
      const title = content.split(' ').slice(0, 5).join(' ');
      updatedChat.title = title;
    }

    // Update chat with user message
    updateChat(currentChat.id, updatedChat);

    // Start loading state
    setIsLoading(true);

    try {
      let modelResponse = '';
      
      // Check if we have image attachments
      const imageAttachments = attachments?.filter(att => att.type === 'image') || [];
      
      if (imageAttachments.length > 0) {
        // If we have many images, we'll need to process them in batches
        const batchSize = 16; // Gemini API limit per request
        const batches = [];
        
        // Split images into batches of 16
        for (let i = 0; i < imageAttachments.length; i += batchSize) {
          batches.push(imageAttachments.slice(i, i + batchSize));
        }
        
        // Process each batch
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const batchContent = i === 0 
            ? content 
            : `Continue analyzing the remaining images (batch ${i + 1}/${batches.length})`;
          
          const batchResponse = await sendToGeminiAPI(batchContent, batch);
          modelResponse += (i > 0 ? '\n\n' : '') + batchResponse;
        }
      } else {
        // No images, just send the text
        modelResponse = await sendToGeminiAPI(content);
      }

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

  // Helper function to send requests to the Gemini API
  const sendToGeminiAPI = async (content: string, imageAttachments?: FileAttachment[]): Promise<string> => {
    // Prepare the request to Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.apiKey}`;
    
    // Create the content array for the request
    const contentArray = [];
    
    // Process image attachments first if any (Gemini API expects images before text)
    if (imageAttachments && imageAttachments.length > 0) {
      for (const attachment of imageAttachments) {
        try {
          // Convert file to base64
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
          throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Add conversation history if available (limited to save tokens)
    if (currentChat && currentChat.messages && currentChat.messages.length > 0) {
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from the model.';
  };

  const handleImportChats = async () => {
    try {
      const importedChats = await importChatsFromZip();
      if (importedChats.length > 0) {
        // Add imported chats to the existing chats
        setChats([...importedChats, ...chats]);
      }
    } catch (error) {
      console.error('Error importing chats:', error);
    }
  };

  const handleAuthSuccess = (user: User, isNewUser: boolean): void => {
    setUser(user);
    
    if (isNewUser) {
      setVerificationMessage("Please check your email to verify your account before continuing.");
    } else {
      // Load user's API key and chats
      loadApiKey(user.id)
        .then(apiKey => {
          if (apiKey) {
            setApiKey(apiKey);
          }
          return loadChats();
        })
        .catch(error => {
          console.error('Error loading user data:', error);
        });
      setVerificationMessage(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setChats([]); // Only clear local state, not database
    setVerificationMessage(null);
  };

  // Handle API key updates
  const handleUpdateSettings = async (updates: Partial<typeof settings>) => {
    // Update API key in Supabase if it has changed
    if (updates.apiKey !== undefined && updates.apiKey !== settings.apiKey && user) {
      try {
        await saveApiKey(user.id, updates.apiKey);
      } catch (error) {
        console.error('Error saving API key to Supabase:', error);
      }
    }
    
    // Update local settings
    if (updates.apiKey !== undefined) setApiKey(updates.apiKey);
    if (updates.theme !== undefined) setTheme(updates.theme);
    if (updates.defaultModel !== undefined) setDefaultModel(updates.defaultModel);
    if (updates.sidebarAutoHide !== undefined) setSidebarAutoHide(updates.sidebarAutoHide);
    if (updates.textSize !== undefined) setTextSize(updates.textSize);
  };

  // If not authenticated, show the auth form
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  // Show verification message if present
  if (verificationMessage) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
          <p className="mb-6">{verificationMessage}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen flex ${settings.theme === 'dark' ? 'dark' : 'light'} relative`}
      onMouseMove={settings.sidebarAutoHide ? handleMouseMove : undefined}
    >
      {/* Version indicator */}
      <div className="absolute bottom-2 left-2 text-gray-600 text-xs opacity-50 z-10">
        Version 1.0
      </div>
      
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
          sidebarAutoHide={settings.sidebarAutoHide}
        />
      </div>

      <main className={`flex-1 bg-gray-800 dark:bg-gray-900 p-4 ${isSidebarOpen && !settings.sidebarAutoHide ? 'ml-64' : 'ml-0'}`}>
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
          <div className="relative h-full">
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <UserMenu
                userEmail={user.email}
                userId={user.id}
                chats={chats}
                onLogout={handleLogout}
                onDeleteAllChats={deleteAllChats}
              />
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                title="Settings"
              >
                <Settings size={20} className="text-gray-300" />
              </button>
            </div>
            
            <ChatWindow
              messages={currentChat.messages}
              onSendMessage={handleSendMessage}
              model={currentChat.model}
              onChangeModel={(model) => updateChat(currentChat.id, { model })}
              isSidebarOpen={isSidebarOpen}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isLoading={isLoading}
              chatTitle={currentChat.title}
              textSize={settings.textSize}
            />
          </div>
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
        onUpdateSettings={handleUpdateSettings}
        onDeleteAllChats={deleteAllChats}
      />
    </div>
  );
}

export default App;