import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, Crosshair, MapPin, Check, Loader2 } from 'lucide-react';

interface LocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialCity?: string;
  onLocationSelect: (data: {
    latitude: number;
    longitude: number;
    address?: string;
    area?: string;
    city?: string;
  }) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLat,
  initialLng,
  initialCity = 'Hyderabad',
  onLocationSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);

  // Reverse geocode lat/lng to get Area & City & Address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const areaName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.commercial ||
          addr.subdistrict ||
          addr.road ||
          '';
        const cityName = addr.city || addr.town || addr.state_district || addr.county || 'Hyderabad';
        const formatted = data.display_name
          ? data.display_name.split(',').slice(0, 3).join(', ')
          : `${areaName}, ${cityName}`;

        setDetectedAddress(formatted);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: formatted,
          area: areaName,
          city: cityName
        });
        return;
      }
    } catch (err) {
      console.warn('Reverse geocode warning:', err);
    }

    onLocationSelect({
      latitude: lat,
      longitude: lng
    });
  };

  // Place or move marker on map
  const setMarkerPosition = (lat: number, lng: number, autoPan = true, shouldReverse = true) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (autoPan) {
      map.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const customIcon = L.divIcon({
        className: 'location-picker-pin',
        html: `
          <div style="background:#ea580c; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid #ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.4); font-size:20px; cursor:grab;">
            📍
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const newMarker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);

      newMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setMarkerPosition(pos.lat, pos.lng, false, true);
      });

      markerRef.current = newMarker;
    }

    if (shouldReverse) {
      reverseGeocode(lat, lng);
    }
  };

  // Search landmark via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const queryWithCity = searchQuery.includes(initialCity)
        ? searchQuery
        : `${searchQuery}, ${initialCity}, India`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryWithCity
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setMarkerPosition(lat, lng, true, true);
      } else {
        alert(`Location "${searchQuery}" not found. Please try another landmark or tap on the map.`);
      }
    } catch (err) {
      console.error('Location search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // GPS auto-locate
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMarkerPosition(pos.coords.latitude, pos.coords.longitude, true, true);
          setIsLocating(false);
        },
        async () => {
          // IP fallback
          try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              setMarkerPosition(data.latitude, data.longitude, true, true);
            }
          } catch (e) {}
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = initialLat || 17.3850;
    const lng = initialLng || 78.4867;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: initialLat ? 15 : 12,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Tap on map to place pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        setMarkerPosition(e.latlng.lat, e.latlng.lng, false, true);
      });

      mapInstanceRef.current = map;

      if (initialLat && initialLng) {
        setMarkerPosition(initialLat, initialLng, false, false);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2 mt-2">
      {/* Search Landmark bar above map */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="🔎 Search Landmark / Street (e.g. KPHB Remedy Hospital, Ameerpet Gurudwara)"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:border-orange-500 text-xs sm:text-sm font-medium bg-white"
          />
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isSearching}
          className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
        </button>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-orange-700 font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
          title="Detect Current GPS Location"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">My GPS</span>
        </button>
      </div>

      {/* Visual Map container */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border-2 border-amber-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-800 shadow-sm flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="text-orange-600">👉</span>
            <span>Tap map or drag pin to exact pandal entrance</span>
          </span>
          {detectedAddress && (
            <span className="text-emerald-700 font-bold truncate max-w-[140px] sm:max-w-[200px]">
              ✓ Pin placed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
