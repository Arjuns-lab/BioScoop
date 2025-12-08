
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sootydlqyvyufdlqeysf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb3R5ZGxxeXZ5dWZkbHFleXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTM4OTcsImV4cCI6MjA4MDcyOTg5N30.xuUnB2yC9kLCfaeEuQl0MX0e2sEB2wPnOPBWJ2jCV6E';

export const supabase = createClient(supabaseUrl, supabaseKey);
