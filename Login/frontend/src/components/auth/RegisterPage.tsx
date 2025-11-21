
import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (name: string, email: string) => void;
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        onRegister(name, email);
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute bottom-1/4 left-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] animate-float" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[100px] animate-float-delayed" />
      </div>

      <div className="w-full max-w-md p-8 relative z-10 animate-slide-up">
        <div className="bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 shadow-lg shadow-orange-500/30 mb-4">
                <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
            <p className="text-sm text-muted-foreground mt-2">Join thousands of designers and thinkers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                        required
                        placeholder="e.g. Jordan Smith"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                        required
                        placeholder="name@company.com"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                        required
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
            >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                    Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button 
                    onClick={onNavigateToLogin}
                    className="font-bold text-foreground hover:underline"
                >
                    Log In
                </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
