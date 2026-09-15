import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Annadanam } from '../types/annadanam';
import { Navigation, Compass, Crosshair } from 'lucide-react';

interface AnnadanamMapProps {
  items: Annadanam[];
  userLocation?: { latitude: number; longitude: number } | null;
  onUserLocationDetected?: (coords: { latitude: number; longitude: number }) => void;
}

export const AnnadanamMap: React.FC<AnnadanamMapProps> = ({
  items,
  userLocation,
  onUserLocationDetected
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // Trigger GPS detection directly on map
  const locateUser = () => {
    if (!mapInstanceRef.current) return;
    setIsLocating(true);
    setGpsStatus('Locating your GPS position...');

    // Try HTML5 high accuracy first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          updateUserOnMap(coords.latitude, coords.longitude, pos.coords.accuracy);
          onUserLocationDetected?.(coords);
          setIsLocating(false);
          setGpsStatus(`📍 Located (Accuracy: ±${Math.round(pos.coords.accuracy || 10)}m)`);
        },
        async (err) => {
          console.warn('GPS error, trying IP location fallback:', err);
          // IP fallback for desktop / denied permissions
          try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const coords = { latitude: data.latitude, longitude: data.longitude };
              updateUserOnMap(coords.latitude, coords.longitude, 5000);
              onUserLocationDetected?.(coords);
              setIsLocating(false);
              setGpsStatus(`📍 Located via Network (${data.city || 'Your Area'})`);
              return;
            }
          } catch (ipErr) {
            console.warn('IP fallback failed:', ipErr);
          }

          setIsLocating(false);
          setGpsStatus('GPS unavailable. Showing central area.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setGpsStatus('Geolocation not supported.');
    }
  };

  const updateUserOnMap = (lat: number, lng: number, accuracy?: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Smoothly pan & zoom to user location
    map.flyTo([lat, lng], 14, { animate: true, duration: 1 });

    // Remove existing user marker & circle if present
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
    }

    // Add accuracy circle if reasonable
    if (accuracy && accuracy < 10000) {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: Math.min(accuracy, 1500),
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
    }

    // High visibility pulsing blue user pin
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#3b82f6; opacity:0.5; animation:pulse-ring 2s infinite;"></div>
          <div style="width:20px; height:20px; border-radius:50%; background:#1d4ed8; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif; text-align:center; padding:4px;">
          <b style="color:#1d4ed8;">📍 Your Current Location</b>
          <div style="font-size:11px; color:#6b7280; margin-top:2px;">Showing Annadanams near you</div>
        </div>`
      )
      .openPopup();
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let initialLat = 17.3850;
    let initialLng = 78.4867;

    if (userLocation) {
      initialLat = userLocation.latitude;
      initialLng = userLocation.longitude;
    } else if (items.length > 0 && items[0].latitude && items[0].longitude) {
      initialLat = items[0].latitude;
      initialLng = items[0].longitude;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // If userLocation passed initially, render it
      if (userLocation) {
        updateUserOnMap(userLocation.latitude, userLocation.longitude, 100);
      }
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (map && markersLayer) {
      markersLayer.clearLayers();

      const bounds: L.LatLngExpression[] = [];

      if (userLocation) {
        bounds.push([userLocation.latitude, userLocation.longitude]);
      }

      // Add Annadanam location markers
      items.forEach((item) => {
        if (!item.latitude || !item.longitude) return;

        const isServing = item.isServingNow;
        const pinBg = isServing ? '#16a34a' : '#ea580c';
        const pulseBorder = isServing ? 'border: 3px solid #22c55e;' : 'border: 3px solid #ffffff;';

        const customIcon = L.divIcon({
          className: 'custom-festive-pin',
          html: `
            <div style="background:${pinBg}; color:white; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; ${pulseBorder} box-shadow:0 3px 10px rgba(0,0,0,0.35); font-size:18px; cursor:pointer;">
              🍚
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [0, -19]
        });

        const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

        // EXACT DIRECTIONS URL:
        // Uses both exact coordinates AND formatted location name/address so Google Maps hits the exact spot!
        let directionsUrl = '';
        if (userLocation) {
          directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${item.latitude},${item.longitude}&travelmode=driving`;
        } else {
          directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}&travelmode=driving`;
        }

        const exactMapPinUrl = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;

        const popupContent = `
          <div style="font-family:system-ui, -apple-system, sans-serif; padding:6px; min-width:220px; max-width:270px;">
            <div style="font-size:11px; font-weight:700; color:${pinBg}; margin-bottom:3px; text-transform:uppercase;">
              ${isServing ? '🟢 Serving Now' : '🙏 Annadanam'}
            </div>
            <h4 style="margin:0 0 5px 0; font-size:15px; font-weight:800; color:#1c1917; line-height:1.25;">
              ${item.committeeName}
            </h4>
            <div style="font-size:13px; color:#44403c; margin-bottom:4px;">
              📍 <strong>${item.area}, ${item.city}</strong>
            </div>
            <div style="font-size:11px; color:#78716c; margin-bottom:6px;">
              ${item.address}
            </div>
            <div style="font-size:12px; color:#57534e; margin-bottom:3px;">
              📅 ${item.date}
            </div>
            <div style="font-size:12px; color:#1c1917; font-weight:700; margin-bottom:10px;">
              🕐 ${item.startTime} – ${item.endTime}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; background:#ea580c; color:white; text-decoration:none; padding:9px 12px; border-radius:8px; font-size:13px; font-weight:800; box-shadow:0 2px 6px rgba(234,88,12,0.3);">
                🧭 Get Directions (Turn-by-Turn)
              </a>
              <a href="${exactMapPinUrl}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; background:#f5f5f4; color:#292524; text-decoration:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; border:1px solid #d6d3d1;">
                📍 Open Exact Pin in Google Maps
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
        bounds.push([item.latitude, item.longitude]);
      });

      if (bounds.length > 0 && !userLocation) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [items, userLocation]);

  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      updateUserOnMap(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[65vh] min-h-[380px] max-h-[600px] rounded-2xl overflow-hidden border border-amber-200/90 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating GPS 'Locate Me' Button on Map */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={locateUser}
          disabled={isLocating}
          className="p-3 rounded-xl bg-white text-stone-900 hover:bg-stone-50 border-2 border-amber-300 shadow-md flex items-center justify-center cursor-pointer transition-all active:scale-95 group"
          title="Detect My Location on Map"
        >
          <Crosshair className={`w-5 h-5 text-orange-600 ${isLocating ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} />
        </button>
      </div>

      {/* GPS Status feedback bar */}
      {gpsStatus && (
        <div className="absolute top-3 left-3 right-16 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-bold text-stone-800 shadow-sm truncate">
          {gpsStatus}
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
        <span>Green = Serving Now</span>
      </div>
    </div>
  );
};
