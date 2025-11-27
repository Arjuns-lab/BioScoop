import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details';
import PlayerPage from './pages/Player';
import Admin from './pages/Admin';
import { dataService } from './services/dataService';
import { User } from './types';

// Simple Login Component for demo purposes
const Login = ({ onLogin }: { onLogin: (email: string) => void }) => {
   const [email, setEmail] = useState('');
   return (
      <div className="min-h-screen flex items-center justify-center bg-black">
         <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
            <p className="text-gray-400 mb-6 text-center">Enter your email to sign in</p>
            <form onSubmit={(e) => { e.preventDefault(); onLogin(email); }} className="space-y-4">
               <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-brand-500 focus:outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
               />
               <div className="text-xs text-gray-500">Tip: Use 'admin@bioscoop.com' for admin access.</div>
               <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded font-bold transition-colors">
                  Sign In
               </button>
            </form>
         </div>
      </div>
   )
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = dataService.getCurrentUser();
    if (u) setUser(u);
  }, []);

  const handleLogin = async (email: string) => {
     const u = await dataService.login(email);
     setUser(u);
  };

  const handleLogout = () => {
     dataService.logout();
     setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} logout={handleLogout} />} />
        <Route path="/movies" element={<Home user={user} logout={handleLogout} />} />
        <Route path="/series" element={<Home user={user} logout={handleLogout} />} />
        
        <Route path="/details/:id" element={<Details user={user} logout={handleLogout} />} />
        
        <Route path="/watch/:id" element={user ? <PlayerPage /> : <Navigate to="/login" />} />
        
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route path="/admin" element={user?.isAdmin ? <Admin user={user} /> : <Navigate to="/" />} />
        
        {/* Search Placeholder Route */}
        <Route path="/search" element={<Home user={user} logout={handleLogout} />} />
      </Routes>
    </Router>
  );
};

export default App;