import fs from 'fs';
import path from 'path';

export interface AnnadanamRecord {
  id: string;
  committeeName: string;
  city: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "12:00 PM"
  endTime: string; // e.g. "03:30 PM"
  foodType: string;
  createdAt: string;
}

// Find data directory relative to server or cwd
const candidatePaths = [
  path.resolve(process.cwd(), 'data'),
  path.resolve(process.cwd(), 'server', 'data'),
  path.resolve(__dirname, '../../data'),
  path.resolve(__dirname, '../data')
];

let dataDir = path.resolve(process.cwd(), 'data');
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dataDir = p;
    break;
  }
}
const filePath = path.join(dataDir, 'annadanams.json');

export class AnnadanamStore {
  private static ensureDataFile(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf8');
    }
  }

  public static getAll(): AnnadanamRecord[] {
    this.ensureDataFile();
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read annadanams data:', error);
      return [];
    }
  }

  public static getById(id: string): AnnadanamRecord | undefined {
    const list = this.getAll();
    return list.find((item) => item.id === id);
  }

  private static saveAll(list: AnnadanamRecord[]): void {
    const json = JSON.stringify(list, null, 2);
    for (const p of candidatePaths) {
      try {
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p, { recursive: true });
        }
        fs.writeFileSync(path.join(p, 'annadanams.json'), json, 'utf8');
      } catch (e) {}
    }
  }

  public static add(record: Omit<AnnadanamRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): AnnadanamRecord {
    this.ensureDataFile();
    const list = this.getAll();
    const newRecord: AnnadanamRecord = {
      ...record,
      id: record.id || `anna-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: record.createdAt || new Date().toISOString()
    };
    list.unshift(newRecord);
    this.saveAll(list);
    return newRecord;
  }

  public static delete(id: string): boolean {
    this.ensureDataFile();
    const list = this.getAll();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.saveAll(list);
    return true;
  }

  public static update(id: string, updates: Partial<AnnadanamRecord>): AnnadanamRecord | null {
    this.ensureDataFile();
    const list = this.getAll();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    this.saveAll(list);
    return list[index];
  }

  public static getCities(): string[] {
    const list = this.getAll();
    const cities = new Set<string>();
    for (const item of list) {
      if (item.city) cities.add(item.city.trim());
    }
    return Array.from(cities).sort();
  }

  public static delete(id: string): boolean {
    this.ensureDataFile();
    const list = this.getAll();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    return true;
  }

  public static update(id: string, updates: Partial<AnnadanamRecord>): AnnadanamRecord | null {
    this.ensureDataFile();
    const list = this.getAll();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    return list[index];
  }
}

