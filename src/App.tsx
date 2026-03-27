import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BookOpen, 
  Clock, 
  Search, 
  LogOut, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  Video, 
  Users,
  Calendar,
  ChevronRight,
  Zap,
  Plus,
  Trash2,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { io } from 'socket.io-client';
import { cn } from './lib/utils';
import { SUBJECTS, TIME_SLOTS } from './constants';

// --- Components ---

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 glass-pill px-6 py-4 flex items-center justify-between mx-4 mt-4 rounded-2xl">
    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white group">
      <div className="w-9 h-9 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-via/20 group-hover:scale-110 transition-transform">
        <Zap className="w-5 h-5 fill-white" />
      </div>
      <span className="text-gradient">STUDY</span><span className="text-primary-via">SYNC</span>
    </Link>
    <div className="flex items-center gap-8">
      {user ? (
        <>
          <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-via transition-all group-hover:w-full"></span>
          </Link>
          <Link to="/profile" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
            Profile
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-via transition-all group-hover:w-full"></span>
          </Link>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="primary-gradient hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-via/20">
            Get Started
          </Link>
        </>
      )}
    </div>
  </nav>
);

const AuthLayout = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => (
  <div className="min-h-screen bg-[#010101] flex items-center justify-center p-6 pt-32 relative overflow-hidden">
    {/* Background Glows */}
    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-via/20 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-end/20 rounded-full blur-[120px]"></div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md glass rounded-[2.5rem] p-10 relative z-10"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gradient mb-3">{title}</h1>
        <p className="text-zinc-500 font-medium">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  </div>
);

const Input = ({ label, ...props }: any) => (
  <div className="mb-6">
    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2.5 ml-1">{label}</label>
    <input 
      {...props}
      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary-via/50 focus:bg-white/[0.05] transition-all duration-300"
    />
  </div>
);

const Button = ({ children, className, variant = 'primary', ...props }: any) => (
  <button 
    {...props}
    className={cn(
      "w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2",
      variant === 'primary' ? "primary-gradient text-white shadow-lg shadow-primary-via/20 hover:opacity-90" : "glass glass-hover text-white",
      className
    )}
  >
    {children}
  </button>
);

// --- Pages ---

const Landing = () => (
  <div className="min-h-screen bg-[#010101] text-white pt-40 px-6 relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary-via/10 blur-[120px] rounded-full -z-10"></div>
    
    <div className="max-w-5xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 bg-primary-via/10 border border-primary-via/20 px-5 py-2 rounded-full text-primary-via text-xs font-bold uppercase tracking-widest mb-10"
      >
        <Zap className="w-4 h-4 fill-primary-via" />
        Student Matching System
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-6xl md:text-8xl font-bold tracking-tighter mb-10 leading-[0.9] text-gradient"
      >
        Find your perfect <br />
        <span className="text-primary-via">study partner</span>.
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-zinc-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed"
      >
        Connect with students who share your subjects and schedule. 
        Seamlessly transition from matching to collaborative study sessions.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6"
      >
        <Link to="/register" className="w-full sm:w-auto primary-gradient text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-primary-via/25 hover:scale-105 active:scale-95">
          Join the Community
        </Link>
        <Link to="/login" className="w-full sm:w-auto glass glass-hover text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95">
          Sign In
        </Link>
      </motion.div>
    </div>

    {/* Bento Grid Features */}
    <div className="mt-48 max-w-6xl mx-auto pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-8 glass glass-hover p-12 rounded-[3rem] group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-via/5 blur-[80px] -z-10 group-hover:bg-primary-via/10 transition-all"></div>
          <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-primary-via/20 group-hover:scale-110 transition-transform">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-4xl font-bold mb-6 text-white tracking-tight">Smart Matching</h3>
          <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-lg">
            Our algorithm analyzes your subjects and availability to find the most compatible study partners.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 glass glass-hover p-12 rounded-[3rem] group"
        >
          <div className="w-16 h-16 bg-primary-via/20 border border-primary-via/20 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-primary-via/10 group-hover:scale-110 transition-transform">
            <Video className="w-8 h-8 text-primary-via" />
          </div>
          <h3 className="text-3xl font-bold mb-6 text-white tracking-tight">Instant Sessions</h3>
          <p className="text-lg text-zinc-500 font-medium leading-relaxed">
            One-click meetings generated automatically for your study sessions.
          </p>
        </motion.div>
      </div>
    </div>
  </div>
);

const Login = ({ onLogin }: { onLogin: (user: any, token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (res.ok) {
        onLogin(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your study journey">
      <form onSubmit={handleSubmit}>
        <Input label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <Button type="submit">Sign In</Button>
        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error('Server returned non-JSON response');
      }

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Connection error. Please try again.');
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the community of learners">
      {success ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-white/50">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" type="text" value={name} onChange={(e: any) => setName(e.target.value)} required />
          <Input label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <Button type="submit">Create Account</Button>
          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Login</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

const Profile = () => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('study_sync_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/profile', { headers })
      .then(res => res.json())
      .then(data => {
        setSubjects(data.subjects || []);
        setTimeSlots(data.time_slots || []);
        setLoading(false);
      });
  }, []);

  const toggleItem = (item: string, list: string[], setList: any) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSubject.trim() && !subjects.includes(customSubject.trim())) {
      setSubjects([...subjects, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('study_sync_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ subjects, time_slots: timeSlots })
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error connecting to server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#010101] flex items-center justify-center text-white">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-[#010101] text-white pt-40 px-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-gradient mb-3">Your Profile</h1>
            <p className="text-zinc-500 font-medium">Tell us what you study and when you're free</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-auto px-10">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 p-5 rounded-2xl mb-10 flex items-center gap-3 font-medium"
            >
              <CheckCircle2 className="w-5 h-5" />
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary-via/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Interested Subjects</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  onClick={() => toggleItem(subject, subjects, setSubjects)}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all text-left group",
                    subjects.includes(subject) 
                      ? "bg-primary-via/10 border-primary-via/50 text-white shadow-lg shadow-primary-via/5" 
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.05] hover:border-white/10"
                  )}
                >
                  <span className="font-bold text-lg">{subject}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    subjects.includes(subject) ? "bg-primary-via border-primary-via" : "border-zinc-800 group-hover:border-zinc-700"
                  )}>
                    {subjects.includes(subject) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}

              {/* Custom Subjects */}
              {subjects.filter(s => !SUBJECTS.includes(s)).map(subject => (
                <button
                  key={subject}
                  onClick={() => toggleItem(subject, subjects, setSubjects)}
                  className="flex items-center justify-between p-5 rounded-[1.5rem] border bg-primary-via/10 border-primary-via/50 text-white shadow-lg shadow-primary-via/5 transition-all text-left"
                >
                  <span className="font-bold text-lg">{subject}</span>
                  <div className="w-6 h-6 rounded-full bg-primary-via border-2 border-primary-via flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </button>
              ))}

              <form onSubmit={addCustomSubject} className="flex gap-3 mt-6">
                <input 
                  type="text" 
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Add custom subject..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary-via/50 transition-all"
                />
                <button 
                  type="submit"
                  className="primary-gradient hover:opacity-90 text-white p-4 rounded-2xl transition-all shadow-lg shadow-primary-via/20 active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </form>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10 border border-purple-500/20">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold">Availability</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => toggleItem(slot, timeSlots, setTimeSlots)}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-[1.5rem] border transition-all text-left group",
                    timeSlots.includes(slot) 
                      ? "bg-purple-500/10 border-purple-500/50 text-white shadow-lg shadow-purple-500/5" 
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.05] hover:border-white/10"
                  )}
                >
                  <span className="font-bold text-lg">{slot}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    timeSlots.includes(slot) ? "bg-purple-500 border-purple-500" : "border-zinc-800 group-hover:border-zinc-700"
                  )}>
                    {timeSlots.includes(slot) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false };
  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"></div>
          <div className="relative z-10 glass p-12 rounded-[3rem] max-w-md border border-red-500/20">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Something went wrong</h2>
            <p className="text-zinc-500 mb-10 font-medium leading-relaxed">
              We encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full primary-gradient text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary-via/20 hover:scale-105 active:scale-95"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const Chat = ({ sessionId, user, onClose }: { sessionId: string; user: any; onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let newSocket: any;
    try {
      newSocket = io();
      setSocket(newSocket);

      newSocket.emit('join_session', sessionId);

      newSocket.on('receive_message', (message: any) => {
        setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
      });
    } catch (err) {
      console.error('Socket initialization error:', err);
    }

    // Fetch history
    const token = localStorage.getItem('study_sync_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/chat/${sessionId}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error('Invalid chat history data:', data);
          setMessages([]);
        }
      })
      .catch(err => {
        console.error('Chat history error:', err);
        setMessages([]);
      });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    socket.emit('send_message', {
      sessionId,
      userId: user.id,
      userName: user.name || 'Unknown',
      content: newMessage
    });

    setNewMessage('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-[360px] h-[500px] glass rounded-[2rem] shadow-2xl z-[100] flex flex-col overflow-hidden border border-white/10"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Session Chat</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Live Now</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white border border-white/10 shadow-lg"
          aria-label="Close chat"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div key={i} className={cn("flex flex-col", msg.userId === user?.id ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
              msg.userId === user?.id 
                ? "primary-gradient text-white rounded-tr-none shadow-lg shadow-primary-via/10" 
                : "bg-white/[0.05] text-zinc-300 rounded-tl-none border border-white/5"
            )}>
              {msg.content}
            </div>
            <span className="text-[10px] text-zinc-600 mt-2 font-bold uppercase tracking-widest px-1">
              {msg.userId === user?.id ? 'You' : msg.userName} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white/[0.02] border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary-via/50 transition-all pr-16"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 primary-gradient rounded-xl text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const Dashboard = ({ user }: { user: any }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('study_sync_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const [matchesRes, sessionsRes] = await Promise.all([
        fetch('/api/matches', { headers }),
        fetch('/api/sessions', { headers })
      ]);
      
      if (!matchesRes.ok) {
        const errData = await matchesRes.json().catch(() => ({}));
        throw new Error(`Matches error: ${errData.message || matchesRes.statusText}`);
      }
      if (!sessionsRes.ok) {
        const errData = await sessionsRes.json().catch(() => ({}));
        throw new Error(`Sessions error: ${errData.message || sessionsRes.statusText}`);
      }

      const matchesData = await matchesRes.json();
      const sessionsData = await sessionsRes.json();

      setMatches(Array.isArray(matchesData) ? matchesData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Could not load your dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startSession = async (partner: any) => {
    const subject = partner.commonSubjects[0];
    const timeSlot = partner.commonSlots[0];

    const token = localStorage.getItem('study_sync_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ partnerId: partner.id, subject, timeSlot })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    const token = localStorage.getItem('study_sync_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/session/${sessionId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#010101] flex items-center justify-center text-white">Finding your partners...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center text-white p-6 text-center">
        <p className="text-zinc-500 mb-8 font-medium">{error}</p>
        <Button 
          onClick={fetchData}
          className="w-auto px-10"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010101] text-white pt-40 px-6 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h1 className="text-5xl font-bold tracking-tight text-gradient mb-3">Study Dashboard</h1>
          <p className="text-zinc-500 font-medium">Manage your matches and active study sessions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary-via/20">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Recommended Partners</h2>
            </div>

            {!Array.isArray(matches) || matches.length === 0 ? (
              <div className="glass rounded-[3rem] p-20 text-center">
                <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-8">
                  <Users className="w-10 h-10 text-zinc-700" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No matches yet</h3>
                <p className="text-zinc-500 mb-10 max-w-sm mx-auto font-medium">Try updating your profile with more subjects or availability to find partners.</p>
                <Link to="/profile" className="text-primary-via font-bold hover:text-primary-start transition-colors">Update Profile &rarr;</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {matches.map(match => (
                  <motion.div 
                    key={match.id}
                    layout
                    className="glass glass-hover rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 primary-gradient rounded-3xl flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-primary-via/20 group-hover:scale-105 transition-transform">
                          {match.name ? match.name[0] : '?'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{match.name || 'Anonymous Learner'}</h3>
                          <div className="flex items-center gap-2 text-primary-via text-sm font-bold uppercase tracking-wider">
                            <Zap className="w-4 h-4 fill-primary-via" />
                            {match.score || 0} Match Score
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5 mb-6">
                        {Array.isArray(match.commonSubjects) && match.commonSubjects.map((s: string) => (
                          <span key={s} className="bg-white/[0.05] border border-white/5 px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-400">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        {Array.isArray(match.commonSlots) && match.commonSlots.length > 0 
                          ? match.commonSlots.join(', ') 
                          : 'No common slots'}
                      </div>
                    </div>
                    <Button onClick={() => startSession(match)} className="w-auto px-10 py-4 text-lg">
                      Start Session
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10 border border-purple-500/20">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold">Active Sessions</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {!Array.isArray(sessions) || sessions.length === 0 ? (
                <div className="glass rounded-[2.5rem] p-12 text-center">
                  <p className="text-zinc-600 font-medium">No active sessions.</p>
                </div>
              ) : (
                sessions.map(session => (
                  <motion.div 
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass glass-hover rounded-[2.5rem] p-8 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] -z-10 group-hover:bg-purple-600/20 transition-all"></div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 bg-purple-400/10 px-3 py-1 rounded-lg border border-purple-400/20">{session.subject || 'Study Session'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <button 
                          onClick={() => deleteSession(session.id)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center group/btn"
                          title="Mark as Complete"
                        >
                          <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{Array.isArray(session.participants) ? session.participants.join(' & ') : 'Study Partner'}</h3>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                        <Calendar className="w-4 h-4" />
                        {session.timeSlot}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <a 
                        href={session.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-white/5 active:scale-95"
                      >
                        <Video className="w-5 h-5" />
                        Join Call
                      </a>
                      <button 
                        onClick={() => setActiveChat(session.id)}
                        className="w-16 h-16 glass glass-hover rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                        title="Open Chat"
                      >
                        <MessageSquare className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeChat && (
          <Chat 
            sessionId={activeChat} 
            user={user} 
            onClose={() => setActiveChat(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('study_sync_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('study_sync_token');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('study_sync_token', token);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    localStorage.removeItem('study_sync_token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010101] flex flex-col items-center justify-center text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-via border-t-transparent rounded-full mb-6"
        />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Syncing your study world...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#010101] selection:bg-primary-via/30">
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
