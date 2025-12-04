import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  MoreVertical,
  Users,
  LogIn,
  Search,
  Grid,
  List,
  LayoutGrid,
  FolderPlus,
  Share2,
  Trash2,
  Copy,
  Check,
  FileText,
  Palette,
} from "lucide-react";
import { Board, User, ProjectType } from "../../types";

interface DashboardProps {
  boards: Board[];
  user: User;
  onCreateBoard: (title: string, type: ProjectType) => void;
  onJoinBoard: (code: string) => void;
  onDeleteBoard: (id: string) => void;
  onOpenBoard: (id: string) => void;

  // NEW:
  requests: any[];
  onApproveRequest: (requestId: number) => void;
  onRejectRequest: (requestId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  boards,
  user,
  onCreateBoard,
  onJoinBoard,
  onDeleteBoard,
  onOpenBoard,
  requests,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<Board | null>(null);

  // Create Modal State
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [selectedType, setSelectedType] = useState<ProjectType>("canvas");

  const [joinCode, setJoinCode] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // State for active dropdown menu (board ID)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const normalizedBoards = boards.map((b) => ({
    ...b,
    notes: Array.isArray(b.notes) ? b.notes : [],
    collaborators: Array.isArray(b.collaborators) ? b.collaborators : [],
  }));

  const filteredBoards = normalizedBoards.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 animate-fade-in min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {getGreeting()},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              {(user?.name || "User").split(" ")[0]}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Let's create something impactful today.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-foreground font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Join
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create
          </button>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your boards & docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
          />
        </div>

        <div className="flex items-center bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10">
          <button
            onClick={() => setViewType("grid")}
            className={`p-2.5 rounded-xl transition-all ${viewType === "grid" ? "bg-gray-100 dark:bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType("list")}
            className={`p-2.5 rounded-xl transition-all ${viewType === "list" ? "bg-gray-100 dark:bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collaboration Requests */}
      {requests && requests.length > 0 && (
        <div className="mb-12 animate-fade-in">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Collaboration Requests
          </h2>

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-[#151518] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground text-lg">
                      {req.requester_name ||
                        req.data?.user?.name ||
                        "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      wants to join{" "}
                      <strong className="text-foreground">
                        {req.board_title || req.data?.board_title}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => onApproveRequest(req.id)}
                    className="flex-1 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-xl font-bold transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="flex-1 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredBoards.length > 0 ? (
        <div
          className={`grid ${viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
        >
          {filteredBoards.map((board, index) => (
            <div
              key={board.id}
              className={`group relative bg-white dark:bg-[#151518] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-500 cursor-pointer animate-slide-up flex ${viewType === "list" ? "flex-row h-32 items-center" : "flex-col"}`}
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => onOpenBoard(board.id)}
            >
              {/* Thumbnail Area */}
              <div
                className={`${viewType === "grid" ? "h-52 w-full" : "h-full w-48 shrink-0"} bg-gray-50 dark:bg-black/20 relative overflow-hidden rounded-t-3xl ${viewType === "list" && "rounded-l-3xl rounded-tr-none"}`}
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40"></div>

                {board.type === "notepad" ? (
                  // Notepad Thumbnail
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="w-full h-full bg-white dark:bg-[#1a1a20] shadow-lg rounded-xl p-4 border border-gray-100 dark:border-white/5 transform group-hover:scale-105 transition-transform duration-500 flex flex-col gap-2">
                      <div className="w-1/2 h-2 bg-gray-200 dark:bg-white/10 rounded-full" />
                      <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full" />
                      <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full" />
                      <div className="w-3/4 h-2 bg-gray-100 dark:bg-white/5 rounded-full" />
                    </div>
                  </div>
                ) : (
                  // Canvas Thumbnail
                  <>
                    <div
                      className="absolute inset-0 bg-grid-slate-200/60 dark:bg-grid-slate-800/40 [mask-image:linear-gradient(to_bottom,white,transparent)]"
                      style={{ backgroundSize: "24px 24px" }}
                    />
                    {(board.notes ?? []).length > 0 &&
                    (board.notes ?? []).some((n) => n.type === "image") ? (
                      <img
                        src={
                          (board.notes ?? []).find((n) => n.type === "image")
                            ?.content
                        }
                        className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                        alt="thumbnail"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-gray-800">
                        <LayoutGrid className="w-16 h-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                  </>
                )}

                {/* Type Badge */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur text-[10px] font-bold uppercase tracking-wider border border-black/5 dark:border-white/10 text-muted-foreground flex items-center gap-1.5">
                  {board.type === "notepad" ? (
                    <FileText className="w-3 h-3" />
                  ) : (
                    <Palette className="w-3 h-3" />
                  )}
                  {board.type}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info Area */}
              <div
                className={`p-6 flex-1 flex flex-col justify-between ${viewType === "list" ? "py-0" : ""}`}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start w-full relative">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 pr-8">
                      {board.title}
                    </h3>

                    {/* 3-Dot Menu Toggle */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(
                            activeMenuId === board.id ? null : board.id,
                          );
                        }}
                        className="p-2 -mr-2 -mt-2 rounded-full text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 hover:text-foreground transition-colors z-20 relative"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === board.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white dark:bg-[#18181b] rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 z-30 overflow-hidden animate-scale-in origin-top-right">
                          <div className="p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowShareModal(board);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2 font-medium"
                            >
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBoard(board.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
                    Last edited {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div
                  className={`flex items-center justify-between ${viewType === "grid" ? "mt-6" : "mt-2"}`}
                >
                  <div className="flex -space-x-2">
                    {board.collaborators.slice(0, 4).map((c) => (
                      <img
                        key={c.id}
                        src={c.avatar}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-[#151518]"
                        alt={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
          <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
            <FolderPlus className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            No projects found
          </h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Try adjusting your search or create a new canvas to get started.
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary font-medium hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-white/10 transform transition-all animate-scale-in">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Create New Project
            </h3>
            <p className="text-muted-foreground text-sm mb-8">
              Choose how you want to capture your ideas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                onClick={() => setSelectedType("canvas")}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${selectedType === "canvas" ? "border-primary bg-primary/5" : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${selectedType === "canvas" ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/10 text-muted-foreground"}`}
                >
                  <Palette className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">
                  Visual Canvas
                </h4>
                <p className="text-sm text-muted-foreground">
                  Infinite whiteboard for flowcharts, images, and spatial
                  organization.
                </p>
              </div>

              <div
                onClick={() => setSelectedType("notepad")}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${selectedType === "notepad" ? "border-primary bg-primary/5" : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${selectedType === "notepad" ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/10 text-muted-foreground"}`}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-foreground mb-1">
                  Text Document
                </h4>
                <p className="text-sm text-muted-foreground">
                  Distraction-free markdown editor for writing and
                  documentation.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder={
                    selectedType === "canvas"
                      ? "e.g. Q4 Strategy Roadmap"
                      : "e.g. Meeting Notes"
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newBoardTitle) {
                      onCreateBoard(newBoardTitle, selectedType);
                      setNewBoardTitle("");
                      setShowCreateModal(false);
                    }
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-600 rounded-xl shadow-lg shadow-primary/20 transition-all"
                >
                  Create {selectedType === "canvas" ? "Board" : "Doc"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10 transform transition-all animate-scale-in">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Join a Session
            </h3>
            <p className="text-muted-foreground text-sm mb-8">
              Paste the invite code to collaborate.
            </p>

            <input
              type="text"
              placeholder="X K 9 P L 2"
              maxLength={6}
              className="w-full px-4 py-5 text-center text-3xl font-mono tracking-[0.5em] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-foreground focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-all"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (joinCode) {
                    onJoinBoard(joinCode);
                    setJoinCode("");
                    setShowJoinModal(false);
                  }
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-foreground dark:bg-white dark:text-black hover:opacity-90 rounded-xl transition-all"
              >
                Enter Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10 transform transition-all animate-scale-in">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-6 text-purple-600">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Collaborate
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Share this code with your team to invite them to{" "}
              <span className="font-bold text-foreground">
                {showShareModal.title}
              </span>
              .
            </p>

            <div
              className="relative group cursor-pointer"
              onClick={() => handleCopyCode(showShareModal.shareCode)}
            >
              <div className="w-full px-4 py-5 text-center text-4xl font-mono tracking-[0.2em] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 text-foreground font-bold select-all">
                {showShareModal.shareCode}
              </div>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors">
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </div>
            </div>
            <p
              className={`text-center text-xs font-bold mt-3 transition-opacity ${copied ? "text-green-500 opacity-100" : "opacity-0"}`}
            >
              Copied to clipboard!
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowShareModal(null)}
                className="w-full px-6 py-3 text-sm font-bold text-white bg-foreground dark:bg-white dark:text-black hover:opacity-90 rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
