// Vercel Serverless Function for Live Cross-Device Annadanam Sync
let memoryEvents = [];

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
    let filtered = [...memoryEvents];

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.committeeName?.toLowerCase().includes(q) ||
          i.area?.toLowerCase().includes(q) ||
          i.city?.toLowerCase().includes(q) ||
          i.address?.toLowerCase().includes(q)
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

    memoryEvents = memoryEvents.filter((x) => x.id !== newEvent.id);
    memoryEvents.unshift(newEvent);

    return res.status(201).json({
      success: true,
      data: newEvent
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {};
    if (id) {
      memoryEvents = memoryEvents.filter((x) => x.id !== id);
    }
    return res.status(200).json({ success: true, message: 'Deleted' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
