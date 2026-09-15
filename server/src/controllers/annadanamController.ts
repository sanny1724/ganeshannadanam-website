import { Request, Response } from 'express';
import { AnnadanamStore, AnnadanamRecord } from '../db/annadanamStore.js';

// Helper to parse time strings like "12:00 PM", "03:30 PM", "15:30" with a specific date
export function parseEventDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  
  let hours = 0;
  let minutes = 0;

  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes('PM');
  const isAM = cleanTime.includes('AM');
  const timeOnly = cleanTime.replace(/(AM|PM)/g, '').trim();
  const parts = timeOnly.split(':');

  if (parts.length >= 2) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  } else if (parts.length === 1) {
    hours = parseInt(parts[0], 10);
    minutes = 0;
  }

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  // Create date object (in local time)
  const dt = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return dt;
}

// Calculate distance in kilometers using Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface AnnadanamResponseItem extends AnnadanamRecord {
  isExpired: boolean;
  isServingNow: boolean;
  distanceKm?: number;
}

export const getAnnadanams = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      city,
      area,
      date,
      search,
      foodType,
      includeExpired,
      userLat,
      userLng,
      currentTime
    } = req.query;

    const now = currentTime ? new Date(currentTime as string) : new Date();
    const allRecords = AnnadanamStore.getAll();

    const results: AnnadanamResponseItem[] = allRecords.map((item) => {
      let isExpired = false;
      let isServingNow = false;

      try {
        const startDt = parseEventDateTime(item.date, item.startTime);
        const endDt = parseEventDateTime(item.date, item.endTime);

        isExpired = now.getTime() > endDt.getTime();
        isServingNow = now.getTime() >= startDt.getTime() && now.getTime() <= endDt.getTime();
      } catch (err) {
        console.error(`Error parsing date/time for item ${item.id}:`, err);
      }

      let distanceKm: number | undefined;
      if (userLat && userLng && item.latitude && item.longitude) {
        const uLat = parseFloat(userLat as string);
        const uLng = parseFloat(userLng as string);
        if (!isNaN(uLat) && !isNaN(uLng)) {
          distanceKm = calculateDistanceKm(uLat, uLng, item.latitude, item.longitude);
        }
      }

      return {
        ...item,
        isExpired,
        isServingNow,
        distanceKm
      };
    });

    // Filtering
    let filtered = results;

    // By default hide expired listings unless explicitly requested
    if (includeExpired !== 'true') {
      filtered = filtered.filter((item) => !item.isExpired);
    }

    if (city && typeof city === 'string' && city.trim() !== '' && city.toLowerCase() !== 'all') {
      filtered = filtered.filter((item) => item.city.toLowerCase() === city.toLowerCase().trim());
    }

    const hasSearch = search && typeof search === 'string' && search.trim() !== '';

    if (hasSearch) {
      const q = (search as string).toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.committeeName.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.foodType.toLowerCase().includes(q)
      );
    } else {
      if (area && typeof area === 'string' && area.trim() !== '' && area.toLowerCase() !== 'all') {
        const q = area.toLowerCase().trim();
        filtered = filtered.filter((item) => item.area.toLowerCase().includes(q));
      }

      if (date && typeof date === 'string' && date.trim() !== '' && date.toLowerCase() !== 'all') {
        filtered = filtered.filter((item) => item.date === date.trim());
      }
    }

    if (foodType && typeof foodType === 'string' && foodType.trim() !== '' && foodType.toLowerCase() !== 'all') {
      const f = foodType.toLowerCase().trim();
      filtered = filtered.filter((item) => item.foodType.toLowerCase().includes(f));
    }

    // Sort order:
    // 1. Serving Now first
    // 2. Distance if available
    // 3. Date & Start time
    filtered.sort((a, b) => {
      if (a.isServingNow && !b.isServingNow) return -1;
      if (!a.isServingNow && b.isServingNow) return 1;

      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }

      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return a.startTime.localeCompare(b.startTime);
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
      serverTime: now.toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const createAnnadanam = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      committeeName,
      city,
      area,
      address,
      latitude,
      longitude,
      date,
      startTime,
      endTime,
      foodType
    } = req.body;

    if (!committeeName || !city || !area || !date || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: committeeName, city, area, date, startTime, endTime'
      });
      return;
    }

    // Default coordinates if not provided (e.g. center of specified city)
    let finalLat = Number(latitude);
    let finalLng = Number(longitude);

    if (isNaN(finalLat) || isNaN(finalLng) || finalLat === 0) {
      const cityLower = (city || '').toLowerCase();
      if (cityLower.includes('hyderabad') || cityLower.includes('secunderabad')) {
        finalLat = 17.3850 + (Math.random() - 0.5) * 0.05;
        finalLng = 78.4867 + (Math.random() - 0.5) * 0.05;
      } else if (cityLower.includes('bengaluru') || cityLower.includes('bangalore')) {
        finalLat = 12.9716;
        finalLng = 77.5946;
      } else if (cityLower.includes('mumbai')) {
        finalLat = 19.0760;
        finalLng = 72.8777;
      } else {
        finalLat = 17.3850;
        finalLng = 78.4867;
      }
    }

    const newRecord = AnnadanamStore.add({
      committeeName: committeeName.trim(),
      city: city.trim(),
      area: area.trim(),
      address: (address || `${area}, ${city}`).trim(),
      latitude: finalLat,
      longitude: finalLng,
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      foodType: (foodType || 'Annadanam Prasadam').trim()
    });

    res.status(201).json({
      success: true,
      message: 'Annadanam details added successfully!',
      data: newRecord
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create record' });
  }
};

export const getMetadata = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cities = AnnadanamStore.getCities();
    res.json({
      success: true,
      cities
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnadanam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = AnnadanamStore.update(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    res.json({ success: true, message: 'Record updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleAnnadanam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = AnnadanamStore.getById(id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnadanam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = AnnadanamStore.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Record not found' });
      return;
    }
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


