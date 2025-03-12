export type Model = 'gemini-1.5-pro' | 'gemini-2.0-flash';

export type Theme = 'dark' | 'light';

export type AnimationQuality = 'low' | 'medium' | 'high';

export interface Settings {
  defaultModel: Model;
  theme: Theme;
  animationsEnabled: boolean;
  animationSpeed: number;
  animationQuality: AnimationQuality;
  apiKey: string;
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
}