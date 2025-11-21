
import React, { useState } from 'react';
import { Bell, Moon, Sun, Search, LogOut, Check, X, ChevronDown, Sparkles, Zap } from 'lucide-react';
import { User, Notification, ViewState } from '../../types';

interface HeaderProps {
  user: User | null;
  isDark: boolean;
  toggleTheme: () => void;
  setView: (view: ViewState) => void;
  notifications: Notification[];
  onApproveRequest: (notif: Notification) => void;
  onRejectRequest: (notif: Notification) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  isDark, 
  toggleTheme, 
  setView, 
  notifications,
  onApproveRequest,
  onRejectRequest,
  onLogout
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <header className="w-full max-w-6xl glass dark:bg-[#121212]/80 rounded-full shadow-2xl shadow-black/5 dark:shadow-black/20 pointer-events-auto transition-all duration-500 border border-white/20 dark:border-white/10 backdrop-blur-xl">
        <div className="px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView(user ? 'dashboard' : 'landing')}
          >
            <div className="relative w-9 h-9 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 to-purple-700 shadow-lg group-hover:shadow-primary-500/40 transition-all duration-300 group-hover:scale-105">
               <Zap className="w-5 h-5 text-white fill-white relative z-10" />
               <div className="absolute inset-0 bg-white/20 blur-lg group-hover:blur-md transition-all"></div>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 group-hover:to-primary-400 transition-all">
                Essentra
            </span>
          </div>

          {/* Search Bar - Hidden on mobile, visible when logged in */}
          {user && (
            <div className="hidden md:flex flex-1 max-w-md mx-12 opacity-0 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-2 border-0 bg-gray-100/50 dark:bg-white/5 rounded-full text-sm text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10"
                  placeholder="Search boards, ideas, or teammates..."
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary transition-all duration-200 active:scale-95"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2.5 rounded-full text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 hover:text-primary transition-all duration-200 relative active:scale-95"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#121212] animate-pulse" />
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-6 w-96 glass-card bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl py-2 overflow-hidden animate-scale-in origin-top-right z-50 border border-gray-200 dark:border-gray-800">
                      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                        {unreadCount > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">{unreadCount} new</span>}
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-12 text-center flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-gray-400" />
                            </div>
                            <span className="text-sm font-medium">All caught up!</span>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="p-3 mb-1 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative group cursor-default">
                              <div className="flex gap-3">
                                 <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${notif.read ? 'bg-gray-300 dark:bg-gray-700' : 'bg-primary animate-pulse'}`} />
                                 <div className="flex-1">
                                    <p className="text-sm text-foreground font-semibold leading-tight">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.message}</p>
                                    
                                    {notif.type === 'access_request' && notif.data && (
                                        <div className="mt-3 flex gap-2">
                                        <button 
                                            onClick={() => onApproveRequest(notif)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary/20"
                                        >
                                            <Check className="h-3 w-3" /> Approve
                                        </button>
                                        <button 
                                            onClick={() => onRejectRequest(notif)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-foreground text-xs font-bold rounded-xl transition-all"
                                        >
                                            <X className="h-3 w-3" /> Reject
                                        </button>
                                        </div>
                                    )}
                                 </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                  >
                    <div className="relative">
                        <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                        src={user.avatar}
                        alt={user.name}
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
                  </button>
                  {showProfile && (
                    <div className="absolute right-0 mt-6 w-64 glass-card bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl py-1 overflow-hidden animate-scale-in origin-top-right z-50">
                       <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-primary/5 to-transparent">
                        <p className="text-sm font-bold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                            onClick={() => {
                            setView('dashboard');
                            setShowProfile(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors font-medium"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors flex items-center gap-2 font-medium"
                        >
                            <LogOut className="h-3.5 w-3.5" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                  <button 
                    onClick={() => setView('login')}
                    className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => setView('register')}
                    className="bg-foreground text-background dark:bg-white dark:text-black px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Get Started
                  </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
