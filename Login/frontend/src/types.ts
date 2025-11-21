
export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export enum NoteType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FLOWCHART = 'flowchart',
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Note {
  id: string;
  type: NoteType;
  content: string; // Text content, Image URL, or Mermaid syntax
  position: Position;
  size: Size;
  zIndex: number;
  color?: string;
}

export type ProjectType = 'canvas' | 'notepad';

export interface Board {
  id: string;
  type: ProjectType; // Distinguish between Canvas and Notepad
  title: string;
  createdAt: number;
  thumbnail: string;
  ownerId: string;
  collaborators: User[];
  pendingRequests: User[]; // For access request logic
  notes: Note[]; // Used for Canvas
  documentContent?: string; // Used for Notepad
  shareCode: string;
}

export interface Notification {
  id: string;
  type: 'access_request' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
  data?: {
    boardId: string;
    user: User;
  };
  read: boolean;
}

export type ViewState = 'landing' | 'dashboard' | 'board' | 'login' | 'register';

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
