
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details';
import PlayerPage from './pages/Player';
import Admin from './pages/Admin';
import SettingsPage from './pages/Settings';
import { dataService } from './services/dataService';
import { User } from './types';
import { Phone, Mail, ArrowRight, Loader2, KeyRound, ArrowLeft } from 'lucide-react';

// Enhanced Login Component with Mobile OTP & Email Toggle
const Login = ({ onLogin }: { onLogin: (identifier: string, method: 'email' | 'phone') => void }) => {
   const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
   const [loading, setLoading] = useState(false);
   
   // Phone State
   const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
   const [phoneNumber, setPhoneNumber] = useState('');
   const [otp, setOtp] = useState('');
   
   // Email State
   const [email, setEmail] = useState('');

   // Phone Logic
   const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if(phoneNumber.length < 10) return alert('Please enter a valid 10-digit number');
      
      setLoading(true);
      await dataService.sendOTP(phoneNumber);
      setLoading(false);
      setPhoneStep('otp');
   };

   const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const isValid = await dataService.verifyOTP(phoneNumber, otp);
      setLoading(false);
      
      if(isValid) {
         onLogin(phoneNumber, 'phone');
      } else {
         alert('Invalid OTP. Please use 1234');
      }
   };

   // Email Logic
   const handleEmailLogin = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      onLogin(email, 'email');
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
         {/* Background Ambience */}
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-600/30 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />

         <div className="bg-dark-900 p-8 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-500 tracking-tighter mb-2">
                    BioScoop
                </h1>
                <p className="text-gray-400">Stream Movies & Series</p>
            </div>

            {loginMethod === 'phone' ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {phoneStep === 'input' ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <span className="absolute left-10 top-3 text-gray-400 border-r border-gray-700 pr-2">+91</span>
                                    <input 
                                        type="tel" 
                                        placeholder="Enter 10-digit number" 
                                        className="w-full bg-dark-950 border border-gray-700 pl-24 pr-4 py-3 rounded-lg text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium tracking-wide"
                                        value={phoneNumber}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if(val.length <= 10) setPhoneNumber(val);
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={phoneNumber.length < 10 || loading}
                                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Get OTP'} <ArrowRight size={18} />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <button 
                                type="button" 
                                onClick={() => setPhoneStep('input')} 
                                className="text-gray-400 hover:text-white flex items-center gap-1 text-xs mb-2"
                            >
                                <ArrowLeft size={12} /> Change Number
                            </button>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Enter OTP</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="• • • •" 
                                        className="w-full bg-dark-950 border border-gray-700 pl-10 pr-4 py-3 rounded-lg text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold tracking-[0.5em] text-center text-lg"
                                        value={otp}
                                        maxLength={4}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-brand-400 mt-2 text-center">Tip: Use 1234 as mock OTP</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={otp.length < 4 || loading}
                                className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-800 disabled:text-gray-500 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-800"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">OR</span>
                            <div className="flex-grow border-t border-gray-800"></div>
                        </div>
                        <button 
                            onClick={() => setLoginMethod('email')}
                            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Login with Email (Admins)
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                <input 
                                    type="email" 
                                    placeholder="admin@bioscoop.com" 
                                    className="w-full bg-dark-950 border border-gray-700 pl-10 pr-4 py-3 rounded-lg text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => {
                                setLoginMethod('phone');
                                setPhoneStep('input');
                                setPhoneNumber('');
                                setOtp('');
                            }}
                            className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                           <ArrowLeft size={14} /> Back to Mobile Login
                        </button>
                    </div>
                </div>
            )}
         </div>
      </div>
   )
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Auth Init
    const u = dataService.getCurrentUser();
    if (u) setUser(u);

    // Theme Init
    const savedTheme = localStorage.getItem('bioscoop_theme');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            const root = document.documentElement;
            if (theme.var) {
               root.style.setProperty('--brand-500', theme.var['500']);
               root.style.setProperty('--brand-600', theme.var['600']);
               root.style.setProperty('--brand-400', theme.var['400']);
               root.style.setProperty('--brand-300', theme.var['300']);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    }
  }, []);

  const handleLogin = async (identifier: string, method: 'email' | 'phone') => {
     let u: User;
     if (method === 'phone') {
         u = await dataService.loginWithPhone(identifier);
     } else {
         u = await dataService.login(identifier);
     }
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
        
        <Route path="/admin" element={user?.isAdmin ? <Admin user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        
        <Route path="/settings" element={user ? <SettingsPage user={user} logout={handleLogout} /> : <Navigate to="/login" />} />
        
        {/* Search Placeholder Route */}
        <Route path="/search" element={<Home user={user} logout={handleLogout} />} />
      </Routes>
    </Router>
  );
};

export default App;
