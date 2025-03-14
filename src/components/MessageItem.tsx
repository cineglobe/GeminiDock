import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Bot, User, RefreshCw, Copy, Check, ClipboardCopy } from 'lucide-react';
import type { TextSize } from '../types';

interface MessageItemProps {
  message: Message;
  onExpandImage: (url: string) => void;
  onRegenerateResponse?: () => void;
  textSize?: TextSize;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onExpandImage,
  onRegenerateResponse,
  textSize = 'medium'
}) => {
  const isAI = message.role === 'assistant';
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [codeCopySuccess, setCodeCopySuccess] = useState<Record<string, boolean>>({});
  const [showActions, setShowActions] = useState(false);
  
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleCopyCode = async (codeText: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCodeCopySuccess(prev => ({ ...prev, [codeId]: true }));
      setTimeout(() => {
        setCodeCopySuccess(prev => ({ ...prev, [codeId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  // Get text size class based on setting
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'smaller':
        return 'text-xs';
      case 'default':
        return 'text-base';
      case 'larger':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };
  
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar for AI messages */}
      {isAI && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
        </div>
      )}
      
      <div
        className={`relative rounded-2xl p-4 shadow-md ${
          message.role === 'user'
            ? 'bg-blue-600 text-white max-w-[70%]'
            : 'ai-message-bubble text-gray-100 max-w-[75%] border border-gray-700'
        }`}
      >
        {/* Message attachments */}
        {message.attachments?.map((att) => (
          <div key={att.id} className="mb-3">
            {att.type === 'image' && (
              <div className="relative group">
                <img 
                  src={att.preview} 
                  alt="attachment" 
                  className="max-w-full max-h-48 rounded-md object-contain cursor-pointer border border-gray-700" 
                  onClick={() => onExpandImage(att.preview)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-50 rounded">Click to expand</span>
                </div>
              </div>
            )}
            {att.type === 'pdf' && (
              <div className="flex items-center text-sm bg-red-900 bg-opacity-30 p-2 rounded-md border border-red-800">
                <span className="mr-2">📄</span>
                {att.file.name}
              </div>
            )}
            {att.type === 'audio' && (
              <div className="flex items-center text-sm bg-blue-900 bg-opacity-30 p-2 rounded-md border border-blue-800">
                <span className="mr-2">🔊</span>
                {att.file.name}
              </div>
            )}
          </div>
        ))}
        
        {/* Message content */}
        <div className={`markdown-content font-rounded ${getTextSizeClass()} leading-relaxed`}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Style paragraphs
              p: ({ node, className, children, ...props }) => (
                <p className="mb-4 last:mb-0" {...props}>
                  {children}
                </p>
              ),
              // Style headings
              h1: ({ node, className, children, ...props }) => (
                <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-600" {...props}>
                  {children}
                </h1>
              ),
              h2: ({ node, className, children, ...props }) => (
                <h2 className="text-xl font-bold mb-3 pb-1 border-b border-gray-600" {...props}>
                  {children}
                </h2>
              ),
              h3: ({ node, className, children, ...props }) => (
                <h3 className="text-lg font-bold mb-3" {...props}>
                  {children}
                </h3>
              ),
              h4: ({ node, className, children, ...props }) => (
                <h4 className="text-base font-bold mb-2" {...props}>
                  {children}
                </h4>
              ),
              // Style code blocks
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && typeof children === 'string';
                const codeText = String(children).replace(/\n$/, '');
                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                
                return isInline ? (
                  <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                ) : (
                  <div className="mb-4 rounded-md overflow-hidden relative">
                    <div className="bg-gray-900 px-4 py-1 text-xs text-gray-400 border-b border-gray-700 flex justify-between items-center">
                      <span>{match ? match[1].toUpperCase() : 'CODE'}</span>
                      <button 
                        onClick={() => handleCopyCode(codeText, codeId)}
                        className={`text-gray-400 hover:text-white transition-colors p-1 rounded message-action-btn ${codeCopySuccess[codeId] ? 'copy-success' : ''}`}
                        title="Copy code"
                      >
                        {codeCopySuccess[codeId] ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <ClipboardCopy size={14} />
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 p-4 overflow-x-auto text-sm font-mono">
                      <code className={match ? `language-${match[1]}` : ''} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              // Style links
              a: ({ node, className, children, ...props }) => (
                <a 
                  className="text-blue-400 hover:underline font-medium" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  {...props}
                >
                  {children}
                </a>
              ),
              // Style tables
              table: ({ node, className, children, ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="border-collapse border border-gray-600 w-full rounded-lg overflow-hidden" {...props}>
                    {children}
                  </table>
                </div>
              ),
              tr: ({ node, className, children, ...props }) => (
                <tr className="border-b border-gray-600" {...props}>
                  {children}
                </tr>
              ),
              th: ({ node, className, children, ...props }) => (
                <th className="border border-gray-600 px-4 py-2 bg-gray-900 font-bold text-left" {...props}>
                  {children}
                </th>
              ),
              td: ({ node, className, children, ...props }) => (
                <td className="border border-gray-600 px-4 py-2" {...props}>
                  {children}
                </td>
              ),
              // Style lists
              ul: ({ node, className, children, ...props }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ node, className, children, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1" {...props}>
                  {children}
                </ol>
              ),
              li: ({ node, className, children, ...props }) => (
                <li className="mb-1" {...props}>
                  {children}
                </li>
              ),
              // Style blockquotes
              blockquote: ({ node, className, children, ...props }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-gray-900 bg-opacity-50 rounded-r" {...props}>
                  {children}
                </blockquote>
              ),
              // Style horizontal rule
              hr: ({ node, className, ...props }) => (
                <hr className="border-gray-600 my-6" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        {/* Floating action menu for AI responses */}
        {isAI && showActions && (
          <div className="absolute -bottom-3 right-4 flex items-center gap-1 bg-gray-800 rounded-full shadow-lg p-1 border border-gray-700 transition-opacity">
            <button
              onClick={handleCopyToClipboard}
              className={`text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-700 message-action-btn ${copySuccess ? 'copy-success' : ''}`}
              title="Copy to clipboard"
            >
              {copySuccess ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>
            
            {onRegenerateResponse && (
              <button
                onClick={onRegenerateResponse}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-700 message-action-btn"
                title="Regenerate response"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Avatar for user messages */}
      {!isAI && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
}; 