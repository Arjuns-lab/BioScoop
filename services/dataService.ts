
import { Content, User, Language, Download, PlatformSettings } from '../types';

// Initial Seed Data
const INITIAL_CONTENT: Content[] = [
  {
    id: '1',
    title: 'Kalki 2898 AD',
    description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.',
    type: 'movie',
    languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
    genres: ['Action', 'Sci-Fi', 'Mythology'],
    releaseYear: 2024,
    posterUrl: 'https://picsum.photos/seed/kalki/300/450',
    bannerUrl: 'https://picsum.photos/seed/kalki-banner/1200/600',
    rating: 9.2,
    trending: true,
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '2h 58m',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Salaar: Part 1',
    description: 'A gang leader tries to keep a promise made to his dying friend and takes on the other criminal gangs.',
    type: 'movie',
    languages: ['Telugu', 'Hindi', 'Kannada'],
    genres: ['Action', 'Drama'],
    releaseYear: 2023,
    posterUrl: 'https://picsum.photos/seed/salaar/300/450',
    bannerUrl: 'https://picsum.photos/seed/salaar-banner/1200/600',
    rating: 8.5,
    trending: true,
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '2h 55m',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Leo',
    description: 'Parthiban is a mild-mannered cafe owner in Kashmir, who fends off a gang of murderous thugs and gains attention from a drug cartel.',
    type: 'movie',
    languages: ['Tamil', 'Telugu', 'Hindi'],
    genres: ['Action', 'Thriller'],
    releaseYear: 2023,
    posterUrl: 'https://picsum.photos/seed/leo/300/450',
    bannerUrl: 'https://picsum.photos/seed/leo-banner/1200/600',
    rating: 8.8,
    trending: true,
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '2h 44m',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'The Family Man',
    description: 'A working man from the National Investigation Agency tries to protect the nation from terrorism, but he also needs to keep his family safe from his secret job.',
    type: 'series',
    languages: ['Hindi', 'Telugu', 'Tamil', 'English'],
    genres: ['Action', 'Comedy', 'Drama'],
    releaseYear: 2019,
    posterUrl: 'https://picsum.photos/seed/familyman/300/450',
    bannerUrl: 'https://picsum.photos/seed/familyman-banner/1200/600',
    rating: 9.5,
    trending: true,
    createdAt: new Date().toISOString(),
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { id: 's1e1', season: 1, episodeNumber: 1, title: 'The Family Man', duration: '45m', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
          { id: 's1e2', season: 1, episodeNumber: 2, title: 'Sleepers', duration: '48m', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
        ]
      }
    ]
  },
  {
    id: '5',
    title: 'RRR',
    description: 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.',
    type: 'movie',
    languages: ['Telugu', 'Hindi', 'English'],
    genres: ['Action', 'Drama', 'History'],
    releaseYear: 2022,
    posterUrl: 'https://picsum.photos/seed/rrr/300/450',
    bannerUrl: 'https://picsum.photos/seed/rrr-banner/1200/600',
    rating: 9.0,
    trending: false,
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '3h 2m',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Vikram',
    description: 'A special investigator discovers a case of serial killings is not what it seems to be, and leading down this path will end in a war between everyone involved.',
    type: 'movie',
    languages: ['Tamil', 'Telugu', 'Hindi'],
    genres: ['Action', 'Thriller'],
    releaseYear: 2022,
    posterUrl: 'https://picsum.photos/seed/vikram/300/450',
    bannerUrl: 'https://picsum.photos/seed/vikram-banner/1200/600',
    rating: 8.9,
    trending: false,
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '2h 54m',
    createdAt: new Date().toISOString(),
  }
];

const STORAGE_KEY = 'bioscoop_content_db';
const USER_KEY = 'bioscoop_user_v1';
const DOWNLOADS_KEY = 'bioscoop_downloads';
const SETTINGS_KEY = 'bioscoop_platform_settings';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DataService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONTENT));
    }
    if (!localStorage.getItem(DOWNLOADS_KEY)) {
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify([]));
    }
  }

  private getContentFromStorage(): Content[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveContentToStorage(content: Content[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }

  private getDownloadsFromStorage(): Download[] {
    const data = localStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveDownloadsToStorage(downloads: Download[]) {
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
  }

  // Security Helper: Throws error if user is not admin
  private ensureAdmin() {
    const user = this.getCurrentUser();
    if (!user || !user.isAdmin) {
       console.error("Access Denied: User is not an admin", user);
       throw new Error("Access Denied: You do not have permission to perform this action.");
    }
  }

  // PUBLIC READ API
  async getAllContent(): Promise<Content[]> {
    await delay(500);
    return this.getContentFromStorage();
  }

  async getContentById(id: string): Promise<Content | undefined> {
    await delay(300);
    const all = this.getContentFromStorage();
    return all.find(c => c.id === id);
  }

  async getTrending(): Promise<Content[]> {
    await delay(300);
    const all = this.getContentFromStorage();
    return all.filter(c => c.trending);
  }

  async getByLanguage(lang: Language): Promise<Content[]> {
    await delay(300);
    const all = this.getContentFromStorage();
    return all.filter(c => c.languages.includes(lang));
  }

  async searchContent(query: string): Promise<Content[]> {
    await delay(400);
    const all = this.getContentFromStorage();
    const lowerQ = query.toLowerCase();
    return all.filter(c => 
      c.title.toLowerCase().includes(lowerQ) || 
      c.genres.some(g => g.toLowerCase().includes(lowerQ))
    );
  }

  // ADMIN PROTECTED WRITE API
  async addContent(content: Omit<Content, 'id' | 'createdAt'>): Promise<Content> {
    await delay(800);
    this.ensureAdmin(); // RESTRICTED

    const all = this.getContentFromStorage();
    const newContent: Content = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    all.unshift(newContent);
    this.saveContentToStorage(all);
    return newContent;
  }

  async updateContent(content: Content): Promise<Content> {
    await delay(600);
    this.ensureAdmin(); // RESTRICTED

    const all = this.getContentFromStorage();
    const index = all.findIndex(c => c.id === content.id);
    if (index !== -1) {
      all[index] = content;
      this.saveContentToStorage(all);
    }
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    await delay(500);
    this.ensureAdmin(); // RESTRICTED

    const all = this.getContentFromStorage();
    const filtered = all.filter(c => c.id !== id);
    this.saveContentToStorage(filtered);
  }

  // Platform Settings Management
  async getPlatformSettings(): Promise<PlatformSettings> {
    await delay(300);
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { maintenanceMode: false, globalAlert: '' };
  }

  async savePlatformSettings(settings: PlatformSettings): Promise<void> {
    await delay(500);
    this.ensureAdmin(); // RESTRICTED
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // OTP Logic (Mock)
  async sendOTP(phoneNumber: string): Promise<boolean> {
     await delay(1000); // Simulate SMS gateway delay
     // In a real app, backend sends SMS. Here we just return true.
     console.log(`Sending OTP to ${phoneNumber}: 1234`);
     return true;
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
      await delay(800);
      return otp === '1234'; // Mock OTP
  }

  // Auth Simulation
  async loginWithPhone(phoneNumber: string): Promise<User> {
      await delay(500);
      const isAdmin = phoneNumber === '9999999999';
      
      const user: User = {
          id: 'u_' + phoneNumber,
          email: '',
          phoneNumber,
          name: isAdmin ? 'Admin' : `User ${phoneNumber.slice(-4)}`,
          isAdmin,
          watchlist: [],
          continueWatching: []
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
  }

  async login(email: string): Promise<User> {
    await delay(600);
    const isAdmin = email.includes('admin');
    const user: User = {
      id: 'u_' + Date.now(),
      email,
      name: email.split('@')[0],
      isAdmin,
      watchlist: [],
      continueWatching: []
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  async updateUserProfile(name: string): Promise<User | null> {
    await delay(400);
    const currentUser = this.getCurrentUser();
    if(currentUser) {
      const updated = { ...currentUser, name };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    }
    return null;
  }

  getCurrentUser(): User | null {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  logout() {
    localStorage.removeItem(USER_KEY);
  }

  // Watchlist Management
  async toggleWatchlist(contentId: string): Promise<string[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    const index = user.watchlist.indexOf(contentId);
    if (index === -1) {
        user.watchlist.push(contentId);
    } else {
        user.watchlist.splice(index, 1);
    }
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user.watchlist;
  }

  async getWatchlistContent(): Promise<Content[]> {
      const user = this.getCurrentUser();
      if (!user) return [];
      
      const allContent = this.getContentFromStorage(); 
      return allContent.filter(c => user.watchlist.includes(c.id));
  }

  // Continue Watching Management
  async updateWatchProgress(contentId: string, currentTime: number, duration: number) {
      const user = this.getCurrentUser();
      if (!user) return;

      const progressPercent = (currentTime / duration) * 100;
      
      // Update local array
      const existingIndex = user.continueWatching.findIndex(item => item.contentId === contentId);
      
      if (existingIndex !== -1) {
          // Update existing
          user.continueWatching[existingIndex] = { contentId, progress: progressPercent, duration, timestamp: currentTime };
          // Move to front
          const item = user.continueWatching.splice(existingIndex, 1)[0];
          user.continueWatching.unshift(item);
      } else {
          // Add new
          user.continueWatching.unshift({ contentId, progress: progressPercent, duration, timestamp: currentTime });
      }

      // Keep only last 10
      if (user.continueWatching.length > 10) {
          user.continueWatching = user.continueWatching.slice(0, 10);
      }

      localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getContinueWatchingContent(): Promise<Content[]> {
      const user = this.getCurrentUser();
      if (!user || user.continueWatching.length === 0) return [];
      
      const allContent = this.getContentFromStorage();
      
      // Map continue watching items to content objects and inject progress
      const cwContent: Content[] = [];
      
      for (const cwItem of user.continueWatching) {
          const content = allContent.find(c => c.id === cwItem.contentId);
          if (content) {
              // Clone and add UI-specific progress property
              cwContent.push({
                  ...content,
                  progress: cwItem.progress
              });
          }
      }
      
      return cwContent;
  }

  getWatchPosition(contentId: string): number {
      const user = this.getCurrentUser();
      if (!user) return 0;
      const item = user.continueWatching.find(c => c.contentId === contentId);
      return item ? item.timestamp : 0;
  }

  // Admin User Management (Mock) - RESTRICTED
  async getAllUsers(): Promise<User[]> {
      await delay(500);
      this.ensureAdmin(); // RESTRICTED

      const currentUser = this.getCurrentUser();
      const mockUsers: User[] = [
          { id: 'u_1', email: 'john.doe@example.com', name: 'John Doe', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: 'u_2', email: 'sarah.smith@test.com', name: 'Sarah Smith', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: 'u_3', email: 'admin@bioscoop.com', name: 'Admin', isAdmin: true, watchlist: [], continueWatching: [] },
          { id: 'u_4', email: 'mike.ross@law.com', name: 'Mike Ross', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: 'u_5', phoneNumber: '9876543210', email: '', name: 'Mobile User', isAdmin: false, watchlist: [], continueWatching: [] },
      ];
      
      if (currentUser) {
         const exists = mockUsers.find(u => 
             (u.email && u.email === currentUser.email) || 
             (u.phoneNumber && u.phoneNumber === currentUser.phoneNumber)
         );
         if (!exists) mockUsers.unshift(currentUser);
      }
      
      return mockUsers;
  }

  async deleteUser(userId: string): Promise<void> {
      await delay(400);
      this.ensureAdmin(); // RESTRICTED
      console.log(`User ${userId} deleted by Admin`);
  }

  // Downloads Management
  getDownloads(): Download[] {
    return this.getDownloadsFromStorage();
  }

  addDownload(download: Download) {
    const current = this.getDownloadsFromStorage();
    const exists = current.find(d => d.contentId === download.contentId && d.quality === download.quality);
    if (!exists) {
       current.unshift(download);
       this.saveDownloadsToStorage(current);
    }
  }

  removeDownload(contentId: string) {
    const current = this.getDownloadsFromStorage();
    const filtered = current.filter(d => d.contentId !== contentId);
    this.saveDownloadsToStorage(filtered);
  }

  removeAllDownloads() {
      this.saveDownloadsToStorage([]);
  }

  isDownloaded(contentId: string): boolean {
    const current = this.getDownloadsFromStorage();
    return current.some(d => d.contentId === contentId);
  }

  // Trigger Real Browser Download
  triggerBrowserDownload(url: string, filename: string) {
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      // Sanitize filename
      a.download = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp4';
      a.target = '_blank'; // Needed for cross-origin urls in some browsers
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  // Storage Usage Simulation
  getStorageUsage() {
    const downloads = this.getDownloadsFromStorage();
    let usedBytes = 0;
    
    downloads.forEach(d => {
        // Parse "2.1 GB" or "850 MB"
        const parts = d.size.split(' ');
        if (parts.length === 2) {
            const val = parseFloat(parts[0]);
            const unit = parts[1];
            if (unit === 'GB') usedBytes += val * 1024 * 1024 * 1024;
            if (unit === 'MB') usedBytes += val * 1024 * 1024;
        }
    });

    // Mock Total Space (64 GB)
    const totalBytes = 64 * 1024 * 1024 * 1024;
    
    return {
        usedGB: (usedBytes / (1024 * 1024 * 1024)).toFixed(1),
        totalGB: 64,
        percent: Math.min((usedBytes / totalBytes) * 100, 100)
    };
  }
}

export const dataService = new DataService();
