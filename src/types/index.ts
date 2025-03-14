export type Model = 'gemini-1.5-pro' | 'gemini-2.0-flash';

export type Theme = 'dark' | 'light';

export type AnimationQuality = 'low' | 'medium' | 'high';

export type TextSize = 'smaller' | 'default' | 'larger';

export interface User {
  id: string;
  email: string;
}

export interface Settings {
  defaultModel: Model;
  theme: Theme;
  animationsEnabled: boolean;
  animationSpeed: number;
  animationQuality: AnimationQuality;
  apiKey: string;
  sidebarAutoHide: boolean;
  textSize: TextSize;
}

export interface FileAttachment {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'pdf' | 'audio';
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  attachments?: FileAttachment[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: Model;
  createdAt: number;
  updatedAt: number;
  isTemporary?: boolean;
}