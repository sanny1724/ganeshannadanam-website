export interface Annadanam {
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
  isExpired?: boolean;
  isServingNow?: boolean;
  distanceKm?: number;
}

export type ViewMode = 'list' | 'map';

export type DateFilter = 'today' | 'tomorrow' | 'custom';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}
