// src/api/notes.ts
import axios from "axios";
import { Note, NoteType } from "@/types";

export interface NoteCreatePayload {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  note_type: NoteType;
  extra_data?: Record<string, any>;
}

export type NoteUpdatePayload = Partial<NoteCreatePayload>;

export async function fetchNotes(boardId: number): Promise<Note[]> {
  const res = await axios.get(`/boards/${boardId}/notes`, {
    withCredentials: true,
  });
  return res.data;
}

export async function createNote(boardId: number, payload: NoteCreatePayload) {
  try {
    console.log("📨 Sending note payload:", payload);
    const res = await axios.post(`/boards/${boardId}/notes`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    console.error("❌ API ERROR →", error.response?.data || error);
    throw error;
  }
}

export async function updateNote(
  boardId: number,
  noteId: number,
  updates: NoteUpdatePayload,
): Promise<Note> {
  const res = await axios.put(`/boards/${boardId}/notes/${noteId}`, updates, {
    withCredentials: true,
  });
  return res.data;
}

export async function deleteNote(
  boardId: number,
  noteId: number,
): Promise<void> {
  await axios.delete(`/boards/${boardId}/notes/${noteId}`, {
    withCredentials: true,
  });
}
