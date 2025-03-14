import type { Chat } from '../types';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Directory for storing chats
const CHATS_DIRECTORY = 'chats';

/**
 * Export all chats as a zip file
 */
export const exportChatsAsZip = async (chats: Chat[]): Promise<void> => {
  try {
    const zip = new JSZip();
    const chatsFolder = zip.folder(CHATS_DIRECTORY);
    
    if (!chatsFolder) {
      throw new Error('Failed to create chats folder in zip');
    }
    
    // Add each chat as a separate file
    chats.forEach(chat => {
      const chatData = JSON.stringify(chat, null, 2);
      chatsFolder.file(`${chat.id}.json`, chatData);
    });
    
    // Add an index file with all chat IDs
    const chatIndex = {
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }))
    };
    
    chatsFolder.file('index.json', JSON.stringify(chatIndex, null, 2));
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Save the zip file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveAs(content, `geminidock-chats-${timestamp}.zip`);
    
    console.log(`Exported ${chats.length} chats to zip file`);
  } catch (error) {
    console.error('Error exporting chats to zip:', error);
    throw error;
  }
};

/**
 * Import chats from a zip file
 */
export const importChatsFromZip = async (): Promise<Chat[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve([]);
        return;
      }
      
      try {
        const zipFile = files[0];
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);
        
        const chats: Chat[] = [];
        const promises: Promise<void>[] = [];
        
        // Process each file in the zip
        zipContent.forEach((relativePath, zipEntry) => {
          // Skip directories and the index file
          if (zipEntry.dir || relativePath.endsWith('index.json')) {
            return;
          }
          
          // Only process JSON files in the chats directory
          if (relativePath.startsWith(CHATS_DIRECTORY) && relativePath.endsWith('.json')) {
            const promise = zipEntry.async('string').then(content => {
              try {
                const chatData = JSON.parse(content);
                if (chatData.id && chatData.messages) {
                  chats.push(chatData);
                }
              } catch (error) {
                console.error(`Error parsing chat file ${relativePath}:`, error);
              }
            });
            
            promises.push(promise);
          }
        });
        
        // Wait for all files to be processed
        await Promise.all(promises);
        
        resolve(chats);
      } catch (error) {
        console.error('Error importing chats from zip:', error);
        reject(error);
      }
    };
    
    input.click();
  });
};

/**
 * Open file dialog to import individual chat files
 * This is kept for backward compatibility
 */
export const importChatsFromFile = async (): Promise<Chat[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve([]);
        return;
      }
      
      try {
        const chats: Chat[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const text = await file.text();
          const data = JSON.parse(text);
          
          // Check if this is a single chat or an array of chats
          if (Array.isArray(data)) {
            chats.push(...data);
          } else if (data.id && data.messages) {
            chats.push(data);
          }
        }
        
        resolve(chats);
      } catch (error) {
        console.error('Error importing chats:', error);
        reject(error);
      }
    };
    
    input.click();
  });
}; 