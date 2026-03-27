import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ubcrnowlgsbmxbaukwjm.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViY3Jub3dsZ3NibXhiYXVrd2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDUxMTksImV4cCI6MjA5MDEyMTExOX0.dIdverG7cPxbLiWvLgokdhk7g7KqNpsY5P756ZywT3E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  console.log('Starting server...');
  try {
    const app = express();
    const httpServer = createHttpServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    const PORT = 3000;

    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());

    // --- Socket.io Logic ---
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join_session', (sessionId) => {
        socket.join(sessionId);
        console.log(`User ${socket.id} joined session: ${sessionId}`);
      });

      socket.on('send_message', async (data) => {
        const { sessionId, userId, content, userName } = data;
        
        // Broadcast to room
        io.to(sessionId).emit('receive_message', {
          userId,
          userName,
          content,
          created_at: new Date().toISOString()
        });

        // Persist to Supabase
        try {
          await supabase.from('messages').insert({
            session_id: sessionId,
            user_id: userId,
            content
          });
        } catch (err) {
          console.error('Error persisting message:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date() });
    });

    // --- Auth Middleware ---
    const authenticateToken = async (req: any, res: any, next: any) => {
      const authHeader = req.headers['authorization'];
      const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);
      
      if (!token) return res.status(401).json({ message: 'Unauthorized' });

      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(403).json({ message: 'Forbidden' });
        
        req.user = user;
        next();
      } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    };

    // --- API Routes ---

    // Auth
    app.post('/api/register', async (req, res) => {
      const { name, email, password } = req.body;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) return res.status(400).json({ message: error.message });
      
      // Create profile entry
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          subjects: [],
          time_slots: []
        });
      }

      res.status(201).json({ message: 'User registered successfully' });
    });

    app.post('/api/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return res.status(401).json({ 
              message: 'Please confirm your email address before logging in, or disable "Confirm email" in your Supabase Auth settings.' 
            });
          }
          return res.status(401).json({ message: error.message });
        }
        
        const token = data.session.access_token;
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        res.json({ token, user: { id: data.user.id, name: data.user.user_metadata.name, email: data.user.email } });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.post('/api/logout', async (req, res) => {
      await supabase.auth.signOut();
      res.clearCookie('token');
      res.json({ message: 'Logged out' });
    });

    // Profile
    app.get('/api/profile', authenticateToken, async (req: any, res) => {
      try {
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', req.user.id)
          .single();

        // If profile doesn't exist, create a basic one
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: req.user.id,
              name: req.user.user_metadata.name || 'Student',
              email: req.user.email,
              subjects: [],
              time_slots: [],
              score: 0
            })
            .select()
            .single();
          
          if (createError) return res.status(500).json({ message: 'Failed to create profile' });
          data = newProfile;
        } else if (error) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json(data);
      } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.post('/api/profile', authenticateToken, async (req: any, res) => {
      const { subjects, time_slots } = req.body;
      const score = (subjects.length * 10) + (time_slots.length * 15);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ subjects, time_slots, score, updated_at: new Date() })
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ message: error.message });
      res.json({ message: 'Profile updated', profile: data });
    });

    // Matching Logic
    app.get('/api/matches', authenticateToken, async (req: any, res) => {
      try {
        let { data: currentUser, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', req.user.id)
          .single();

        // If profile doesn't exist, create it
        if (userError && userError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: req.user.id,
              name: req.user.user_metadata.name || 'Student',
              email: req.user.email,
              subjects: [],
              time_slots: [],
              score: 0
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Match profile creation error:', createError);
            return res.status(500).json({ message: 'Failed to create profile' });
          }
          currentUser = newProfile;
        } else if (userError) {
          console.error('Match user fetch error:', userError);
          // If table doesn't exist, return empty matches
          if (userError.message.includes('relation "profiles" does not exist')) {
            return res.json([]);
          }
          return res.status(500).json({ message: userError.message });
        }

        const { data: allUsers, error: allUsersError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', req.user.id);

        if (allUsersError) {
          console.error('Match all users fetch error:', allUsersError);
          return res.status(500).json({ message: allUsersError.message });
        }

        console.log(`Found ${allUsers?.length || 0} other users for matching`);

        const matches = (allUsers || [])
          .map(otherUser => {
            const commonSubjects = (currentUser.subjects || []).filter((s: string) => (otherUser.subjects || []).includes(s));
            const commonSlots = (currentUser.time_slots || []).filter((a: string) => (otherUser.time_slots || []).includes(a));

            if (commonSubjects.length > 0 && commonSlots.length > 0) {
              const match_score = (commonSubjects.length * 10) + (commonSlots.length * 15);
              return {
                id: otherUser.id,
                name: otherUser.name,
                commonSubjects,
                commonSlots,
                score: match_score
              };
            }
            return null;
          })
          .filter(m => m !== null)
          .sort((a: any, b: any) => b.score - a.score);

        res.json(matches);
      } catch (err) {
        console.error('Matches route error:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    // Sessions
    app.post('/api/session/create', authenticateToken, async (req: any, res) => {
      const { partnerId, subject, timeSlot } = req.body;
      
      try {
        // 1. Create or find a match
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: req.user.id,
            user2_id: partnerId,
            common_subject: subject,
            common_time: timeSlot,
            status: 'accepted'
          })
          .select()
          .single();

        if (matchError) return res.status(400).json({ message: matchError.message });

        const sessionId = uuidv4();
        const newSession = {
          id: sessionId,
          match_id: match.id,
          subject,
          time_slot: timeSlot,
          meeting_link: `https://meet.jit.si/${sessionId}`,
          status: 'active',
          created_at: new Date()
        };

        const { error: sessionError } = await supabase.from('sessions').insert(newSession);
        if (sessionError) return res.status(400).json({ message: sessionError.message });

        // Add participants
        await supabase.from('session_participants').insert([
          { session_id: sessionId, user_id: req.user.id },
          { session_id: sessionId, user_id: partnerId }
        ]);

        res.status(201).json(newSession);
      } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.get('/api/sessions', authenticateToken, async (req: any, res) => {
      try {
        // Find sessions via participants
        const { data: participantRecords, error: pError } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', req.user.id);

        if (pError) {
          console.error('Session participants fetch error:', pError);
          return res.status(500).json({ message: pError.message });
        }

        const sessionIds = (participantRecords || []).map(r => r.session_id);
        console.log(`Found ${sessionIds.length} sessions for user ${req.user.id}`);
        if (sessionIds.length === 0) return res.json([]);

        const { data: sessions, error: sError } = await supabase
          .from('sessions')
          .select('*')
          .in('id', sessionIds);

        if (sError) {
          console.error('Sessions fetch error:', sError);
          return res.status(500).json({ message: sError.message });
        }

        // Fetch all participants for these sessions
        const { data: allParticipants, error: apError } = await supabase
          .from('session_participants')
          .select('session_id, user_id')
          .in('session_id', sessionIds);

        if (apError) {
          console.error('All participants fetch error:', apError);
          return res.status(500).json({ message: apError.message });
        }

        // Fetch profiles separately to avoid relationship issues in Supabase schema cache
        const allParticipantUserIds = [...new Set((allParticipants || []).map(p => p.user_id))];
        
        let profileMap: Record<string, string> = {};
        if (allParticipantUserIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', allParticipantUserIds);
          
          if (!profilesError && profiles) {
            profileMap = profiles.reduce((acc: any, p: any) => {
              acc[p.id] = p.name;
              return acc;
            }, {});
          }
        }
        
        console.log(`Successfully fetched ${sessions?.length || 0} sessions`);
        // Map back to frontend expected format
        const formattedSessions = (sessions || []).map(s => {
          const participants = (allParticipants || [])
            .filter(p => p.session_id === s.id && p.user_id !== req.user.id)
            .map(p => profileMap[p.user_id] || 'Partner');
          
          return {
            ...s,
            timeSlot: s.time_slot,
            meetingLink: s.meeting_link,
            createdAt: s.created_at,
            participants: participants.length > 0 ? participants : ['Study Partner']
          };
        });
        
        res.json(formattedSessions);
      } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    app.delete('/api/session/:id', authenticateToken, async (req: any, res) => {
      const { id } = req.params;
      try {
        // Check if user is participant
        const { data: participant, error: pError } = await supabase
          .from('session_participants')
          .select('*')
          .eq('session_id', id)
          .eq('user_id', req.user.id)
          .single();

        if (pError || !participant) {
          return res.status(403).json({ message: 'Not authorized to delete this session' });
        }

        // Delete session (participants will be deleted via cascade if set up, or we delete them manually)
        const { error: deleteError } = await supabase
          .from('sessions')
          .delete()
          .eq('id', id);

        if (deleteError) return res.status(400).json({ message: deleteError.message });

        res.json({ message: 'Session deleted' });
      } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    // Chat History
    app.get('/api/chat/:sessionId', authenticateToken, async (req: any, res) => {
      const { sessionId } = req.params;
      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) {
          if (error.message.includes('relation "messages" does not exist')) return res.json([]);
          return res.status(500).json({ message: error.message });
        }

        // Fetch profiles manually to avoid relationship issues
        const userIds = [...new Set((messages || []).map(m => m.user_id))];
        let profileMap: Record<string, string> = {};
        
        if (userIds.length > 0) {
          const { data: profiles, error: pError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds);
          
          if (!pError && profiles) {
            profileMap = profiles.reduce((acc: any, p: any) => {
              acc[p.id] = p.name;
              return acc;
            }, {});
          }
        }

        const formattedMessages = (messages || []).map(m => ({
          userId: m.user_id,
          userName: profileMap[m.user_id] || 'Unknown',
          content: m.content,
          created_at: m.created_at
        }));

        res.json(formattedMessages);
      } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    throw err;
  }
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});

