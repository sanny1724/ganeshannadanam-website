import axios from 'axios';
import { Annadanam } from '../types/annadanam';

const API_BASE = (import.meta.env?.VITE_API_URL || '') + '/api/annadanams';

// All listings are added manually by committees and devotees
const FALLBACK_DATA: Annadanam[] = [];

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

  CACHE_KEY: 'annadanam_events_live_v1',

  purgeLegacyData() {
    try {
      localStorage.removeItem('local_annadanams');
      localStorage.removeItem('annadanams_cache');
    } catch (e) {}
  },

  updateLocalCache(id: string, updates: Partial<Annadanam>) {
    try {
      const cached = this.getLocalCache();
      const idx = cached.findIndex(x => x.id === id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updates };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
      }
    } catch (e) {}
  },

  deleteFromLocalCache(id: string) {
    try {
      const cached = this.getLocalCache().filter(x => x.id !== id);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
    } catch (e) {}
  },

  saveToLocalCache(item: Annadanam) {
    try {
      const cached = this.getLocalCache();
      // Avoid duplicates
      const filtered = cached.filter(x => x.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Local cache save failed', e);
    }
  },

  getLocalCache(): Annadanam[] {
    this.purgeLegacyData();
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Remove any legacy sample records
          return parsed.filter((item: Annadanam) => {
            if (!item || !item.committeeName) return false;
            if (item.id?.startsWith('anna-0')) return false;
            const name = item.committeeName.toLowerCase();
            if (name.includes('balapur ganesh utsav samithi') && item.id === 'anna-002') return false;
            if (name.includes('sri ganesh utsav committee') && item.id === 'anna-001') return false;
            if (name.includes('khairatabad bada ganesh') && item.id === 'anna-003') return false;
            return true;
          });
        }
      }
    } catch (e) {}
    return [];
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
