
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, Maximize2, GripHorizontal, Image as ImageIcon, Video, FileText, Palette } from 'lucide-react';
import { Note, NoteType, Position, Size } from '../../types';

// We need to declare mermaid as global since we load it via script tag
declare var mermaid: any;

interface CanvasNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const COLORS = [
    '#ffffff', // White
    '#ffedd5', // Orange 100
    '#fef9c3', // Yellow 100
    '#dcfce7', // Green 100
    '#dbeafe', // Blue 100
    '#fae8ff', // Purple 100
    '#ffe4e6', // Rose 100
    '#f3f4f6', // Gray 100
];

const DARK_COLORS = [
    '#1a1a20', // Default Dark
    '#2c1a1a', // Red tint
    '#2c251a', // Orange tint
    '#1a2c1e', // Green tint
    '#1a202c', // Blue tint
    '#251a2c', // Purple tint
];

const CanvasNote: React.FC<CanvasNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  isSelected,
  onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const nodeRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Mermaid Rendering
  useEffect(() => {
    if (note.type === NoteType.FLOWCHART && mermaidRef.current) {
      try {
        mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose' });
        const id = `mermaid-${note.id}`;
        mermaidRef.current.innerHTML = '';
        
        const tempDiv = document.createElement('div');
        tempDiv.id = id;
        document.body.appendChild(tempDiv);
        
        mermaid.render(id, note.content).then((result: any) => {
             if (mermaidRef.current) {
                 mermaidRef.current.innerHTML = result.svg;
                 const svg = mermaidRef.current.querySelector('svg');
                 if(svg) {
                     svg.style.width = '100%';
                     svg.style.height = '100%';
                 }
             }
             document.body.removeChild(tempDiv);
        });
      } catch (e) {
        console.error("Mermaid render error", e);
        if (mermaidRef.current) mermaidRef.current.innerHTML = `<div class="text-red-400 text-xs p-2 font-mono">Invalid Syntax</div>`;
      }
    }
  }, [note.content, note.type, note.id, note.size]); // Re-render on size change if needed for responsive diagrams


  // --- DRAG LOGIC ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || isResizing) return;
    e.stopPropagation();
    onSelect(note.id);
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

  // --- RESIZE LOGIC ---
  const handleResizeStart = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      setResizeStart({
          x: e.clientX,
          y: e.clientY,
          w: note.size.width,
          h: note.size.height
      });
  };

  // --- GLOBAL MOUSE LISTENERS ---
  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          if (isDragging && nodeRef.current && nodeRef.current.parentElement) {
              const parentRect = nodeRef.current.parentElement.getBoundingClientRect();
              const newX = e.clientX - parentRect.left - dragOffset.x;
              const newY = e.clientY - parentRect.top - dragOffset.y;
              onUpdate(note.id, { position: { x: newX, y: newY } });
          }

          if (isResizing) {
              const dx = e.clientX - resizeStart.x;
              const dy = e.clientY - resizeStart.y;
              const newWidth = Math.max(160, resizeStart.w + dx);
              const newHeight = Math.max(100, resizeStart.h + dy);
              onUpdate(note.id, { size: { width: newWidth, height: newHeight } });
          }
      };

      const handleGlobalUp = () => {
          setIsDragging(false);
          setIsResizing(false);
      };

      if (isDragging || isResizing) {
          window.addEventListener('mousemove', handleGlobalMove);
          window.addEventListener('mouseup', handleGlobalUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleGlobalMove);
          window.removeEventListener('mouseup', handleGlobalUp);
      };
  }, [isDragging, isResizing, dragOffset, resizeStart, note.id]);

  const handleSaveEdit = () => {
    onUpdate(note.id, { content: editContent });
    setIsEditing(false);
  };

  const getIcon = () => {
      switch(note.type) {
          case NoteType.TEXT: return <FileText className="w-3 h-3" />;
          case NoteType.IMAGE: return <ImageIcon className="w-3 h-3" />;
          case NoteType.VIDEO: return <Video className="w-3 h-3" />;
          default: return <div className="w-2 h-2 rounded-full bg-current" />;
      }
  }

  // Determine background style based on note.color
  // If note.color is default white or dark gray, we allow glass effect. 
  // If custom color, we make it more opaque.
  const isDefaultColor = note.color === '#ffffff' || note.color === '#1a1a20' || !note.color;
  const bgStyle = isDefaultColor 
    ? 'bg-white/80 dark:bg-[#1a1a20]/90 backdrop-blur-xl' 
    : 'backdrop-blur-md';

  return (
    <div
      ref={nodeRef}
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate(${note.position.x}px, ${note.position.y}px) ${isDragging ? 'scale(1.02)' : 'scale(1)'}`,
        width: note.size.width,
        height: note.size.height,
        zIndex: isSelected ? 50 : note.zIndex,
        backgroundColor: note.color || undefined
      }}
      className={`
        absolute rounded-3xl transition-shadow duration-300 ease-out flex flex-col group
        ${isSelected 
            ? 'shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] ring-1 ring-primary/50 z-50' 
            : 'shadow-lg hover:shadow-2xl z-0'}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${bgStyle}
        border border-white/20 dark:border-white/10
      `}
    >
      {/* Header / Drag Handle */}
      <div className="h-9 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 rounded-t-3xl cursor-grab active:cursor-grabbing relative">
         <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {getIcon()}
            <span className="opacity-70">{note.type}</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground/60 hover:text-primary transition-colors"
                >
                    <Palette className="w-3 h-3" />
                </button>
                {/* Color Picker Dropdown */}
                {showColorPicker && (
                    <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-[#25252a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex gap-1 z-50 w-32 flex-wrap justify-end" onMouseDown={(e) => e.stopPropagation()}>
                        {(document.documentElement.classList.contains('dark') ? DARK_COLORS : COLORS).map((c) => (
                            <button
                                key={c}
                                className={`w-5 h-5 rounded-full border border-black/10 dark:border-white/10 hover:scale-110 transition-transform ${note.color === c ? 'ring-2 ring-primary' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => { onUpdate(note.id, { color: c }); setShowColorPicker(false); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {note.type === NoteType.TEXT && (
                <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-foreground/60 hover:text-primary transition-colors">
                    <Edit3 className="w-3 h-3" />
                </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="p-1.5 rounded-full hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors">
                <Trash2 className="w-3 h-3" />
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-5 pb-5 overflow-hidden relative flex flex-col">
        {isEditing && note.type === NoteType.TEXT ? (
          <textarea
            className="w-full h-full resize-none bg-transparent outline-none text-foreground placeholder-muted-foreground text-lg leading-relaxed font-medium font-sans"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSaveEdit}
            autoFocus
            placeholder="Type something brilliant..."
            onKeyDown={(e) => e.stopPropagation()} // Prevent deleting note when backspacing
          />
        ) : (
          <div className="w-full h-full pointer-events-none select-none flex flex-col">
             {note.type === NoteType.TEXT && (
                 <p className="text-lg text-foreground whitespace-pre-wrap leading-relaxed font-medium font-sans break-words">{note.content || "Double click to edit"}</p>
             )}
             {note.type === NoteType.IMAGE && (
                 <div className="w-full h-full rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5">
                    <img src={note.content} alt="Note" className="w-full h-full object-cover" draggable={false} />
                 </div>
             )}
             {note.type === NoteType.VIDEO && (
                 <div className="w-full h-full bg-black rounded-2xl overflow-hidden shadow-inner">
                    <video src={note.content} controls className="w-full h-full object-cover pointer-events-auto" />
                 </div>
             )}
             {note.type === NoteType.FLOWCHART && (
                 <div ref={mermaidRef} className="w-full h-full flex items-center justify-center overflow-hidden" />
             )}
          </div>
        )}
      </div>
      
      {/* Resize Handle - Increased hit area and z-index */}
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
