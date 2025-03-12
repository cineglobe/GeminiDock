import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  onExpandImage: (url: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onExpandImage }) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}
      >
        {message.attachments?.map((att) => (
          <div key={att.id} className="mb-2">
            {att.type === 'image' && (
              <div className="relative group">
                <img 
                  src={att.preview} 
                  alt="attachment" 
                  className="max-w-full max-h-32 rounded object-contain cursor-pointer" 
                  onClick={() => onExpandImage(att.preview)}
                />
              </div>
            )}
            {att.type === 'pdf' && (
              <div className="flex items-center text-sm">
                <span className="mr-2">📄</span>
                {att.file.name}
              </div>
            )}
            {att.type === 'audio' && (
              <div className="flex items-center text-sm">
                <span className="mr-2">🔊</span>
                {att.file.name}
              </div>
            )}
          </div>
        ))}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}; 