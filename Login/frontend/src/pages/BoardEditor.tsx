// src/pages/BoardEditor.tsx
import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Type,
  Share2,
  ArrowLeft,
  BrainCircuit,
  Download,
  MousePointer2,
  Moon,
  Sun,
} from "lucide-react";

import CanvasNote from "@/components/board/CanvasNote";
import { Note, NoteType } from "@/types";
import { generateMermaidFromText } from "@/services/geminiService";
import { NoteCreatePayload } from "@/api/notes";

interface BoardEditorProps {
  board: { id: number; title: string; collaboration_code: string | null };
  notes: Note[];
  currentUser?: any;
  onBack: () => void;

  onCreateNote: (note: NoteCreatePayload) => Promise<void>;
  onUpdateNote: (id: number, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;

  isDark: boolean;
  toggleTheme: () => void;
}

const BoardEditor: React.FC<BoardEditorProps> = ({
  board,
  notes,
  onBack,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  isDark,
  toggleTheme,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  // 🆕 Zoom Level
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [showFlowchartModal, setShowFlowchartModal] = useState(false);
  const [flowchartInput, setFlowchartInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 FIX — fully safe payload, identical behavior to original
  const addNote = async (type: NoteType, content = "") => {
    const safeX = Number(window.innerWidth) ? window.innerWidth / 2 - 140 : 200;
    const safeY = Number(window.innerHeight)
      ? window.innerHeight / 2 - 100
      : 200;

    const payload: NoteCreatePayload = {
      text: content ?? "",
      note_type: type ?? NoteType.TEXT,
      x: Math.round(safeX),
      y: Math.round(safeY),
      width: type === NoteType.TEXT ? 280 : 320,
      height: type === NoteType.TEXT ? 200 : 240,
      extra_data: {},
    };

    console.log("📦 NEW NOTE SENT →", payload);
    await onCreateNote(payload);
  };

  const handleUpdateNote = async (id: number, updates: Partial<Note>) => {
    await onUpdateNote(id, updates);
  };

  const handleDeleteNote = async (id: number) => {
    await onDeleteNote(id);
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const type = file.type.startsWith("video")
        ? NoteType.VIDEO
        : NoteType.IMAGE;
      await addNote(type, content);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateFlowchart = async () => {
    if (!flowchartInput) return;
    setIsGenerating(true);
    try {
      const code = await generateMermaidFromText(flowchartInput);
      setGeneratedCode(code);
    } catch (err) {
      console.error(err);
      alert("Failed to generate flowchart.");
    } finally {
      setIsGenerating(false);
    }
  };

  const insertFlowchart = async () => {
    if (!generatedCode) return;
    await addNote(NoteType.FLOWCHART, generatedCode);
    setShowFlowchartModal(false);
    setFlowchartInput("");
    setGeneratedCode("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] dark:bg-[#050508] relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(#a0a0a0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-[#18181b] rounded-full shadow-xl border border-black/5 dark:border-white/5 hover:scale-105 transition-all text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-xl border border-black/5 dark:border-white/5 flex flex-col justify-center min-w-[120px]">
            <h1 className="font-bold text-foreground text-sm leading-tight">
              {board.title}
            </h1>
            <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1.5 font-bold leading-none mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Synced
            </span>
          </div>
        </div>

        {/* Theme + Share */}
        <div className="pointer-events-auto">
          <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl p-1.5 rounded-full shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-full p-1 transition-all duration-300 border border-black/5 dark:border-white/5 hover:border-primary/30"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-[#2a2a30] rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  isDark ? "translate-x-6" : "translate-x-0"
                }`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-orange-400" />
                )}
              </div>
            </button>

            <button
              onClick={() =>
                alert(
                  `Collaboration Code: ${board.collaboration_code || "N/A"}`,
                )
              }
              className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="absolute inset-0 z-0 cursor-default overflow-hidden"
        onClick={() => setSelectedNoteId(null)}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "50% 50%",
          transition: "transform 0.2s ease-out",
        }}
      >
        {notes.map((note) => (
          <CanvasNote
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            onSelect={() => setSelectedNoteId(note.id)}
            onUpdate={(updates) => handleUpdateNote(note.id, updates)}
            onDelete={() => handleDeleteNote(note.id)}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-slide-up">
        <div className="flex items-center gap-2 p-2.5 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl rounded-full shadow-xl border border-white/20">
          <ToolButton
            icon={<MousePointer2 className="h-5 w-5" />}
            label="Select"
            active={selectedNoteId === null}
            onClick={() => setSelectedNoteId(null)}
          />
          <ToolButton
            icon={<Type className="h-5 w-5" />}
            label="Text"
            onClick={() => addNote(NoteType.TEXT)}
          />
          <ToolButton
            icon={<ImageIcon className="h-5 w-5" />}
            label="Media"
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          <button
            onClick={() => setShowFlowchartModal(true)}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-[#a855f7] text-white hover:bg-[#9333ea] hover:scale-110 transition-all"
            title="AI Flowchart"
          >
            <BrainCircuit className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Flowchart Modal */}
      {showFlowchartModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                AI Diagram Generator
              </h3>

              <button
                onClick={() => setShowFlowchartModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              {!generatedCode ? (
                <textarea
                  value={flowchartInput}
                  onChange={(e) => setFlowchartInput(e.target.value)}
                  placeholder="Describe your workflow..."
                  className="w-full h-64 p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg.black/20"
                />
              ) : (
                <code className="block whitespace-pre-wrap text-sm">
                  {generatedCode}
                </code>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-4">
              {!generatedCode ? (
                <button
                  onClick={handleGenerateFlowchart}
                  className="px-8 py-4 text-sm font-bold text-white bg-purple-600 rounded-xl"
                >
                  {isGenerating ? "Thinking..." : "Generate Diagram"}
                </button>
              ) : (
                <button
                  onClick={insertFlowchart}
                  className="px-8 py-4 text-sm font-bold text-white bg-green-600 rounded-xl"
                >
                  Insert to Board
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolButton = ({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items.center justify-center w-11 h-11 rounded-full transition-all ${
      active
        ? "bg-gray-100 dark:bg.white/20 text-primary"
        : "text-muted-foreground hover:bg-gray-50 dark:hover:bg.white/10"
    }`}
  >
    {icon}
    <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black text-white text-xs py-1 px-2 rounded shadow-xl">
      {label}
    </span>
  </button>
);

export default BoardEditor;
