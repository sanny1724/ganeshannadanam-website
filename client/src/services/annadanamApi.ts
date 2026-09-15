import axios from 'axios';
import { Annadanam } from '../types/annadanam';

const API_BASE = (import.meta.env?.VITE_API_URL || '') + '/api/annadanams';
const CLOUD_BACKUP_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0a5c56aed11ee';

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
  CACHE_KEY: 'annadanam_events_live_v1',

  async getAll(options: FetchOptions = {}): Promise<Annadanam[]> {
    let cloudItems: Annadanam[] = [];

    // Tier 1: Try Vercel Serverless / Express API
    try {
      const params: Record<string, string> = {};
      if (options.city && options.city !== 'All') params.city = options.city;
      if (options.area && options.area !== 'All') params.area = options.area;
      if (options.date && options.date !== 'All') params.date = options.date;
      if (options.search) params.search = options.search;

      const response = await axios.get(API_BASE, { params, timeout: 3500 });
      if (response && response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        cloudItems = response.data.data;
      }
    } catch (err) {
      // Tier 2: If local API fails or on static deployment, fetch directly from persistent cloud database
      try {
        const cloudRes = await axios.get(CLOUD_BACKUP_URL, { timeout: 3500 });
        if (cloudRes.data?.data?.items && Array.isArray(cloudRes.data.data.items)) {
          cloudItems = cloudRes.data.data.items;
        }
      } catch (cloudErr) {
        console.warn('Cloud sync offline, using device storage');
      }
    }

    // Tier 3: Merge with Local Storage so newly added items on this device are NEVER lost
    const localItems = this.getLocalCache();
    const map = new Map<string, Annadanam>();

    // Add cloud items first
    cloudItems.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });

    // Merge local items (local takes priority if recently added)
    localItems.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });

    const unifiedList = Array.from(map.values());

    // Save unified list back to local storage
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(unifiedList));
    } catch (e) {}

    return this.filterItems(unifiedList, options);
  },

  async create(data: Omit<Annadanam, 'id' | 'createdAt'>): Promise<Annadanam> {
    const newRecord: Annadanam = {
      ...data,
      id: `anna-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };

    // 1. Immediately save to device storage
    this.saveToLocalCache(newRecord);

    // 2. Push to Serverless API
    try {
      await axios.post(API_BASE, newRecord, { timeout: 4000 });
    } catch (err) {
      console.warn('Serverless API push failed, attempting direct cloud sync...');
    }

    // 3. Direct Cloud DB Sync (guarantees cross-device availability immediately)
    try {
      const getRes = await axios.get(CLOUD_BACKUP_URL, { timeout: 3500 });
      let currentItems: Annadanam[] = getRes.data?.data?.items || [];
      const updated = [newRecord, ...currentItems.filter((x: Annadanam) => x.id !== newRecord.id)];
      await axios.put(
        CLOUD_BACKUP_URL,
        {
          name: 'ganesh_annadanam_db_v2',
          data: { items: updated }
        },
        { timeout: 4000 }
      );
    } catch (e) {
      console.warn('Direct cloud backup error:', e);
    }

    return newRecord;
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
    return this.filterItems(this.getLocalCache(), options);
  },

  filterItems(list: Annadanam[], options: FetchOptions): Annadanam[] {
    const now = new Date();

    // Check expiration and calculate distance locally
    const items = list.map((item) => {
      let isExpired = false;
      let isServingNow = false;

      try {
        const [year, month, day] = item.date.split('-').map(Number);
        let [startH, startM] = [12, 0];
        let [endH, endM] = [15, 30];

        const parseTime = (t: string) => {
          const isPM = t.toUpperCase().includes('PM');
          const isAM = t.toUpperCase().includes('AM');
          const [h, m] = t.replace(/(AM|PM)/gi, '').trim().split(':').map(Number);
          let hours = h || 0;
          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
          return [hours, m || 0];
        };

        if (item.startTime) [startH, startM] = parseTime(item.startTime);
        if (item.endTime) [endH, endM] = parseTime(item.endTime);

        const startDt = new Date(year, month - 1, day, startH, startM);
        const endDt = new Date(year, month - 1, day, endH, endM);
        // 6 hour grace period after event ends
        const graceEndDt = new Date(endDt.getTime() + 6 * 60 * 60 * 1000);

        isExpired = now.getTime() > graceEndDt.getTime();
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

    // Sort by distance if GPS active, otherwise newest first
    if (options.userLat && options.userLng) {
      filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    return filtered;
  }
};
