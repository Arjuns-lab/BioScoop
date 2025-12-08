
import { supabase } from './supabaseClient';
import { Content, User, PlatformSettings, Download } from '../types';

class DataService {
  private useFallback = false;
  private currentUser: User | null = null;
  private downloads: Download[] = [];

  constructor() {
    this.loadLocalDownloads();
  }

  private loadLocalDownloads() {
    const saved = localStorage.getItem('bioscoop_downloads');
    if (saved) {
      try {
        this.downloads = JSON.parse(saved);
      } catch (e) {
        this.downloads = [];
      }
    }
  }

  private ensureAdmin() {
    if (!this.currentUser?.isAdmin) {
      throw new Error("Unauthorized: Admin access required.");
    }
  }

  // --- Auth ---

  async login(email: string): Promise<User | null> {
    // Basic mock login
    const user: User = {
        id: `user-${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        isAdmin: email.includes('admin'), // Simple check for demo
        watchlist: [],
        continueWatching: []
    };
    this.currentUser = user;
    return user;
  }

  async loginWithPhone(phone: string): Promise<User | null> {
     const user: User = {
        id: `user-${phone}`,
        phoneNumber: phone,
        email: '',
        name: 'User ' + phone.slice(-4),
        isAdmin: false,
        watchlist: [],
        continueWatching: []
     };
     this.currentUser = user;
     return user;
  }

  async sendOTP(phone: string): Promise<void> {
      // Mock OTP
      await new Promise(r => setTimeout(r, 1000));
  }

  async verifyOTP(phone: string, otp: string): Promise<boolean> {
      // Mock verify
      await new Promise(r => setTimeout(r, 1000));
      return otp === '123456'; 
  }

  async logout() {
      await supabase.auth.signOut();
      this.currentUser = null;
  }

  getCurrentUser(): User | null {
      return this.currentUser;
  }

  async fetchUserProfile(userId: string): Promise<User | null> {
      if (this.currentUser && this.currentUser.id === userId) return this.currentUser;
      return this.currentUser;
  }

  async updateUserProfile(name: string): Promise<void> {
      if (this.currentUser) {
          this.currentUser.name = name;
      }
  }

  async getAllUsers(): Promise<User[]> {
      // Mock users list for Admin
      return [
          this.currentUser!,
          { id: '2', name: 'John Doe', email: 'john@example.com', isAdmin: false, watchlist: [], continueWatching: [] },
          { id: '3', name: 'Jane Smith', email: 'jane@example.com', isAdmin: false, watchlist: [], continueWatching: [] }
      ].filter(Boolean);
  }

  async deleteUser(id: string): Promise<void> {
      // Mock delete
  }

  // --- Content ---

  async getAllContent(): Promise<Content[]> {
      try {
          const { data, error } = await supabase.from('content').select('*');
          if (!error && data && data.length > 0) {
              return data.map(this.mapContentFromDB);
          }
      } catch (e) {
          console.warn('Backend unavailable, using mock data');
      }
      return this.getMockContent();
  }

  async getContentById(id: string): Promise<Content | undefined> {
      const all = await this.getAllContent();
      return all.find(c => c.id === id);
  }

  async searchContent(query: string): Promise<Content[]> {
      const all = await this.getAllContent();
      const lower = query.toLowerCase();
      return all.filter(c => c.title.toLowerCase().includes(lower));
  }

  async getTrending(): Promise<Content[]> {
      const all = await this.getAllContent();
      return all.filter(c => c.trending);
  }

  async getByLanguage(lang: string): Promise<Content[]> {
      const all = await this.getAllContent();
      return all.filter(c => c.languages.includes(lang as any));
  }

  async getContinueWatchingContent(): Promise<Content[]> {
      const all = await this.getAllContent();
      return all.slice(0, 3).map(c => ({ ...c, progress: Math.floor(Math.random() * 80) + 10 }));
  }

  async getWatchlistContent(): Promise<Content[]> {
      const all = await this.getAllContent();
      if (!this.currentUser) return [];
      return all.filter(c => this.currentUser?.watchlist.includes(c.id));
  }

  async toggleWatchlist(contentId: string): Promise<void> {
      if (!this.currentUser) return;
      if (this.currentUser.watchlist.includes(contentId)) {
          this.currentUser.watchlist = this.currentUser.watchlist.filter(id => id !== contentId);
      } else {
          this.currentUser.watchlist.push(contentId);
      }
  }

  updateWatchProgress(contentId: string, time: number, duration: number) {
      localStorage.setItem(`progress_${contentId}`, time.toString());
  }

  getWatchPosition(contentId: string): number {
      const saved = localStorage.getItem(`progress_${contentId}`);
      return saved ? parseFloat(saved) : 0;
  }

  async addContent(content: Partial<Content>): Promise<void> {
      // Mock add
  }

  async deleteContent(id: string): Promise<void> {
      // Mock delete
  }

  // --- Downloads ---

  isDownloaded(contentId: string): boolean {
      return this.downloads.some(d => d.contentId === contentId);
  }

  getDownloads(): Download[] {
      return this.downloads;
  }

  addDownload(download: Download) {
      this.downloads.push(download);
      localStorage.setItem('bioscoop_downloads', JSON.stringify(this.downloads));
  }

  removeDownload(id: string) {
      this.downloads = this.downloads.filter(d => d.contentId !== id);
      localStorage.setItem('bioscoop_downloads', JSON.stringify(this.downloads));
  }

  removeAllDownloads() {
      this.downloads = [];
      localStorage.removeItem('bioscoop_downloads');
  }

  saveToDevice(src: string, title: string) {
      console.log(`Saving ${title} from ${src} to device`);
  }

  getStorageUsage() {
      return { usedGB: '2.4', totalGB: 64, percent: 15 };
  }

  // --- Platform Settings ---

  async getPlatformSettings(): Promise<PlatformSettings> {
      try {
          const { data, error } = await supabase.from('platform_settings').select('*').single();
          if (!error && data) {
              return {
                  maintenanceMode: data.maintenance_mode,
                  globalAlert: data.global_alert
              };
          }
      } catch (e) {}
      return { maintenanceMode: false, globalAlert: '' };
  }

  async savePlatformSettings(settings: PlatformSettings): Promise<void> {
      this.ensureAdmin();
      if (this.useFallback) throw new Error("Backend unavailable.");
      
      const dbSettings = {
          id: 1, // Enforce Singleton row with ID 1
          maintenance_mode: settings.maintenanceMode,
          global_alert: settings.globalAlert
      };

      // Use upsert to create if not exists or update if exists
      const { error } = await supabase
          .from('platform_settings')
          .upsert(dbSettings);
          
      if (error) throw new Error(error.message);
  }

  // --- Mock Data ---

  private getMockContent(): Content[] {
      return [
          {
              id: '1',
              title: 'Kalki 2898 AD',
              description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.',
              type: 'movie',
              languages: ['Telugu', 'Hindi', 'Tamil'],
              genres: ['Sci-Fi', 'Action'],
              releaseYear: 2024,
              posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop',
              bannerUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2670&auto=format&fit=crop',
              rating: 9.2,
              trending: true,
              videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              createdAt: new Date().toISOString()
          },
          {
              id: '2',
              title: 'Salaar: Part 1',
              description: 'A gang leader makes a promise to a dying friend and takes on other criminal gangs.',
              type: 'movie',
              languages: ['Telugu', 'Hindi'],
              genres: ['Action', 'Thriller'],
              releaseYear: 2023,
              posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop',
              bannerUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2670&auto=format&fit=crop',
              rating: 8.5,
              trending: true,
              videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              createdAt: new Date().toISOString()
          },
          {
              id: '3',
              title: 'Pushpa 2',
              description: 'Pushpa Raj runs a smuggling syndicate of red sandalwood. A conflict ensues when he faces a new antagonist.',
              type: 'movie',
              languages: ['Telugu', 'Hindi'],
              genres: ['Action', 'Drama'],
              releaseYear: 2024,
              posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2670&auto=format&fit=crop',
              bannerUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=2560&auto=format&fit=crop',
              rating: 9.0,
              trending: true,
              videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              createdAt: new Date().toISOString()
          },
          {
              id: '4',
              title: 'The Family Man',
              description: 'A working man from the National Investigation Agency tries to protect the nation from terrorism, but he also needs to keep his family safe from his secret job.',
              type: 'series',
              languages: ['Hindi', 'English'],
              genres: ['Action', 'Thriller'],
              releaseYear: 2021,
              posterUrl: 'https://images.unsplash.com/photo-1512070800539-bf22d2c3b52f?q=80&w=2500&auto=format&fit=crop',
              bannerUrl: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=2679&auto=format&fit=crop',
              rating: 8.8,
              trending: false,
              seasons: [
                  {
                      seasonNumber: 1,
                      episodes: [
                          { id: 's1e1', season: 1, episodeNumber: 1, title: 'The Family Man', duration: '45m', videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
                          { id: 's1e2', season: 1, episodeNumber: 2, title: 'Sleepers', duration: '42m', videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
                      ]
                  }
              ],
              createdAt: new Date().toISOString()
          }
      ];
  }

  private mapContentFromDB(data: any): Content {
      return {
          ...data,
          languages: data.languages || [],
          genres: data.genres || [],
          seasons: data.seasons || []
      };
  }
}

export const dataService = new DataService();
