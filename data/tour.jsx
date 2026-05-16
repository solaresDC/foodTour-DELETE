// Data model designed for future multi-city, backend, and accounts.
// Schemas:
//   City { id, name, center:{lat,lng}, zoom }
//   Restaurant { id, cityId, name, cuisine, neighborhood, short, must, price, coords:{lat,lng}, hue }
//   Tour { id, cityId, name, stopIds:[id...] }
//   Visit { restaurantId, visitedAt, review?:{stars,text,at}, photos:[{id,at}] }
//
// Persisted to localStorage under 'ft:v1:visits'. Migratable to backend later.

const FT_CITY = {
  id: 'toronto',
  name: 'Toronto',
  center: { lat: 43.6508, lng: -79.3980 },
  zoom: 14,
};

// Real Toronto coordinates for each spot — constrained to the downtown core
// (roughly Bloor → Lakeshore, Bathurst → Jarvis) so the tour is a walkable
// crawl from Union Station.
const FT_RESTAURANTS = [
  { id: 'r1', cityId: 'toronto', name: 'Bar Raval',           cuisine: 'Spanish pintxos',   neighborhood: 'Little Italy',      short: 'Art Nouveau bar with pintxos on the counter.', must: 'Pulpo + vermouth',           price: '$$', coords: { lat: 43.6551, lng: -79.4135 }, hue: 18 },
  { id: 'r2', cityId: 'toronto', name: 'Seven Lives',         cuisine: 'Baja tacos',        neighborhood: 'Kensington Market', short: 'Baja-style tacos, walk-up counter, no frills.', must: 'Gobernador taco',           price: '$',  coords: { lat: 43.6545, lng: -79.4016 }, hue: 32 },
  { id: 'r3', cityId: 'toronto', name: 'Rasta Pasta',         cuisine: 'Jerk + pasta',      neighborhood: 'Kensington Market', short: 'Jerk chicken meets rasta rose pasta.',          must: 'Rasta Pasta bowl',          price: '$',  coords: { lat: 43.6551, lng: -79.4021 }, hue: 55 },
  { id: 'r4', cityId: 'toronto', name: 'Juicy Dumpling',      cuisine: 'Shanghainese',      neighborhood: 'Chinatown',         short: 'XLB soup dumplings behind a steamed window.',   must: 'Pork XLB x10',              price: '$',  coords: { lat: 43.6535, lng: -79.3980 }, hue: 8  },
  { id: 'r5', cityId: 'toronto', name: 'Banh Mi Boys',        cuisine: 'Vietnamese',        neighborhood: 'Queen West',        short: 'Five-spice pork belly, crackling baguette.',    must: 'Kalbi beef banh mi',        price: '$',  coords: { lat: 43.6490, lng: -79.3978 }, hue: 142 },
  { id: 'r6', cityId: 'toronto', name: "Mother's Dumplings",  cuisine: 'Northern Chinese',  neighborhood: 'Chinatown',         short: 'Hand-rolled dumplings since 2007.',             must: 'Lamb + coriander boiled',   price: '$',  coords: { lat: 43.6557, lng: -79.3985 }, hue: 350 },
  { id: 'r7', cityId: 'toronto', name: 'Kinka Izakaya',       cuisine: 'Izakaya',           neighborhood: 'Church-Wellesley',  short: 'Loud greetings, tiny plates, cold highballs.',  must: 'Karaage + highball',        price: '$$', coords: { lat: 43.6612, lng: -79.3832 }, hue: 210 },
  { id: 'r8', cityId: 'toronto', name: 'Sanagi',              cuisine: 'Japanese street',   neighborhood: 'Downtown',          short: 'Onigiri, okonomiyaki, crispy chicken.',          must: 'Tuna onigiri',              price: '$',  coords: { lat: 43.6512, lng: -79.3858 }, hue: 175 },
  { id: 'r9', cityId: 'toronto', name: 'Pai Northern Thai',   cuisine: 'Thai',              neighborhood: 'Entertainment Dist.', short: 'Khao soi that turned Toronto on to Northern Thai.', must: 'Khao soi gai',         price: '$$', coords: { lat: 43.6485, lng: -79.3867 }, hue: 40 },
  { id: 'r10',cityId: 'toronto', name: 'Sugo',                cuisine: 'Italian-American',  neighborhood: 'Little Italy',      short: 'Chicken parm the size of a dinner plate.',      must: 'Chicken parm',              price: '$$', coords: { lat: 43.6553, lng: -79.4158 }, hue: 0  },
];

// Ambient restaurants — NOT part of the tour, just populate the map so the
// city feels alive. All within the downtown core (walking distance of Union).
const FT_AMBIENT = [
  { id: 'a1',  cityId: 'toronto', name: 'Lamesa Filipino Kitchen', cuisine: 'Filipino',       neighborhood: 'Queen West',        coords: { lat: 43.6478, lng: -79.4012 } },
  { id: 'a2',  cityId: 'toronto', name: 'Byblos',                  cuisine: 'Mediterranean',   neighborhood: 'King West',         coords: { lat: 43.6458, lng: -79.3935 } },
  { id: 'a3',  cityId: 'toronto', name: 'Canoe',                   cuisine: 'Canadian',        neighborhood: 'Financial Dist.',   coords: { lat: 43.6485, lng: -79.3810 } },
  { id: 'a4',  cityId: 'toronto', name: 'Richmond Station',        cuisine: 'Modern Canadian', neighborhood: 'Financial Dist.',   coords: { lat: 43.6510, lng: -79.3790 } },
  { id: 'a5',  cityId: 'toronto', name: 'Grey Gardens',            cuisine: 'Wine bar',        neighborhood: 'Kensington Market', coords: { lat: 43.6548, lng: -79.4000 } },
  { id: 'a6',  cityId: 'toronto', name: 'DaiLo',                   cuisine: 'New Asian',       neighborhood: 'Little Italy',      coords: { lat: 43.6548, lng: -79.4130 } },
  { id: 'a7',  cityId: 'toronto', name: 'Alo',                     cuisine: 'French tasting',  neighborhood: 'Queen West',        coords: { lat: 43.6483, lng: -79.3945 } },
  { id: 'a8',  cityId: 'toronto', name: 'Baro',                    cuisine: 'Latin American',  neighborhood: 'King West',         coords: { lat: 43.6455, lng: -79.3962 } },
  { id: 'a9',  cityId: 'toronto', name: 'Buca',                    cuisine: 'Italian',         neighborhood: 'King West',         coords: { lat: 43.6456, lng: -79.4020 } },
  { id: 'a10', cityId: 'toronto', name: 'Salad King',              cuisine: 'Thai',            neighborhood: 'Dundas Square',     coords: { lat: 43.6577, lng: -79.3800 } },
  { id: 'a11', cityId: 'toronto', name: 'Lee',                     cuisine: 'Asian fusion',    neighborhood: 'King West',         coords: { lat: 43.6462, lng: -79.3978 } },
  { id: 'a12', cityId: 'toronto', name: 'Patois',                  cuisine: 'Jamaican-Chinese',neighborhood: 'Dundas West',       coords: { lat: 43.6490, lng: -79.4090 } },
];

const FT_TOURS = [
  {
    id: 't1',
    cityId: 'toronto',
    name: 'Downtown Crawl',
    subtitle: '10 stops · Kensington → Queen West',
    // Suggested order — west → east, ending downtown
    stopIds: ['r2','r3','r6','r4','r10','r1','r9','r8','r5','r7'],
  },
];

const FT_DATA = { cities: [FT_CITY], restaurants: FT_RESTAURANTS, ambient: FT_AMBIENT, tours: FT_TOURS };

// Hardcoded starting location — Union Station, Toronto.
const FT_USER_START = { lat: 43.6453, lng: -79.3806 };

// ─── Local persistence layer ────────────────────────────────
const FT_STORE_KEY = 'ft:v1:visits';
// Seed a few visits so the app feels lived-in on first load.
// Matches real restaurant ids so pins, cards, route all update accordingly.
const FT_SEED_VISITS = {
  r2: { // Seven Lives — visited, reviewed, 3 photos
    visitedAt: Date.now() - 1000 * 60 * 60 * 26,
    review: { stars: 5, text: 'Gobernador taco still unreal. Line was worth it.', at: Date.now() - 1000 * 60 * 60 * 25 },
    photos: [
      { id: 'seed_r2_1', at: Date.now() - 1000 * 60 * 60 * 26 },
      { id: 'seed_r2_2', at: Date.now() - 1000 * 60 * 60 * 26 + 500 },
      { id: 'seed_r2_3', at: Date.now() - 1000 * 60 * 60 * 26 + 900 },
    ],
  },
  r3: { // Rasta Pasta — visited, reviewed, 1 photo
    visitedAt: Date.now() - 1000 * 60 * 60 * 24,
    review: { stars: 4, text: 'Rose sauce + jerk? Chef knew.', at: Date.now() - 1000 * 60 * 60 * 23 },
    photos: [{ id: 'seed_r3_1', at: Date.now() - 1000 * 60 * 60 * 24 }],
  },
  r6: { // Mother's Dumplings — visited, no review yet, 2 photos
    visitedAt: Date.now() - 1000 * 60 * 60 * 20,
    photos: [
      { id: 'seed_r6_1', at: Date.now() - 1000 * 60 * 60 * 20 },
      { id: 'seed_r6_2', at: Date.now() - 1000 * 60 * 60 * 20 + 400 },
    ],
  },
};

function ftLoadVisits() {
  // Brand-new user state: zero visits. The reset button clears localStorage,
  // and a fresh load returns {} so every restaurant is unvisited.
  try {
    const raw = localStorage.getItem(FT_STORE_KEY);
    if (raw) return JSON.parse(raw) || {};
    return {};
  } catch { return {}; }
}
function ftSaveVisits(visits) {
  try { localStorage.setItem(FT_STORE_KEY, JSON.stringify(visits)); } catch {}
}

// Simple nearest-neighbor route from userPos → remaining stops. Reasonable for <12 pts.
function ftOptimalOrder(userLatLng, remaining) {
  if (!remaining.length) return [];
  const d = (a, b) => {
    const dx = a.lat - b.lat, dy = a.lng - b.lng;
    return dx*dx + dy*dy;
  };
  const out = [];
  const pool = [...remaining];
  let cur = userLatLng;
  while (pool.length) {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const dd = d(cur, pool[i].coords);
      if (dd < bd) { bd = dd; bi = i; }
    }
    const next = pool.splice(bi, 1)[0];
    out.push(next);
    cur = next.coords;
  }
  return out;
}

// Haversine in meters
function ftMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

Object.assign(window, {
  FT_DATA, FT_CITY, FT_RESTAURANTS, FT_AMBIENT, FT_TOURS, FT_USER_START,
  ftLoadVisits, ftSaveVisits, ftOptimalOrder, ftMeters,
});
