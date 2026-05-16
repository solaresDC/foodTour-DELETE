// Real map via Leaflet + OpenStreetMap (CartoDB Voyager / DarkMatter tiles).
// We render Leaflet into a container, then overlay our own custom SVG markers
// and route ribbon using Leaflet's projection math (map.latLngToContainerPoint).
//
// Why custom markers as an overlay? So they stay on-brand (numbered pins,
// visited-check, pulse, next-up halo) instead of default Leaflet icons.

const { useEffect: useEffectMap, useRef: useRefMap, useState: useStateMap } = React;

// Load Leaflet CSS + JS once.
function ensureLeaflet() {
  if (window.__ftLeafletLoading) return window.__ftLeafletLoading;
  if (window.L) return Promise.resolve(window.L);
  window.__ftLeafletLoading = new Promise((resolve) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    css.crossOrigin = '';
    document.head.appendChild(css);

    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    s.crossOrigin = '';
    s.onload = () => resolve(window.L);
    document.head.appendChild(s);
  });
  return window.__ftLeafletLoading;
}

function FTMap({
  restaurants, tour, visits, userPos, activeId, mode, night, accent,
  onTapStop, onDragUser, ambient = [],
}) {
  const containerRef = useRefMap(null);
  const mapRef = useRefMap(null);
  const tileRef = useRefMap(null);
  const [, force] = useStateMap(0);
  const [ambientTip, setAmbientTip] = useStateMap(null); // {id, x, y}
  const rerender = () => force(n => n + 1);

  // Init Leaflet + add initial tile layer
  useEffectMap(() => {
    let cancelled = false;
    ensureLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        center: [FT_CITY.center.lat, FT_CITY.center.lng],
        zoom: FT_CITY.zoom,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
        fadeAnimation: false,
      });
      mapRef.current = map;
      // Initial tile layer (matches current `night` via ref so we don't need it as dep)
      const url = night
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      tileRef.current = L.tileLayer(url, {
        maxZoom: 19, subdomains: 'abcd',
        opacity: 1,
        attribution: '© OpenStreetMap © CARTO',
      }).addTo(map);

      map.on('move zoom moveend zoomend', rerender);
      // Fit bounds over the tour stops (not Union Station — it's inside the
      // tour area anyway). Use paddingTopLeft / paddingBottomRight so the map
      // accounts for the top chrome (~210px) and bottom card carousel (~260px)
      // that overlay it — otherwise fitBounds centers the stops behind the
      // card stack.
      const bounds = L.latLngBounds(restaurants.map(r => [r.coords.lat, r.coords.lng]));
      map.fitBounds(bounds, {
        paddingTopLeft: [20, 230],
        paddingBottomRight: [20, 280],
        maxZoom: 15,
      });
      // Tile-layer needs an invalidate after fitBounds settles inside small container
      setTimeout(() => { map.invalidateSize(); rerender(); }, 50);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
        tileRef.current = null;
      }
    };
  }, []);

  // Swap tiles on day/night change (skip first run — initial tiles are added above)
  const nightRef = useRefMap(night);
  useEffectMap(() => {
    if (nightRef.current === night) return; // initial render — do nothing
    nightRef.current = night;
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    if (tileRef.current) {
      mapRef.current.removeLayer(tileRef.current);
      tileRef.current = null;
    }
    const url = night
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileRef.current = L.tileLayer(url, {
      maxZoom: 19, subdomains: 'abcd',
      opacity: 1,
      attribution: '© OpenStreetMap © CARTO',
    }).addTo(mapRef.current);
  }, [night]);

  const L = window.L;
  const map = mapRef.current;
  const hasMap = !!(map && L);

  // Project lat/lng → pixel space
  const project = (latlng) => {
    if (!hasMap) return { x: 0, y: 0 };
    const p = map.latLngToContainerPoint([latlng.lat, latlng.lng]);
    return { x: p.x, y: p.y };
  };

  const orderedStops = tour.stopIds
    .map(id => restaurants.find(r => r.id === id))
    .filter(Boolean);

  const remaining = orderedStops.filter(r => !visits[r.id]?.visitedAt);
  const routeStops = hasMap && mode === 'route'
    ? ftOptimalOrder(userPos, remaining)
    : [];

  // Active stop for free-mode direct path (card-centered or tapped pin)
  const activeStop = activeId ? orderedStops.find(r => r.id === activeId) : null;

  // Route path:
  //  - Route mode: user → all remaining stops in optimized order
  //  - Free mode:  user → active stop (direct line), if any
  const routePts = !hasMap
    ? []
    : mode === 'route'
      ? [project(userPos), ...routeStops.map(r => project(r.coords))]
      : (activeStop ? [project(userPos), project(activeStop.coords)] : []);

  const routeD = routePts.length >= 2
    ? routePts.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')
    : '';

  // Drag handler for the user puck
  const draggingRef = useRefMap(false);
  useEffectMap(() => {
    const el = containerRef.current;
    if (!el || !hasMap) return;

    const hit = (clientX, clientY) => {
      const rect = el.getBoundingClientRect();
      const { x, y } = project(userPos);
      const dx = (clientX - rect.left) - x;
      const dy = (clientY - rect.top) - y;
      return Math.sqrt(dx*dx + dy*dy) < 28;
    };
    const posToLatLng = (clientX, clientY) => {
      const rect = el.getBoundingClientRect();
      const latlng = map.containerPointToLatLng([clientX - rect.left, clientY - rect.top]);
      return { lat: latlng.lat, lng: latlng.lng };
    };
    const onDown = (e) => {
      const t = e.touches ? e.touches[0] : e;
      if (hit(t.clientX, t.clientY)) {
        draggingRef.current = true;
        // Disable map dragging while we move the puck
        map.dragging.disable();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const t = e.touches ? e.touches[0] : e;
      onDragUser(posToLatLng(t.clientX, t.clientY));
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        map.dragging.enable();
      }
    };
    el.addEventListener('mousedown', onDown, true);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false, capture: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onDown, true);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [hasMap, userPos, onDragUser]);

  const userPx = hasMap ? project(userPos) : null;
  const size = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={containerRef} style={{
        position: 'absolute', inset: 0,
        background: night ? '#12100f' : '#F4EFE9',
      }} />
      {/* Overlay SVG — pointer-events none so the map pans underneath;
          markers re-enable pointer-events individually.
          z-index must clear Leaflet's panes (tilePane=200, overlayPane=400,
          shadowPane=500, markerPane=600, popupPane=700) so our pins render on top. */}
      {hasMap && (
        <svg width={size.width} height={size.height} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          zIndex: 800,
        }}>
          {/* Route ribbon — full path in route mode, direct line in free mode */}
          {routePts.length >= 2 && (
            <g>
              <path d={routeD} stroke={accent} strokeOpacity="0.22" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d={routeD}
                stroke={accent}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={mode === 'free' ? '8 8' : undefined}
              />
              {mode === 'route' && (
                <path d={routeD} stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="0 10" strokeLinecap="round">
                  <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1.2s" repeatCount="indefinite" />
                </path>
              )}
            </g>
          )}

          {/* Ambient (non-tour) pins — rendered behind tour pins so they don't
              compete. Small, unnumbered, muted. Tap shows a name tooltip only. */}
          {ambient.map((a) => {
            const p = project(a.coords);
            const isTip = ambientTip?.id === a.id;
            const dotFill = night ? 'rgba(255,255,255,0.55)' : 'rgba(26,20,17,0.45)';
            return (
              <g key={a.id}
                 transform={`translate(${p.x} ${p.y})`}
                 style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                 onClick={(e) => {
                   e.stopPropagation();
                   setAmbientTip(isTip ? null : { id: a.id, x: p.x, y: p.y });
                 }}>
                <circle r="10" fill="transparent" />
                <circle r="3.5" fill={dotFill} stroke={night ? '#12100f' : '#F4EFE9'} strokeWidth="1.5" />
              </g>
            );
          })}
          {ambientTip && (() => {
            const a = ambient.find(x => x.id === ambientTip.id);
            if (!a) return null;
            const p = project(a.coords);
            const w = Math.max(80, a.name.length * 6.8 + 20);
            return (
              <g transform={`translate(${p.x} ${p.y - 16})`} style={{ pointerEvents: 'none' }}>
                <rect x={-w/2} y={-22} width={w} height={22} rx={11}
                      fill={night ? '#1c1917' : '#1a1411'} />
                <text x="0" y="-7" textAnchor="middle" fontSize="11" fontFamily="Inter, system-ui"
                      fontWeight="600" fill="#fff">
                  {a.name}
                </text>
                <path d={`M -5 0 L 0 5 L 5 0 Z`} fill={night ? '#1c1917' : '#1a1411'} />
              </g>
            );
          })()}

          {/* Stop markers */}
          {orderedStops.map((r, idx) => {
            const p = project(r.coords);
            const visited = !!visits[r.id]?.visitedAt;
            const active = activeId === r.id;
            const nextUp = mode === 'route' && routeStops[0]?.id === r.id;
            const fill = visited ? (night ? '#3d342e' : '#c9bfae') : '#fff';
            const ring = visited ? (night ? '#3d342e' : '#c9bfae') : accent;
            const textFill = visited ? (night ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)') : '#1a1411';
            const scale = active ? 1.5 : (nextUp ? 1.12 : 1);

            return (
              <g key={r.id}
                 transform={`translate(${p.x} ${p.y}) scale(${scale})`}
                 style={{
                   pointerEvents: 'auto', cursor: 'pointer',
                   transition: 'transform 280ms cubic-bezier(.2,.9,.2,1.1)',
                 }}
                 onClick={(e) => { e.stopPropagation(); onTapStop(r.id); }}>
                {nextUp && !active && (
                  <circle r="18" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="2">
                    <animate attributeName="r" from="18" to="34" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}
                <ellipse cx="0" cy="14" rx="9" ry="2.5" fill={night ? 'rgba(0,0,0,0.5)' : 'rgba(60,40,20,0.22)'} />
                <path d="M 0 14 C -13 2 -14 -6 -14 -10 A 14 14 0 1 1 14 -10 C 14 -6 13 2 0 14 Z"
                      fill={fill} stroke={ring} strokeWidth={visited ? 2 : 2.5} />
                {visited ? (
                  <path d="M -4 -8 L -1 -5 L 5 -12" fill="none" stroke={textFill} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <text x="0" y="-5" textAnchor="middle" fontSize="13" fontFamily="Inter, system-ui" fontWeight="700" fill={textFill}>
                    {idx + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* User puck */}
          {userPx && (
            <g transform={`translate(${userPx.x} ${userPx.y})`} style={{ pointerEvents: 'auto', cursor: 'grab' }}>
              <circle r="26" fill={accent} fillOpacity="0.12">
                <animate attributeName="r" from="20" to="44" dur="2s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" from="0.22" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="11" fill="#fff" stroke={accent} strokeWidth="3" />
              <circle r="4.5" fill={accent} />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}

Object.assign(window, { FTMap });
