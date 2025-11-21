
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Share2, Save, Hash, List, Quote, Code, MoreVertical, Bold, Italic } from 'lucide-react';
import { Board, User } from '../../types';

interface NotepadEditorProps {
  board: Board;
  currentUser: User;
  onBack: () => void;
  onUpdateBoard: (board: Board) => void;
}

const NotepadEditor: React.FC<NotepadEditorProps> = ({ board, currentUser, onBack, onUpdateBoard }) => {
  const [content, setContent] = useState(board.documentContent || '');
  const [title, setTitle] = useState(board.title);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== board.documentContent || title !== board.title) {
        onUpdateBoard({
          ...board,
          title,
          documentContent: content,
        });
        setLastSaved(new Date());
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, title]);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      const newText = before + prefix + selection + suffix + after;
      setContent(newText);
      
      // Restore focus and selection
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fdfdfd] dark:bg-[#0c0c0c] text-gray-900 dark:text-gray-200 transition-colors duration-500">
      
      {/* Top Bar - Matches Screenshot 2 */}
      <div className="h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 bg-white/50 dark:bg-[#0c0c0c]/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <button 
             onClick={onBack} 
             className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
           >
               <ArrowLeft className="h-5 w-5" />
           </button>
           <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />
           <div className="text-xs text-muted-foreground font-mono tracking-wide uppercase">
              Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-sm font-medium">
               <Share2 className="h-4 w-4" /> 
               <span className="">Share</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
               <MoreVertical className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         <div className="max-w-3xl mx-auto px-8 py-12 sm:py-16">
            
            {/* Title Input */}
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-4xl sm:text-5xl font-bold text-foreground placeholder-gray-300 dark:placeholder-gray-700 outline-none mb-8"
              placeholder="Untitled"
            />

            {/* Functionality Toolbar (Boxed style from request) */}
            <div className="mb-8 inline-block p-1 border border-blue-300/50 rounded-lg bg-blue-50/30 dark:bg-blue-900/10">
                <div className="flex items-center gap-1">
                    <ToolBtn onClick={() => insertMarkdown('# ')} icon={<span className="font-bold text-sm">#</span>} label="Heading 1" />
                    <ToolBtn onClick={() => insertMarkdown('## ')} icon={<span className="font-bold text-xs">##</span>} label="Heading 2" />
                    <div className="w-px h-4 bg-blue-200 dark:bg-blue-800 mx-2" />
                    <ToolBtn onClick={() => insertMarkdown('**', '**')} icon={<Bold className="w-4 h-4" />} label="Bold" />
                    <ToolBtn onClick={() => insertMarkdown('*', '*')} icon={<Italic className="w-4 h-4" />} label="Italic" />
                    <div className="w-px h-4 bg-blue-200 dark:bg-blue-800 mx-2" />
                    <ToolBtn onClick={() => insertMarkdown('- ')} icon={<List className="w-4 h-4" />} label="List" />
                    <ToolBtn onClick={() => insertMarkdown('> ')} icon={<Quote className="w-4 h-4" />} label="Quote" />
                    <ToolBtn onClick={() => insertMarkdown('`', '`')} icon={<Code className="w-4 h-4" />} label="Code" />
                </div>
            </div>

            {/* Main Editor Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing..."
              className="w-full h-[70vh] bg-transparent resize-none outline-none text-lg leading-loose font-serif text-gray-800 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-800 selection:bg-blue-100 dark:selection:bg-blue-900/30"
              spellCheck={false}
            />
         </div>
      </div>

    </div>
  );
};

const ToolBtn = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20 text-gray-600 dark:text-gray-300 transition-colors" 
        title={label}
    >
        {icon}
    </button>
);

export default NotepadEditor;
