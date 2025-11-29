
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
      // Hardcode a specific phone number as admin for testing
      const isAdmin = phoneNumber === '9999999999';
      
      const user: User = {
          id: 'u_' + phoneNumber,
          email: '', // Empty for phone users
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
    // Profile updates are self-service, allow non-admin
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

  // Admin User Management (Mock) - RESTRICTED
  async getAllUsers(): Promise<User[]> {
      await delay(500);
      this.ensureAdmin(); // RESTRICTED

      const currentUser = this.getCurrentUser();
      // Generate some mock users
      const mockUsers: User[] = [
          { id: 'u_1', email: 'john.doe@example.com', name: 'John Doe', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: 'u_2', email: 'sarah.smith@test.com', name: 'Sarah Smith', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: 'u_3', email: 'admin@bioscoop.com', name: 'Admin', isAdmin: true, watchlist: [], continueWatching: [] },
          { id: 'u_4', email: 'mike.ross@law.com', name: 'Mike Ross', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: 'u_5', phoneNumber: '9876543210', email: '', name: 'Mobile User', isAdmin: false, watchlist: [], continueWatching: [] },
      ];
      
      // If current user is unique (not in mock), add them
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

      // In a real app, delete from DB. Here we just pretend.
      console.log(`User ${userId} deleted by Admin`);
  }

  // Downloads Management
  getDownloads(): Download[] {
    return this.getDownloadsFromStorage();
  }

  addDownload(download: Download) {
    const current = this.getDownloadsFromStorage();
    // Prevent duplicates for same content+quality
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

  isDownloaded(contentId: string): boolean {
    const current = this.getDownloadsFromStorage();
    return current.some(d => d.contentId === contentId);
  }
}

export const dataService = new DataService();
