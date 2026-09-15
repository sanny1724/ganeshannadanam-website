# 🙏 Vinayaka Annadanam Finder (గణేష్ అన్నదానం ఫైండర్)

[![React 19](https://img.shields.io/badge/Frontend-React_19_%2B_Vite_%2B_TS-orange.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-amber.svg)](https://tailwindcss.com)
[![Leaflet Maps](https://img.shields.io/badge/Map-Leaflet_%2B_OpenStreetMap-emerald.svg)](https://leafletjs.com)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel_Serverless-black.svg)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A fast, mobile-friendly community platform to easily locate and share free **Ganesh Annaprasadam** distribution across Hyderabad, Secunderabad, and surrounding regions during Ganesh Navaratri festival days.

---

## 🎯 Core Purpose

During the Ganesh festival, thousands of pandals and youth committees distribute delicious Maha Prasadam / Annadanam. Devotees often find it challenging to know exact locations and timings. 

This platform answers **strictly three critical questions**:
1. **WHERE** is Annadanam being served? *(Address, Landmark, GPS Distance & Interactive Map)*
2. **WHEN** is it happening? *(Today, Tomorrow, All Festival Dates, or Custom Calendar)*
3. **WHAT TIME** is food served? *(Exact start & end timings, e.g. 12:30 PM – 3:30 PM with live Serving Now indicator)*

> ❌ **No Clutter:** No food delivery, no payments, no bookings, no user profiles, and no ratings. Pure community information.

---

## ✨ Key Features

- 🍚 **Find Annadanam Details**:
  - **List View & Interactive Map View** powered by OpenStreetMap and Leaflet.
  - **📍 Locate Me (GPS Crosshair)**: Calculates real-time distance in kilometers to every pandal.
  - **Dynamic Date Filtering**: Switch between *All Dates*, *Today*, *Tomorrow*, or select custom festival dates.
  - **Horizontal Area Chips**: 1-tap filtering for popular areas (Kukatpally, Ameerpet, Balapur, Madhapur, Khairatabad, etc.).
  - **🟢 "Serving Now" Badges**: Live indicators highlighting ongoing lunch and dinner annadanams.

- ➕ **Add Annadanam (For Committees & Youth Clubs)**:
  - Simple 1-minute form to publish pandal Annadanam details.
  - **Interactive Pin-on-Map Picker**: Search landmarks or tap anywhere on the map to set exact GPS coordinates.
  - **Instant Cross-Device Sync**: Submissions sync immediately via Vercel Serverless API and local device storage.

- 📱 **Mobile-First Experience**:
  - Compact, modern UI tailored for smartphones and tablets.
  - Sticky bottom navigation bar for quick 1-thumb switching between Home, Find, and Add.

- 🛡️ **Admin Portal**:
  - Hidden route (`#/admin`) for organizers and moderators to view, manage, and remove listings.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│              React 19 + TypeScript Frontend             │
│            (Vite, Tailwind CSS, Leaflet Maps)           │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌─────────────────────────┐       ┌───────────────────────┐
│  Vercel Serverless API  │       │ Express Node.js Server│
│   (api/annadanams.js)   │       │   (server/src/...)    │
└─────────────────────────┘       └───────────────────────┘
            │                                 │
            └────────────────┬────────────────┘
                             ▼
              ┌─────────────────────────────┐
              │   Local & Cloud Storage     │
              │  (Realtime cross-device)    │
              └─────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet, React-Leaflet, Lucide Icons.
- **Backend / Serverless**:
  - `api/annadanams.js`: Zero-config Serverless API for Vercel deployment.
  - `server/`: Standalone Express + TypeScript server for fullstack deployment on Render/Railway.
- **Data Persistence**: Unified live API + resilient browser storage fallback.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/sanny1724/ganeshannadanam-website.git
cd ganeshannadanam-website

# Install client packages
cd client && npm install
cd ..
```

### Step 2: Run Frontend in Development Mode
```bash
cd client
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser or phone.

---

## 🌐 Free Deployment (Vercel)

This project is configured out-of-the-box for **Vercel**:

1. Push code to your GitHub repository.
2. Import the repository in [Vercel](https://vercel.com).
3. Set **Framework Preset**: `Vite`
4. Set **Root Directory**: `./` (leave default)
5. Set **Build Command**: `cd client && npm install && npm run build`
6. Set **Output Directory**: `client/dist`
7. Click **Deploy**.

> `vercel.json` and `api/annadanams.js` will automatically handle both single-page routing and the cross-device Serverless API.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/annadanams` | Retrieve all Annadanams (Supports query params: `city`, `area`, `date`, `search`) |
| `POST` | `/api/annadanams` | Add a new Annadanam event |
| `DELETE` | `/api/annadanams?id=:id` | Remove an Annadanam by ID |

---

## 📄 License
This project is open-source under the **MIT License**. Devoted to the community during Ganesh Navaratri.
