import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ubcrnowlgsbmxbaukwjm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViY3Jub3dsZ3NibXhiYXVrd2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDUxMTksImV4cCI6MjA5MDEyMTExOX0.dIdverG7cPxbLiWvLgokdhk7g7KqNpsY5P756ZywT3E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
