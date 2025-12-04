// ----------------------------
// USER
// ----------------------------
export interface User {
  id: string; // keep as string for frontend UI
  name: string;
  avatar: string;
  email: string;
}

// ----------------------------
// COMMENTS (if used)
// ----------------------------
export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

// ----------------------------
// NOTE TYPE (frontend → backend mapped)
// backend expects uppercase TEXT / IMAGE / VIDEO / FLOWCHART
// so we force our enum to match
// ----------------------------
export enum NoteType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  FLOWCHART = "FLOWCHART",
}

// ----------------------------
// CANVAS NOTE (UI model)
// ----------------------------
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * FRONTEND NOTE MODEL
 * This is YOUR visual note format.
 * It will be mapped to backend format when saving.
 */
export interface Note {
  id: number; // backend numeric ID
  text: string; // for backend "text" field
  note_type: NoteType; // backend note_type
  x: number;
  y: number;
  width: number;
  height: number;

  // extra data
  extra_data?: {
    color?: string;
    [key: string]: any;
  };
}

// ----------------------------
// PROJECT / BOARD
// ----------------------------
export type ProjectType = "canvas" | "notepad";

export interface Board {
  id: number; // backend numeric ID
  type: ProjectType;

  title: string;
  createdAt: number;

  thumbnail: string;

  ownerId: string;

  collaborators: User[];
  pendingRequests: User[];

  notes: Note[];

  documentContent?: string;

  shareCode: string | null;
}

// ----------------------------
// NOTIFICATION MODEL
// ----------------------------
export interface Notification {
  id: string;
  type: "access_request" | "info" | "success";
  title: string;
  message: string;
  timestamp: number;
  data?: {
    boardId: string;
    user: User;
  };
  read: boolean;
}

// ----------------------------
// VIEW STATE
// ----------------------------
export type ViewState =
  | "landing"
  | "dashboard"
  | "board"
  | "login"
  | "register";

// ----------------------------
// THEME CONTEXT
// ----------------------------
export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
