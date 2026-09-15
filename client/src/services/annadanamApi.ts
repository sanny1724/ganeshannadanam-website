import axios from 'axios';
import { Annadanam } from '../types/annadanam';

const API_BASE = '/api/annadanams';

// Initial fallback seed data if backend is offline
const FALLBACK_DATA: Annadanam[] = [
  {
    id: "anna-001",
    committeeName: "Sri Ganesh Utsav Committee",
    city: "Hyderabad",
    area: "Kukatpally",
    address: "Opposite Remedy Hospital, Road No. 1, KPHB Phase 1, Kukatpally, Hyderabad",
    latitude: 17.4933,
    longitude: 78.3995,
    date: "2026-09-15",
    startTime: "12:00 PM",
    endTime: "03:30 PM",
    foodType: "Lunch Annadanam",
    createdAt: "2026-09-14T10:00:00.000Z"
  },
  {
    id: "anna-002",
    committeeName: "Balapur Ganesh Utsav Samithi",
    city: "Hyderabad",
    area: "Balapur",
    address: "Near Balapur Kadiyam & Old Village Ground, Balapur, Hyderabad",
    latitude: 17.3198,
    longitude: 78.5085,
    date: "2026-09-15",
    startTime: "11:30 AM",
    endTime: "03:00 PM",
    foodType: "Mahaprasadam & Full Meals",
    createdAt: "2026-09-14T11:00:00.000Z"
  },
  {
    id: "anna-003",
    committeeName: "Khairatabad Bada Ganesh Seva Samithi",
    city: "Hyderabad",
    area: "Khairatabad",
    address: "Near Khairatabad Metro Station, Chintal Basti Road, Hyderabad",
    latitude: 17.4116,
    longitude: 78.4615,
    date: "2026-09-15",
    startTime: "12:00 PM",
    endTime: "04:00 PM",
    foodType: "Annaprasadam Meals",
    createdAt: "2026-09-14T09:30:00.000Z"
  },
  {
    id: "anna-004",
    committeeName: "Ameerpet Vinayaka Bhakta Mandali",
    city: "Hyderabad",
    area: "Ameerpet",
    address: "Near Satyam Theatre Junction, Gurudwara Lane, Ameerpet, Hyderabad",
    latitude: 17.4375,
    longitude: 78.4482,
    date: "2026-09-15",
    startTime: "12:30 PM",
    endTime: "03:30 PM",
    foodType: "Lunch Annadanam",
    createdAt: "2026-09-14T12:00:00.000Z"
  },
  {
    id: "anna-005",
    committeeName: "Madhapur Youth Ganesh Mandal",
    city: "Hyderabad",
    area: "Madhapur",
    address: "Near Durgam Cheruvu Inorbit Mall Road, Madhapur, Hyderabad",
    latitude: 17.4411,
    longitude: 78.3807,
    date: "2026-09-15",
    startTime: "01:00 PM",
    endTime: "04:00 PM",
    foodType: "Hot Meals & Sweets",
    createdAt: "2026-09-14T14:20:00.000Z"
  },
  {
    id: "anna-006",
    committeeName: "Secunderabad Clock Tower Utsav Committee",
    city: "Hyderabad",
    area: "Secunderabad",
    address: "Clock Tower Grounds, MG Road, Secunderabad",
    latitude: 17.4399,
    longitude: 78.4983,
    date: "2026-09-15",
    startTime: "07:00 PM",
    endTime: "10:00 PM",
    foodType: "Dinner Prasadam",
    createdAt: "2026-09-14T15:00:00.000Z"
  },
  {
    "id": "anna-007",
    committeeName: "Dilsukhnagar Sai Baba Temple Ganesh Samithi",
    city: "Hyderabad",
    area: "Dilsukhnagar",
    address: "Near Dilsukhnagar Main Bus Stop, Hyderabad",
    latitude: 17.3688,
    longitude: 78.5247,
    date: "2026-09-15",
    startTime: "07:30 PM",
    endTime: "10:30 PM",
    foodType: "Dinner Annadanam",
    createdAt: "2026-09-14T16:00:00.000Z"
  },
  {
    id: "anna-009",
    committeeName: "Kukatpally Yuvajana Sangham",
    city: "Hyderabad",
    area: "Kukatpally",
    address: "Vivekananda Nagar Colony Community Hall, Kukatpally, Hyderabad",
    latitude: 17.4985,
    longitude: 78.4052,
    date: "2026-09-16",
    startTime: "12:00 PM",
    endTime: "03:30 PM",
    foodType: "Lunch Annadanam",
    createdAt: "2026-09-14T17:00:00.000Z"
  },
  {
    id: "anna-010",
    committeeName: "Balapur Ganesh Mandal Day 2 Seva",
    city: "Hyderabad",
    area: "Balapur",
    address: "Near Balapur Fort Ground, Balapur, Hyderabad",
    latitude: 17.3212,
    longitude: 78.5099,
    date: "2026-09-16",
    startTime: "12:00 PM",
    endTime: "03:00 PM",
    foodType: "Annaprasadam Meals",
    createdAt: "2026-09-14T17:30:00.000Z"
  },
  {
    id: "anna-011",
    committeeName: "Basavanagudi Dodda Ganapathi Seva Trust",
    city: "Bengaluru",
    area: "Basavanagudi",
    address: "Bull Temple Road, Basavanagudi, Bengaluru",
    latitude: 12.9421,
    longitude: 77.5684,
    date: "2026-09-15",
    startTime: "12:00 PM",
    endTime: "03:30 PM",
    foodType: "Mahaprasadam Meals",
    createdAt: "2026-09-14T18:00:00.000Z"
  },
  {
    id: "anna-012",
    committeeName: "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal",
    city: "Mumbai",
    area: "Lalbaug",
    address: "Dr. Ambedkar Road, Lalbaug, Parel, Mumbai",
    latitude: 18.9912,
    longitude: 72.8354,
    date: "2026-09-15",
    startTime: "12:30 PM",
    endTime: "04:30 PM",
    foodType: "Annadanam & Modak Prasadam",
    createdAt: "2026-09-14T18:30:00.000Z"
  }
];

export interface FetchOptions {
  city?: string;
  area?: string;
  date?: string;
  search?: string;
  foodType?: string;
  userLat?: number;
  userLng?: number;
  includeExpired?: boolean;
}

export const annadanamApi = {
  async getAll(options: FetchOptions = {}): Promise<Annadanam[]> {
    try {
      const params: Record<string, string> = {};
      if (options.city && options.city !== 'All') params.city = options.city;
      if (options.area && options.area !== 'All') params.area = options.area;
      if (options.date && options.date !== 'All') params.date = options.date;
      if (options.search) params.search = options.search;
      if (options.foodType && options.foodType !== 'All') params.foodType = options.foodType;
      if (options.userLat) params.userLat = options.userLat.toString();
      if (options.userLng) params.userLng = options.userLng.toString();
      if (options.includeExpired) params.includeExpired = 'true';

      const response = await axios.get(API_BASE, { params, timeout: 5000 });
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.warn('Backend API unreachable or timed out, using local fallback:', err);
      return this.getLocalFiltered(options);
    }
  },

  async create(data: Omit<Annadanam, 'id' | 'createdAt'>): Promise<Annadanam> {
    try {
      const response = await axios.post(API_BASE, data, { timeout: 6000 });
      if (response.data && response.data.data) {
        // Also cache locally
        this.saveToLocalCache(response.data.data);
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to create record');
    } catch (err: any) {
      console.warn('Backend offline, saving locally in browser storage');
      const newRecord: Annadanam = {
        ...data,
        id: `anna-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString()
      };
      this.saveToLocalCache(newRecord);
      return newRecord;
    }
  },

  async update(id: string, updates: Partial<Annadanam>): Promise<Annadanam | null> {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, updates, { timeout: 6000 });
      if (response.data && response.data.data) {
        this.updateLocalCache(id, updates);
        return response.data.data;
      }
    } catch (e) {
      console.warn('Backend update failed, applying locally', e);
    }
    this.updateLocalCache(id, updates);
    const item = this.getLocalCache().find(x => x.id === id);
    return item || null;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/${id}`, { timeout: 6000 });
    } catch (e) {
      console.warn('Backend delete failed, removing locally', e);
    }
    this.deleteFromLocalCache(id);
    return true;
  },

  updateLocalCache(id: string, updates: Partial<Annadanam>) {
    try {
      const cached = this.getLocalCache();
      const idx = cached.findIndex(x => x.id === id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updates };
        localStorage.setItem('local_annadanams', JSON.stringify(cached));
      }
    } catch (e) {}
  },

  deleteFromLocalCache(id: string) {
    try {
      const cached = this.getLocalCache().filter(x => x.id !== id);
      localStorage.setItem('local_annadanams', JSON.stringify(cached));
    } catch (e) {}
  },

  saveToLocalCache(item: Annadanam) {
    try {
      const cached = this.getLocalCache();
      cached.unshift(item);
      localStorage.setItem('local_annadanams', JSON.stringify(cached));
    } catch (e) {
      console.error('Local cache save failed', e);
    }
  },

  getLocalCache(): Annadanam[] {
    try {
      const stored = localStorage.getItem('local_annadanams');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [...FALLBACK_DATA];
  },

  getLocalFiltered(options: FetchOptions): Annadanam[] {
    let list = this.getLocalCache();
    const now = new Date();

    // Check expiration and calculate distance locally
    const items = list.map((item) => {
      let isExpired = false;
      let isServingNow = false;

      try {
        const [year, month, day] = item.date.split('-').map(Number);
        let [startH, startM] = [12, 0];
        let [endH, endM] = [15, 0];

        const parseTime = (t: string) => {
          const isPM = t.toUpperCase().includes('PM');
          const isAM = t.toUpperCase().includes('AM');
          const [h, m] = t.replace(/(AM|PM)/gi, '').trim().split(':').map(Number);
          let hours = h || 0;
          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
          return [hours, m || 0];
        };

        [startH, startM] = parseTime(item.startTime);
        [endH, endM] = parseTime(item.endTime);

        const startDt = new Date(year, month - 1, day, startH, startM);
        const endDt = new Date(year, month - 1, day, endH, endM);

        isExpired = now.getTime() > endDt.getTime();
        isServingNow = now.getTime() >= startDt.getTime() && now.getTime() <= endDt.getTime();
      } catch (e) {}

      let distanceKm: number | undefined;
      if (options.userLat && options.userLng && item.latitude && item.longitude) {
        const dLat = ((item.latitude - options.userLat) * Math.PI) / 180;
        const dLon = ((item.longitude - options.userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((options.userLat * Math.PI) / 180) *
            Math.cos((item.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Math.round(6371 * c * 10) / 10;
      }

      return {
        ...item,
        isExpired,
        isServingNow,
        distanceKm
      };
    });

    let filtered = items;
    if (!options.includeExpired) {
      filtered = filtered.filter((i) => !i.isExpired);
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.committeeName.toLowerCase().includes(q) ||
          i.area.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.foodType.toLowerCase().includes(q)
      );
    } else {
      if (options.city && options.city !== 'All') {
        filtered = filtered.filter((i) => i.city.toLowerCase() === options.city?.toLowerCase());
      }

      if (options.area && options.area !== 'All') {
        filtered = filtered.filter((i) => i.area.toLowerCase().includes(options.area!.toLowerCase()));
      }

      if (options.date && options.date !== 'All') {
        filtered = filtered.filter((i) => i.date === options.date);
      }
    }

    return filtered;
  }
};
