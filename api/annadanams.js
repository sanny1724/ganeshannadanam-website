// Vercel Serverless Function with Persistent Cloud Synchronization
const CLOUD_MASTER_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0a5c56aed11ee';
let memoryEvents = [];

async function fetchCloudEvents() {
  try {
    const res = await fetch(CLOUD_MASTER_URL, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data.items)) {
        memoryEvents = data.data.items;
        return memoryEvents;
      }
    }
  } catch (e) {
    console.warn('Cloud fetch timeout, using memory cache:', e.message);
  }
  return memoryEvents;
}

async function saveCloudEvents(items) {
  memoryEvents = items;
  try {
    await fetch(CLOUD_MASTER_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'ganesh_annadanam_db_v2',
        data: { items }
      }),
      signal: AbortSignal.timeout(5000)
    });
  } catch (e) {
    console.warn('Cloud save timeout, saved in memory:', e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { city, area, date, search } = req.query || {};
    let events = await fetchCloudEvents();
    let filtered = [...events];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.committeeName?.toLowerCase().includes(q) ||
          i.area?.toLowerCase().includes(q) ||
          i.city?.toLowerCase().includes(q) ||
          i.address?.toLowerCase().includes(q) ||
          i.foodType?.toLowerCase().includes(q)
      );
    } else {
      if (city && city !== 'All') {
        filtered = filtered.filter((i) => i.city?.toLowerCase() === city.toLowerCase());
      }
      if (area && area !== 'All') {
        filtered = filtered.filter((i) => i.area?.toLowerCase().includes(area.toLowerCase()));
      }
      if (date && date !== 'All') {
        filtered = filtered.filter((i) => i.date === date);
      }
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    const newEvent = {
      id: body.id || ('anna-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
      committeeName: body.committeeName || '',
      city: body.city || 'Hyderabad',
      area: body.area || '',
      address: body.address || '',
      latitude: Number(body.latitude) || 17.3850,
      longitude: Number(body.longitude) || 78.4867,
      date: body.date || new Date().toISOString().split('T')[0],
      startTime: body.startTime || '12:00 PM',
      endTime: body.endTime || '03:30 PM',
      foodType: body.foodType || 'Lunch Annadanam',
      createdAt: new Date().toISOString()
    };

    let current = await fetchCloudEvents();
    const updated = [newEvent, ...current.filter((x) => x.id !== newEvent.id)];
    await saveCloudEvents(updated);

    return res.status(201).json({
      success: true,
      data: newEvent
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (id) {
      let current = await fetchCloudEvents();
      const updated = current.filter((x) => x.id !== id);
      await saveCloudEvents(updated);
    }
    return res.status(200).json({ success: true, message: 'Deleted' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
