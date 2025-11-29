import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Type,
  Share2,
  ArrowLeft,
  BrainCircuit,
  Download,
  MousePointer2,
  Save,
  GripVertical,
  Moon,
  Sun,
} from "lucide-react";
import { NoteType } from "@/types";
import CanvasNote from "@/components/board/CanvasNote";
import { generateMermaidFromText } from "@/services/geminiService";

interface BoardEditorProps {
  board: Board;
  currentUser: User;
  onBack: () => void;
  onUpdateBoard: (board: Board) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const BoardEditor: React.FC<BoardEditorProps> = ({
  board,
  currentUser,
  onBack,
  onUpdateBoard,
  isDark,
  toggleTheme,
}) => {
  const [notes, setNotes] = useState<Note[]>(board.notes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showFlowchartModal, setShowFlowchartModal] = useState(false);
  const [flowchartInput, setFlowchartInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updatedBoard = { ...board, notes };
    onUpdateBoard(updatedBoard);
  }, [notes]);

  const addNote = (type: NoteType, content: string = "") => {
    const newNote: Note = {
      id: Date.now().toString(),
      type,
      content: content || (type === NoteType.TEXT ? "" : ""),
      position: {
        x: window.innerWidth / 2 - 120,
        y: window.innerHeight / 2 - 100,
      },
      size:
        type === NoteType.TEXT
          ? { width: 280, height: 200 }
          : { width: 320, height: 240 },
      zIndex: Math.max(0, ...notes.map((n) => n.zIndex)) + 1,
      color: "#ffffff", // Default color
    };
    setNotes([...notes, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const type = file.type.startsWith("video")
        ? NoteType.VIDEO
        : NoteType.IMAGE;
      addNote(type, content);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateFlowchart = async () => {
    if (!flowchartInput) return;
    setIsGenerating(true);
    try {
      const code = await generateMermaidFromText(flowchartInput);
      setGeneratedCode(code);
    } catch (error) {
      alert("Failed to generate flowchart. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addFlowchartToBoard = () => {
    if (generatedCode) {
      addNote(NoteType.FLOWCHART, generatedCode);
      setShowFlowchartModal(false);
      setFlowchartInput("");
      setGeneratedCode("");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] dark:bg-[#050508] relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(#a0a0a0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Top Bar - Redesigned based on Screenshot 1 */}
      <div className="absolute top-6 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
        {/* Left: Back & Title */}
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

        {/* Right: Theme Toggle */}
        <div className="pointer-events-auto">
          <div className="bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl p-1.5 rounded-full shadow-xl border border-black/5 dark:border-white/5 flex items-center gap-3">
            {/* Collaborators (Simplified for this view) */}
            <div className="flex -space-x-2 px-2">
              {board.collaborators.slice(0, 3).map((collab) => (
                <img
                  key={collab.id}
                  src={collab.avatar}
                  alt={collab.name}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-[#18181b]"
                  title={collab.name}
                />
              ))}
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>

            {/* Custom Theme Switch */}
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-full p-1 transition-all duration-300 border border-black/5 dark:border-white/5 hover:border-primary/30"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-[#2a2a30] rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDark ? "translate-x-6" : "translate-x-0"}`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-orange-400" />
                )}
              </div>
            </button>

            <button
              onClick={() => alert(`Code: ${board.shareCode}`)}
              className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className="absolute inset-0 z-0 cursor-default overflow-hidden"
        onClick={() => setSelectedNoteId(null)}
      >
        {notes.map((note) => (
          <CanvasNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
            isSelected={selectedNoteId === note.id}
            onSelect={setSelectedNoteId}
          />
        ))}
      </div>

      {/* Floating Toolbar Dock */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-slide-up">
        <div className="flex items-center gap-2 p-2.5 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-white/20 ring-1 ring-black/5 dark:ring-white/10">
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
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileUpload}
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          <button
            onClick={() => setShowFlowchartModal(true)}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-[#a855f7] text-white hover:bg-[#9333ea] hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            title="AI Flowchart"
          >
            <BrainCircuit className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Flowchart Modal */}
      {showFlowchartModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 animate-scale-in transform">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>AI Diagram Generator</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium ml-1">
                  Transform text descriptions into visual workflows instantly.
                </p>
              </div>
              <button
                onClick={() => setShowFlowchartModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="text-muted-foreground hover:text-foreground font-bold text-sm">
                  Close
                </div>
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              {!generatedCode ? (
                <div className="relative group">
                  <textarea
                    value={flowchartInput}
                    onChange={(e) => setFlowchartInput(e.target.value)}
                    placeholder="Describe your process here...&#10;Example: User signs up -> Email sent -> User verifies. If timeout -> Delete account."
                    className="w-full h-64 p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 text-foreground focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none text-lg font-medium leading-relaxed shadow-inner transition-all"
                  />
                  <div className="absolute bottom-6 right-6 flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {flowchartInput.length} chars
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border border-gray-200 dark:border-white/10 relative h-full min-h-[300px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-mono text-purple-500 uppercase tracking-wider font-bold">
                      Mermaid Syntax Preview
                    </p>
                    <button
                      onClick={() => setGeneratedCode("")}
                      className="text-xs font-bold text-muted-foreground hover:text-primary underline decoration-2 underline-offset-2"
                    >
                      Edit Prompt
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <code className="text-sm font-mono text-foreground/80 block whitespace-pre-wrap">
                      {generatedCode}
                    </code>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/5 flex justify-end gap-4">
              {!generatedCode ? (
                <button
                  onClick={handleGenerateFlowchart}
                  disabled={isGenerating || !flowchartInput}
                  className={`px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700 rounded-xl transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center gap-2 transform active:scale-95 ${isGenerating ? "opacity-70 cursor-wait" : ""}`}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Generative Thinking...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4" /> Generate Diagram
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={addFlowchartToBoard}
                  className="px-8 py-4 text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 transform active:scale-95"
                >
                  <Download className="h-4 w-4" /> Insert to Board
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
    className={`group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 ${active ? "bg-gray-100 dark:bg-white/20 text-primary" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/10 hover:text-foreground"}`}
  >
    {icon}
    <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black text-white text-xs py-1 px-2 rounded transition-all font-bold whitespace-nowrap pointer-events-none shadow-lg">
      {label}
    </span>
  </button>
);

export default BoardEditor;
