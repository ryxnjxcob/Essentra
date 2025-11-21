
import React, { useState, useEffect } from 'react';
import Header from './components/ui/Header';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import BoardEditor from './components/board/BoardEditor';
import NotepadEditor from './components/board/NotepadEditor';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import { Board, User, ViewState, Notification, ProjectType } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock User Database
const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Alex Designer',
        email: 'alex@essentra.app',
        avatar: 'https://i.pravatar.cc/150?u=u1'
    }
];

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  
  // State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [boards, setBoards] = useState<Board[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // --- Auth Actions ---

  const handleLogin = (email: string) => {
    // Simple mock login
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        setCurrentUser(user);
        setView('dashboard');
        // Add a welcome notification
        const notif: Notification = {
            id: uuidv4(),
            type: 'info',
            title: `Welcome back, ${user.name.split(' ')[0]}`,
            message: 'Ready to create something amazing?',
            timestamp: Date.now(),
            read: false
        };
        setNotifications(prev => [notif, ...prev]);
    } else {
        // For demo purposes, auto-create if not found or show alert
        alert('User not found. Please sign up.');
        setView('register');
    }
  };

  const handleRegister = (name: string, email: string) => {
     const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
     if (existing) {
         alert('Email already registered. Please log in.');
         setView('login');
         return;
     }

     const newUser: User = {
         id: uuidv4(),
         name,
         email,
         avatar: `https://i.pravatar.cc/150?u=${uuidv4()}` // Random avatar
     };
     
     setUsers([...users, newUser]);
     setCurrentUser(newUser);
     setView('dashboard');
     
     const notif: Notification = {
        id: uuidv4(),
        type: 'info',
        title: 'Welcome to Essentra!',
        message: 'Your workspace is ready.',
        timestamp: Date.now(),
        read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
  };

  // --- Board Actions ---

  const handleCreateBoard = (title: string, type: ProjectType = 'canvas') => {
    const newBoard: Board = {
      id: uuidv4(),
      type,
      title,
      createdAt: Date.now(),
      thumbnail: '',
      ownerId: currentUser?.id || '',
      collaborators: [currentUser!],
      pendingRequests: [],
      notes: [],
      documentContent: type === 'notepad' ? '' : undefined,
      shareCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    setBoards([newBoard, ...boards]);
  };

  const handleJoinBoard = (code: string) => {
     // Simulate API call
     setTimeout(() => {
         const board = boards.find(b => b.shareCode === code);
         if (board) {
             // Add Request Notification to Owner (Simulated)
             const reqNotif: Notification = {
                 id: uuidv4(),
                 type: 'access_request',
                 title: 'Access Request',
                 message: `Someone wants to join ${board.type === 'canvas' ? 'board' : 'doc'} "${board.title}"`,
                 timestamp: Date.now(),
                 read: false,
                 data: { boardId: board.id, user: { id: 'u2', name: 'Jane Doe', email: 'jane@test.com', avatar: 'https://i.pravatar.cc/150?u=u2'} }
             };
             setNotifications([reqNotif, ...notifications]);
             alert('Request sent to owner!');
         } else {
             alert('Invalid Share Code');
         }
     }, 500);
  };

  const handleDeleteBoard = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setBoards(boards.filter(b => b.id !== id));
    }
  };

  const handleOpenBoard = (id: string) => {
      setActiveBoardId(id);
      setView('board');
  };

  const handleUpdateBoard = (updatedBoard: Board) => {
      setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
  };

  const handleApproveRequest = (notif: Notification) => {
      if (!notif.data) return;
      
      const { boardId, user } = notif.data;
      setBoards(boards.map(b => {
          if (b.id === boardId) {
              return { ...b, collaborators: [...b.collaborators, user] };
          }
          return b;
      }));
      
      // Mark notif as read
      setNotifications(notifications.filter(n => n.id !== notif.id));
      alert(`Approved ${user.name}!`);
  };

  const handleRejectRequest = (notif: Notification) => {
      setNotifications(notifications.filter(n => n.id !== notif.id));
  };

  // --- Render Views ---

  const activeBoard = boards.find(b => b.id === activeBoardId);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-gray-100 font-sans">
      {/* Header shows everywhere except board/notepad view to maximize workspace */}
      {view !== 'board' && (
        <Header 
            user={currentUser}
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
            setView={setView}
            notifications={notifications}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onLogout={handleLogout}
        />
      )}

      <main>
        {view === 'landing' && (
            <LandingPage onGetStarted={() => setView('register')} />
        )}

        {view === 'login' && (
            <LoginPage 
                onLogin={handleLogin} 
                onNavigateToRegister={() => setView('register')} 
            />
        )}

        {view === 'register' && (
            <RegisterPage 
                onRegister={handleRegister}
                onNavigateToLogin={() => setView('login')}
            />
        )}

        {view === 'dashboard' && currentUser && (
            <Dashboard 
                boards={boards}
                user={currentUser}
                onCreateBoard={handleCreateBoard}
                onJoinBoard={handleJoinBoard}
                onDeleteBoard={handleDeleteBoard}
                onOpenBoard={handleOpenBoard}
            />
        )}

        {view === 'board' && activeBoard && currentUser && (
            activeBoard.type === 'notepad' ? (
                <NotepadEditor
                    board={activeBoard}
                    currentUser={currentUser}
                    onBack={() => setView('dashboard')}
                    onUpdateBoard={handleUpdateBoard}
                />
            ) : (
                <BoardEditor 
                    board={activeBoard}
                    currentUser={currentUser}
                    onBack={() => setView('dashboard')}
                    onUpdateBoard={handleUpdateBoard}
                    isDark={isDark}
                    toggleTheme={() => setIsDark(!isDark)}
                />
            )
        )}
      </main>
    </div>
  );
};

export default App;
