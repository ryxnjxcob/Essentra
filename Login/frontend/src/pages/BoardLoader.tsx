// src/pages/BoardLoader.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BoardEditor from "./BoardEditor";
import { fetchBoardById } from "@/api/boards";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  NoteCreatePayload,
} from "@/api/notes";
import { Note } from "@/types";

interface BoardLoaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const BoardLoader: React.FC<BoardLoaderProps> = ({ isDark, toggleTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState<any | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const boardId = Number(id);
    if (Number.isNaN(boardId)) {
      navigate("/app/dashboard");
      return;
    }

    (async () => {
      try {
        const [b, n] = await Promise.all([
          fetchBoardById(boardId),
          fetchNotes(boardId),
        ]);
        setBoard(b);
        setNotes(n);
      } catch (err) {
        console.error("Failed to load board/notes", err);
        navigate("/app/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleCreateNote = async (payload: NoteCreatePayload) => {
    if (!board) return;
    const created = await createNote(board.id, payload);
    setNotes((prev) => [...prev, created]);
  };

  const handleUpdateNote = async (noteId: number, updates: Partial<Note>) => {
    if (!board) return;
    const updated = await updateNote(board.id, noteId, updates);
    setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!board) return;
    await deleteNote(board.id, noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center text-muted-foreground">
        Loading board…
      </div>
    );
  }

  if (!board) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center text-muted-foreground gap-4">
        <p>Board not found.</p>
        <button
          className="px-4 py-2 rounded-xl bg-foreground text-background font-semibold"
          onClick={() => navigate("/app/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <BoardEditor
      board={board}
      notes={notes}
      onBack={() => navigate("/app/dashboard")}
      onCreateNote={handleCreateNote}
      onUpdateNote={handleUpdateNote}
      onDeleteNote={handleDeleteNote}
      isDark={isDark}
      toggleTheme={toggleTheme}
    />
  );
};

export default BoardLoader;
