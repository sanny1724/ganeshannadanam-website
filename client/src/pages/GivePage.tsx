import React, { useState } from 'react';
import { annadanamApi } from '../services/annadanamApi';
import { Annadanam } from '../types/annadanam';
import { AnnadanamCard } from '../components/AnnadanamCard';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { MapPin, Calendar, Clock, CheckCircle, ArrowLeft, PlusCircle, AlertCircle, Compass } from 'lucide-react';

interface GivePageProps {
  onNavigate: (page: 'home' | 'give' | 'take') => void;
}

const COMMON_CITIES = ['Hyderabad', 'Secunderabad', 'Bengaluru', 'Mumbai', 'Visakhapatnam', 'Vijayawada'];
const FOOD_OPTIONS = ['Lunch Annadanam', 'Mahaprasadam Meals', 'Breakfast / Tiffin', 'Dinner Prasadam', 'Prasadam / Sweets'];

const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateShort = (dateStr: string) => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch (e) {
    return dateStr;
  }
};

export const GivePage: React.FC<GivePageProps> = ({ onNavigate }) => {
  const [committeeName, setCommitteeName] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [customCity, setCustomCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(getTodayStr());
  const [startTime, setStartTime] = useState('12:00 PM');
  const [endTime, setEndTime] = useState('03:30 PM');
  const [foodType, setFoodType] = useState('Lunch Annadanam');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdItem, setCreatedItem] = useState<Annadanam | null>(null);

  // Auto-detect GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by this browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatus('Getting your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsDetectingLocation(false);
        setLocationStatus(`GPS Pin Saved (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      (err) => {
        setIsDetectingLocation(false);
        // Fallback to approximate city coords if GPS denied
        if (city === 'Hyderabad' || city === 'Secunderabad') {
          setLatitude(17.3850);
          setLongitude(78.4867);
          setLocationStatus('Using Hyderabad central coordinates');
        } else {
          setLocationStatus('Could not get GPS. Coordinates will default based on city.');
        }
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalCity = city === 'Other' ? customCity.trim() : city.trim();

    if (!committeeName.trim()) {
      setErrorMessage('Please enter Committee or Organization Name');
      return;
    }

    if (!finalCity) {
      setErrorMessage('Please enter or select City');
      return;
    }

    if (!area.trim()) {
      setErrorMessage('Please enter Area / Location (e.g. Kukatpally, Ameerpet, Balapur)');
      return;
    }

    if (!date) {
      setErrorMessage('Please select Annadanam Date');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMessage('Please specify Start Time and End Time');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        committeeName: committeeName.trim(),
        city: finalCity,
        area: area.trim(),
        address: address.trim() || `${area.trim()}, ${finalCity}`,
        latitude: latitude || 17.3850,
        longitude: longitude || 78.4867,
        date,
        startTime,
        endTime,
        foodType: foodType || 'Annadanam'
      };

      const result = await annadanamApi.create(payload);
      setCreatedItem(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreatedItem(null);
    setCommitteeName('');
    setArea('');
    setAddress('');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-900 mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* SUCCESS STATE AFTER SUBMISSION */}
      {createdItem ? (
        <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-6 shadow-md animate-fade-in space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 leading-tight">
                Annadanam details added successfully!
              </h2>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Your Annadanam is now visible to all devotees in the public finder.
              </p>
            </div>
          </div>

          <div className="border-t border-b border-stone-200 py-4">
            <div className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-2">
              Preview of your listing:
            </div>
            <AnnadanamCard item={createdItem} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() => onNavigate('take')}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🙏</span>
              <span>Find on Public Website</span>
            </button>
            <button
              onClick={handleResetForm}
              className="py-3 px-4 rounded-xl font-bold text-sm bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Another</span>
            </button>
          </div>
        </div>
      ) : (
        /* SHORT FORM */
        <div className="bg-white rounded-2xl border border-amber-200/90 p-5 sm:p-7 shadow-xs">
          <div className="mb-6 border-b border-amber-100 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full mb-2">
              <span>🍚</span>
              <span>Organizers & Committees</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Add Annadanam Details
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Help devotees easily find your free Annaprasadam location and timings.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Committee / Organization Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Committee / Organization Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={committeeName}
                onChange={(e) => setCommitteeName(e.target.value)}
                placeholder="e.g. Sri Ganesh Utsav Committee"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm sm:text-base font-medium text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                City <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setCustomCity('');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      city === c
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCity('Other')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    city === 'Other'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Other
                </button>
              </div>

              {city === 'Other' && (
                <input
                  type="text"
                  required
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Enter your City name"
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm font-medium text-stone-900 bg-stone-50/50"
                />
              )}
            </div>

            {/* Area / Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Area / Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Kukatpally, Ameerpet, Balapur, Madhapur"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm sm:text-base font-medium text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* Location Address / Landmark */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Remedy Hospital, Road No 1, KPHB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm font-medium text-stone-900 bg-stone-50/50"
              />

              {/* Interactive Visual Map & Landmark Finder */}
              <div className="mt-2">
                <div className="text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>📍 Set Exact Location on Map</span>
                  {latitude && longitude && (
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </span>
                  )}
                </div>
                <LocationPickerMap
                  initialLat={latitude}
                  initialLng={longitude}
                  initialCity={city === 'Other' ? customCity : city}
                  onLocationSelect={(data) => {
                    setLatitude(data.latitude);
                    setLongitude(data.longitude);
                    if (data.address && !address) {
                      setAddress(data.address);
                    }
                    if (data.area && !area) {
                      setArea(data.area);
                    }
                    setLocationStatus(`📍 Pin Placed (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})`);
                  }}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Date <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm sm:text-base font-medium text-stone-900 bg-stone-50/50"
                />
              </div>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setDate(getTodayStr())}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    date === getTodayStr()
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  Today ({formatDateShort(getTodayStr())})
                </button>
                <button
                  type="button"
                  onClick={() => setDate(getTomorrowStr())}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    date === getTomorrowStr()
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  Tomorrow ({formatDateShort(getTomorrowStr())})
                </button>
              </div>
            </div>

            {/* Time: Start Time & End Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="e.g. 12:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm font-medium text-stone-900 bg-stone-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  End Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="e.g. 03:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-sm font-medium text-stone-900 bg-stone-50/50"
                />
              </div>
            </div>

            {/* Optional Food / Menu */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Food / Menu (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {FOOD_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFoodType(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      foodType === f
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                placeholder="Or custom: Meals, Pulihara, Payasam, etc."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-hidden text-xs sm:text-sm font-medium text-stone-900 bg-stone-50/50"
              />
            </div>

            {/* SUBMIT BUTTON: ➕ ADD ANNADANAM */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-600/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>➕</span>
                <span>{isSubmitting ? 'Adding Annadanam...' : 'ADD ANNADANAM'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
