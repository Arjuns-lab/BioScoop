
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Clock, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Content } from '../types';
import { dataService } from '../services/dataService';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Content[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const searchTimeoutRef = useRef<number | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('bioscoop_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches");
      }
    }
  }, []);

  const updateRecentSearches = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(newHistory);
    localStorage.setItem('bioscoop_recent_searches', JSON.stringify(newHistory));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newHistory = recentSearches.filter(s => s !== term);
    setRecentSearches(newHistory);
    localStorage.setItem('bioscoop_recent_searches', JSON.stringify(newHistory));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateRecentSearches(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setShowSuggestions(false);
      setIsInputFocused(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 1) {
        searchTimeoutRef.current = window.setTimeout(async () => {
            const results = await dataService.searchContent(query);
            setSuggestions(results.slice(0, 5));
            setShowSuggestions(true);
        }, 300);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (content: Content) => {
      updateRecentSearches(content.title);
      navigate(`/details/${content.id}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setShowSuggestions(false);
      setSearchQuery('');
      setSuggestions([]);
      setIsInputFocused(false);
  };

  const handleRecentSearchClick = (term: string) => {
      setSearchQuery(term);
      updateRecentSearches(term);
      navigate(`/search?q=${encodeURIComponent(term)}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setShowSuggestions(false);
      setIsInputFocused(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'New & Popular', path: '/new' },
    { name: 'My List', path: '/mylist' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SuggestionsDropdown = () => {
      // 1. Show Auto-suggestions if user is typing and results exist
      if (showSuggestions && suggestions.length > 0) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {suggestions.map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        className="flex items-center gap-3 p-3 hover:bg-dark-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                    >
                        <img src={item.posterUrl} alt={item.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                <span>{item.releaseYear}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="capitalize text-brand-400">{item.type}</span>
                                <span className="text-yellow-500 ml-auto">★ {item.rating}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
      }

      // 2. Show Recent Searches if input is focused, query is empty, and history exists
      if (isInputFocused && !searchQuery && recentSearches.length > 0) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-2 bg-dark-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Recent Searches</span>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            setRecentSearches([]);
                            localStorage.removeItem('bioscoop_recent_searches');
                        }}
                        className="text-brand-400 hover:text-brand-300 text-[10px]"
                    >
                        Clear All
                    </button>
                </div>
                {recentSearches.map((term) => (
                    <div 
                        key={term}
                        onClick={() => handleRecentSearchClick(term)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-dark-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors group"
                    >
                        <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
                            <Clock size={16} className="text-gray-500" />
                            <span className="font-medium text-sm">{term}</span>
                        </div>
                        <button 
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        );
      }

      return null;
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-gradient-to-b from-black/90 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-12">
            <Link to="/" className="flex-shrink-0">
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-500 tracking-tighter cursor-pointer">
                BioScoop
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive(link.path) ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center gap-6">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Titles, people, genres"
                  className="bg-black/50 border border-gray-600 text-white text-sm rounded-full px-4 py-1.5 focus:outline-none focus:border-brand-500 w-64 transition-all"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => {
                      setTimeout(() => {
                         setShowSuggestions(false);
                         setIsInputFocused(false);
                         if(!searchQuery) setIsSearchOpen(false);
                      }, 200);
                  }}
                />
                <button type="submit" className="absolute right-3 top-1.5 text-gray-400">
                  <Search size={16} />
                </button>
                <SuggestionsDropdown />
              </form>
            ) : (
              <button 
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsInputFocused(true);
                }} 
                className="text-gray-300 hover:text-white"
              >
                <Search size={22} />
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 group relative">
                 {/* User Dropdown */}
                 <div className="flex items-center gap-3 cursor-pointer py-2">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold border border-white/20">
                      {user.name[0].toUpperCase()}
                    </div>
                 </div>

                 <div className="absolute right-0 top-12 w-56 bg-dark-900 border border-gray-800 rounded-xl shadow-2xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-800">
                       <p className="text-sm font-bold text-white truncate">{user.name}</p>
                       <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {user.isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-brand-400 hover:bg-dark-800 transition-colors">
                           <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                     )}
                     <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition-colors">
                        <Settings size={16} /> Settings
                     </Link>
                     <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-800 transition-colors text-left">
                        <LogOut size={16} /> Sign Out
                     </button>
                 </div>
              </div>
            ) : (
              <Link to="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-dark-950 border-t border-gray-800 absolute w-full h-screen overflow-y-auto pb-20">
          <div className="px-4 pt-2 pb-6 space-y-2">
             <form onSubmit={handleSearch} className="mb-4 mt-2">
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 text-gray-500" size={18}/>
                   <input 
                      type="text" 
                      placeholder="Search movies..." 
                      className="w-full bg-dark-900 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => {
                        setTimeout(() => {
                           setShowSuggestions(false);
                           setIsInputFocused(false);
                        }, 200);
                      }}
                   />
                   <SuggestionsDropdown />
                </div>
             </form>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path) ? 'text-white bg-dark-800' : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-800 my-2 pt-2">
               {user ? (
                  <>
                     <div className="px-3 py-2 text-gray-500 text-xs font-bold uppercase tracking-wider">Account</div>
                     {user.isAdmin && (
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-brand-400 font-medium">
                           <LayoutDashboard size={18} /> Admin Dashboard
                        </Link>
                     )}
                     <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-gray-300 font-medium hover:text-white">
                        <Settings size={18} /> Settings
                     </Link>
                     <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-red-400 font-medium hover:bg-dark-900">
                        <LogOut size={18} /> Sign Out
                     </button>
                  </>
               ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-white font-medium">
                     Sign In
                  </Link>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
