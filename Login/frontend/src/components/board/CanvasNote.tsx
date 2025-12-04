// src/components/board/CanvasNote.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Edit3,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  Palette,
} from "lucide-react";
import { Note, NoteType } from "@/types";

declare var mermaid: any;

interface CanvasNoteProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}

const COLORS = [
  "#ffffff",
  "#ffedd5",
  "#fef9c3",
  "#dcfce7",
  "#dbeafe",
  "#fae8ff",
  "#ffe4e6",
  "#f3f4f6",
];

const DARK_COLORS = [
  "#1a1a20",
  "#2c1a1a",
  "#2c251a",
  "#1a2c1e",
  "#1a202c",
  "#251a2c",
];

const CanvasNote: React.FC<CanvasNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.text);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Mermaid rendering for FLOWCHART notes
  useEffect(() => {
    if (note.note_type === NoteType.FLOWCHART && mermaidRef.current) {
      try {
        mermaid.initialize({
          startOnLoad: true,
          theme: "neutral",
          securityLevel: "loose",
        });
        const id = `mermaid-${note.id}`;
        mermaidRef.current.innerHTML = "";

        const tempDiv = document.createElement("div");
        tempDiv.id = id;
        document.body.appendChild(tempDiv);

        mermaid.render(id, note.text).then((result: any) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = result.svg;
            const svg = mermaidRef.current.querySelector("svg");
            if (svg) {
              svg.style.width = "100%";
              svg.style.height = "100%";
            }
          }
          document.body.removeChild(tempDiv);
        });
      } catch (e) {
        console.error("Mermaid render error", e);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML =
            '<div class="text-red-400 text-xs p-2 font-mono">Invalid Syntax</div>';
        }
      }
    }
  }, [note.text, note.note_type, note.id, note.width, note.height]);

  // --- DRAG ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || isResizing) return;
    e.stopPropagation();
    onSelect();
    setShowColorPicker(false);

    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsDragging(true);
  };

  // --- RESIZE ---
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: note.width,
      h: note.height,
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging && nodeRef.current && nodeRef.current.parentElement) {
        const parentRect =
          nodeRef.current.parentElement.getBoundingClientRect();
        const newX = e.clientX - parentRect.left - dragOffset.x;
        const newY = e.clientY - parentRect.top - dragOffset.y;
        onUpdate({ x: newX, y: newY });
      }

      if (isResizing) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        const newWidth = Math.max(160, resizeStart.w + dx);
        const newHeight = Math.max(100, resizeStart.h + dy);
        onUpdate({ width: newWidth, height: newHeight });
      }
    };

    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, onUpdate, note.id]);

  const handleSaveEdit = () => {
    onUpdate({ text: editContent });
    setIsEditing(false);
  };

  const getIcon = () => {
    switch (note.note_type) {
      case NoteType.TEXT:
        return <FileText className="w-3 h-3" />;
      case NoteType.IMAGE:
        return <ImageIcon className="w-3 h-3" />;
      case NoteType.VIDEO:
        return <Video className="w-3 h-3" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-current" />;
    }
  };

  const color = note.extra_data?.color;
  const isDefaultColor =
    !color || color === "#ffffff" || color === "#1a1a20" || color === "";

  const bgStyle = isDefaultColor
    ? "bg-white/80 dark:bg-[#1a1a20]/90 backdrop-blur-xl"
    : "backdrop-blur-md";

  const bgColor =
    color ||
    (document.documentElement.classList.contains("dark")
      ? "#1a1a20"
      : "#ffffff");

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate(${note.x}px, ${note.y}px) ${
          isDragging ? "scale(1.02)" : "scale(1)"
        }`,
        width: note.width,
        height: note.height,
        zIndex: isSelected ? 50 : 1,
        backgroundColor: bgColor,
      }}
      className={`
        absolute rounded-3xl transition-shadow duration-300 ease-out flex flex-col group
        ${
          isSelected
            ? "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] ring-1 ring-primary/50 z-50"
            : "shadow-lg hover:shadow-2xl"
        }
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        ${bgStyle}
        border border-white/20 dark:border-white/10
      `}
    >
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 rounded-t-3xl cursor-grab active:cursor-grabbing relative">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {getIcon()}
          <span className="opacity-70">{note.note_type}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground/60 hover:text-primary transition-colors"
            >
              <Palette className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-[#25252a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex gap-1 z-50 w-32 flex-wrap justify-end"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {(document.documentElement.classList.contains("dark")
                  ? DARK_COLORS
                  : COLORS
                ).map((c) => (
                  <button
                    key={c}
                    className={`w-5 h-5 rounded-full border border-black/10 dark:border-white/10 hover:scale-110 transition-transform ${
                      color === c ? "ring-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      onUpdate({
                        extra_data: {
                          ...(note.extra_data || {}),
                          color: c,
                        },
                      });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {note.note_type === NoteType.TEXT && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground/60 hover:text-primary transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-full hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5 overflow-hidden relative flex flex-col">
        {isEditing && note.note_type === NoteType.TEXT ? (
          <textarea
            className="w-full h-full resize-none bg-transparent outline-none text-foreground placeholder-muted-foreground text-lg leading-relaxed font-medium font-sans"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSaveEdit}
            autoFocus
            placeholder="Type something brilliant..."
            onKeyDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full h-full pointer-events-none select-none flex flex-col">
            {note.note_type === NoteType.TEXT && (
              <p className="text-lg text-foreground whitespace-pre-wrap leading-relaxed font-medium font-sans break-words">
                {note.text || "Double click to edit"}
              </p>
            )}

            {note.note_type === NoteType.IMAGE && (
              <div className="w-full h-full rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5">
                <img
                  src={note.text}
                  alt="Note"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )}

            {note.note_type === NoteType.VIDEO && (
              <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-inner">
                <video
                  src={note.text}
                  controls
                  className="w-full h-full object-cover pointer-events-auto"
                />
              </div>
            )}

            {note.note_type === NoteType.FLOWCHART && (
              <div
                ref={mermaidRef}
                className="w-full h-full flex items-center justify-center overflow-hidden"
              />
            )}
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        <div className="w-3 h-3 bg-primary/50 rounded-full shadow-sm ring-2 ring-white dark:ring-black"></div>
      </div>
    </div>
  );
};

export default CanvasNote;
