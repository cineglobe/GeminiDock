import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Send, Image, FileAudio, FileText, X, Settings, Loader, ZoomIn } from 'lucide-react';
import type { FileAttachment, Message, Model, TextSize } from '../types';
import { MessageItem } from './MessageItem';
import { convertPdfToImages, createFilesFromDataUrls } from '../utils/pdfUtils';
import { LoadingAnimation } from './LoadingAnimation';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  model: Model;
  onChangeModel: (model: Model) => void;
  isSidebarOpen: boolean;
  onOpenSettings: () => void;
  isLoading: boolean;
  chatTitle: string;
  textSize: TextSize;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  model,
  onChangeModel,
  isSidebarOpen,
  onOpenSettings,
  isLoading,
  chatTitle,
  textSize,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dropzoneError, setDropzoneError] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, [attachments]);

  // Process PDF files
  const handlePdfFile = async (file: File) => {
    try {
      setIsProcessingPdf(true);
      setDropzoneError('Converting PDF to images... This may take a moment.');
      
      // Convert PDF to images
      const imageDataUrls = await convertPdfToImages(file);
      
      // Create File objects from the data URLs
      const imageFiles = createFilesFromDataUrls(imageDataUrls, file.name.replace('.pdf', ''));
      
      // Create FileAttachment objects for each image
      const imageAttachments: FileAttachment[] = imageFiles.map(imageFile => ({
        id: Math.random().toString(36).substring(7),
        file: imageFile,
        preview: URL.createObjectURL(imageFile),
        type: 'image'
      }));
      
      // Add all images from the PDF
      setAttachments(prev => [...prev, ...imageAttachments]);
      setDropzoneError(`Successfully converted PDF with ${imageAttachments.length} pages.`);
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setDropzoneError(null);
      }, 3000);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setDropzoneError(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Configure dropzone for file uploads
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB max size
    noClick: true, // Prevent opening file dialog when clicking the dropzone
    onDrop: async (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setDropzoneError('File is too large. Maximum size is 5MB.');
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setDropzoneError('Invalid file type. Only PNG, JPEG, WEBP, HEIC, HEIF, PDF, and audio files are supported.');
        } else {
          setDropzoneError('File upload failed: ' + rejection.errors[0].message);
        }
        return;
      }

      // Process accepted files
      const newAttachments: FileAttachment[] = [];
      
      for (const file of acceptedFiles) {
        if (file.type === 'application/pdf') {
          // Handle PDF files separately
          await handlePdfFile(file);
        } else {
          let type: 'image' | 'pdf' | 'audio';
          
          if (file.type.startsWith('image/')) {
            type = 'image';
          } else if (file.type === 'application/pdf') {
            type = 'pdf';
          } else {
            type = 'audio';
          }
          
          newAttachments.push({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            type
          });
        }
      }
      
      // Add non-PDF attachments
      if (newAttachments.length > 0) {
        setAttachments(prev => [...prev, ...newAttachments]);
        setDropzoneError(null);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((inputValue.trim() || attachments.length > 0) && !isLoading && !isProcessingPdf) {
      onSendMessage(inputValue, attachments.length > 0 ? attachments : undefined);
      setInputValue('');
      setAttachments([]);
      setDropzoneError(null);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment && attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
    
    if (!attachments.filter(a => a.type === 'pdf' && a.id !== id).length) {
      setDropzoneError(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center flex-1 mr-4 overflow-hidden">
          <h2 className="text-xl font-semibold text-white truncate w-full">
            {chatTitle || 'New Chat'}
          </h2>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-gray-400 hover:text-white flex-shrink-0"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <MessageItem 
            key={message.id} 
            message={message} 
            onExpandImage={(url: string) => setExpandedImage(url)}
            onRegenerateResponse={
              message.role === 'assistant' && index === messages.length - 1 && messages.length > 1
                ? () => {
                    // Remove the last message (AI response) and send the last user message again
                    const lastUserMessage = messages
                      .slice(0, -1)
                      .filter(msg => msg.role === 'user')
                      .pop();
                    
                    if (lastUserMessage) {
                      onSendMessage(lastUserMessage.content, lastUserMessage.attachments);
                    }
                  }
                : undefined
            }
            textSize={textSize}
          />
        ))}
        
        {/* Loading animation */}
        <LoadingAnimation isVisible={isLoading} />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Expanded image modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
              onClick={() => setExpandedImage(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={expandedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="relative">
          {/* File dropzone area - only shows border when dragging */}
          <div 
            {...getRootProps()} 
            className={`rounded-lg transition-colors ${
              isDragActive ? 'border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-10' : 'border-0'
            }`}
          >
            <input {...getInputProps()} />
            
            {/* Display attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2">
                {attachments.map((attachment) => (
                  <div 
                    key={attachment.id} 
                    className="relative group"
                  >
                    {attachment.type === 'image' ? (
                      <div className="w-16 h-16 relative">
                        <img 
                          src={attachment.preview} 
                          alt={attachment.file.name}
                          className="w-16 h-16 object-cover rounded border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : attachment.type === 'pdf' ? (
                      <div className="w-16 h-16 flex items-center justify-center bg-red-900 rounded border border-gray-600 text-white text-xs">
                        PDF
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-blue-900 rounded border border-gray-600 text-white text-xs">
                        AUDIO
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Processing indicator */}
            {isProcessingPdf && (
              <div className="flex items-center justify-center p-4 text-blue-400">
                <Loader className="animate-spin mr-2" size={20} />
                <span>Converting PDF to images...</span>
              </div>
            )}

            {/* Error message */}
            {dropzoneError && (
              <div className={`text-sm mb-2 p-2 ${
                dropzoneError.startsWith('Note:') || 
                dropzoneError.startsWith('Converting') || 
                dropzoneError.startsWith('Successfully')
                  ? 'text-yellow-500' 
                  : 'text-red-500'
              }`}>
                {dropzoneError}
              </div>
            )}

            {/* Input area */}
            <div className="flex items-end p-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={attachments.length > 0 ? "Add a message or drop files here..." : "Type a message or drop files here..."}
                className="flex-1 bg-gray-700 text-white rounded-lg p-3 min-h-[50px] max-h-[200px] resize-none"
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={open}
                className="ml-2 bg-gray-700 text-gray-300 hover:text-white p-3 rounded-lg"
                title="Attach files"
                disabled={isProcessingPdf || isLoading}
              >
                <Image size={20} />
              </button>
              <button
                type="submit"
                disabled={isLoading || isProcessingPdf || (inputValue.trim() === '' && attachments.length === 0)}
                className={`ml-2 p-3 rounded-lg ${
                  isLoading || isProcessingPdf || (inputValue.trim() === '' && attachments.length === 0)
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title="Send message"
              >
                {isProcessingPdf ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
          
          {/* Dropzone hint */}
          <div className="text-gray-400 text-xs mt-1 text-center">
            Drop files here or click the attachment button. Supported formats: PNG, JPEG, WEBP, HEIC, HEIF, PDF, audio (max 5MB)
          </div>
        </div>
      </form>
    </div>
  );
};