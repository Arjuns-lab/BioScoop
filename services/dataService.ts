import { Content, User, Language } from '../types';

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
  }

  private getContentFromStorage(): Content[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveContentToStorage(content: Content[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }

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

  // Admin Functions
  async addContent(content: Omit<Content, 'id' | 'createdAt'>): Promise<Content> {
    await delay(800);
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
    const all = this.getContentFromStorage();
    const filtered = all.filter(c => c.id !== id);
    this.saveContentToStorage(filtered);
  }

  // Auth Simulation
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

  getCurrentUser(): User | null {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  }

  logout() {
    localStorage.removeItem(USER_KEY);
  }
}

export const dataService = new DataService();