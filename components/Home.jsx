// Home screen: real Leaflet map + bottom card-stack + mode toggle + progress ring.

const { useState: useStateHome, useEffect: useEffectHome, useRef: useRefHome } = React;

function FTProgressRing({ done, total, accent, night, size = 52 }) {
  const r = (size - 6) / 2;
  const C = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;
  const bg = night ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke={bg} strokeWidth="4" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={accent} strokeWidth="4" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${C * pct} ${C}`}
                transform={`rotate(-90 ${size/2} ${size/2})`}
                style={{ transition: 'stroke-dasharray 600ms cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: night ? '#fff' : '#1a1411',
        letterSpacing: -0.3,
      }}>
        {done}<span style={{ opacity: 0.35 }}>/{total}</span>
      </div>
    </div>
  );
}

function FTModeToggle({ mode, onChange, accent, night }) {
  const bg = night ? 'rgba(30,28,26,0.88)' : 'rgba(255,255,255,0.92)';
  return (
    <div style={{
      display: 'inline-flex', padding: 4, borderRadius: 99, background: bg,
      boxShadow: '0 4px 14px rgba(60,40,20,0.16)', position: 'relative',
      backdropFilter: 'blur(12px) saturate(160%)',
      WebkitBackdropFilter: 'blur(12px) saturate(160%)',
    }}>
      <div style={{
        position: 'absolute', top: 4, bottom: 4, width: 'calc(50% - 4px)',
        background: accent, borderRadius: 99,
        left: mode === 'route' ? 4 : 'calc(50% + 0px)',
        transition: 'left 320ms cubic-bezier(.2,.8,.2,1.1)',
        boxShadow: `0 4px 12px ${accent}55`,
      }} />
      {[
        { id: 'route', label: 'Optimal route', icon: 'route' },
        { id: 'free',  label: 'Free explore', icon: 'compass' },
      ].map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          position: 'relative', zIndex: 1, border: 'none', background: 'transparent',
          padding: '8px 14px', borderRadius: 99, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer',
          color: mode === o.id ? '#fff' : (night ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.62)'),
          fontFamily: 'Inter, ui-sans-serif', fontSize: 13, fontWeight: 600,
          transition: 'color 280ms',
        }}>
          <FTIcon name={o.icon} size={15} sw={2} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FTStopCard({ restaurant, idx, visit, accent, night, onTap, isNext, userPos }) {
  const visited = !!visit?.visitedAt;
  // Dark-leaning card (like the Gilded Bun ref). Flips with day/night but
  // stays rich and moody in both.
  const bg = night ? '#14110f' : '#1a1411';
  const text = '#fff';
  const muted = 'rgba(255,255,255,0.55)';
  const hair  = 'rgba(255,255,255,0.10)';

  // Seeded "rating" per stop so it's stable and deduplicated; real backend
  // would supply this. Range 4.3–4.9.
  const seed = restaurant.id.charCodeAt(1) || 1;
  const rating = (4.3 + ((seed * 7) % 7) / 10).toFixed(1);

  // Real distance from user → stop
  const meters = userPos ? ftMeters(userPos, restaurant.coords) : null;
  const distLabel = meters == null ? '' :
    meters < 1000 ? `${meters} M` : `${(meters/1000).toFixed(1)} KM`;

  // "OPEN" logic — seeded-random but stable
  const isOpen = (seed % 5) !== 0;

  return (
    <button onClick={onTap} style={{
      flex: '0 0 auto', width: 300, scrollSnapAlign: 'center',
      background: bg, borderRadius: 22, border: 'none', textAlign: 'left',
      padding: 0, cursor: 'pointer',
      boxShadow: '0 14px 34px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.12)',
      position: 'relative', overflow: 'visible',
      outline: isNext && !visited ? `1.5px solid ${accent}66` : 'none',
    }}>
      {/* Status chip — top-left inside the dark card */}
      <div style={{
        position: 'absolute', top: 14, left: 14, zIndex: 2,
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 99,
        background: visited ? 'rgba(255,255,255,0.10)' : (isNext ? accent : 'rgba(255,255,255,0.08)'),
        color: visited ? 'rgba(255,255,255,0.85)' : '#fff',
        fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
        fontFamily: 'Inter, system-ui',
        border: visited ? `1px solid ${hair}` : 'none',
      }}>
        {visited ? <><FTIcon name="check" size={10} sw={3} /> VISITED</> :
         isNext    ? <><FTIcon name="sparkle" size={10} sw={2.4} /> NEXT UP</> :
                     `STOP ${String(idx).padStart(2,'0')}`}
      </div>

      {/* Content grid — title/meta on left, hero image escapes top-right */}
      <div style={{
        position: 'relative',
        padding: '44px 18px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 104px',
        gap: 12,
        alignItems: 'end',
        minHeight: 150,
      }}>
        {/* Left column */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: '"Instrument Serif", serif',
            fontSize: 26, lineHeight: 1.0, letterSpacing: -0.3,
            color: text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{restaurant.name}</div>

          <div style={{
            marginTop: 8,
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
            color: muted,
            fontFamily: 'Inter, system-ui',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#fff' }}>
              <FTIcon name="star" size={11} sw={2} stroke={accent} />
              <span style={{ fontWeight: 700 }}>{rating}</span>
            </span>
            <span style={{ opacity: 0.35 }}>·</span>
            {distLabel && <>
              <span>{distLabel}</span>
              <span style={{ opacity: 0.35 }}>·</span>
            </>}
            <span style={{ color: isOpen ? accent : muted, fontWeight: 700 }}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div style={{
            marginTop: 10,
            fontSize: 12, color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.35,
            fontFamily: 'Inter, system-ui',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
            overflow: 'hidden',
          }}>
            {restaurant.neighborhood} · {restaurant.cuisine}
          </div>
        </div>

        {/* Hero image — overflows top of card, like the burger in the ref */}
        <div style={{
          position: 'relative',
          width: 110, height: 110,
          marginTop: -40, marginRight: -8,
          justifySelf: 'end',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 10px 22px rgba(0,0,0,0.5)',
            background: `radial-gradient(circle at 35% 30%, oklch(0.72 0.12 ${restaurant.hue}) 0%, oklch(0.38 0.10 ${restaurant.hue}) 65%, oklch(0.22 0.06 ${restaurant.hue}) 100%)`,
          }}>
            {/* Inner striped placeholder for "food photo" */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 10px, transparent 10px 22px)`,
            }} />
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 6,
              textAlign: 'center',
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 8.5, letterSpacing: 1, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}>{restaurant.cuisine.split(' ')[0]}</div>
          </div>
          {/* subtle ring to echo the rounded image treatment */}
          <div style={{
            position: 'absolute', inset: -2,
            borderRadius: 20, border: `1px solid ${hair}`,
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </button>
  );
}

function FTHome({
  tour, restaurants, visits, userPos, setUserPos,
  mode, setMode, accent, night,
  filter = 'all', setFilter,
  onOpenStop, onOpenWallet,
}) {
  const [activeIdx, setActiveIdx] = useStateHome(0);
  const scrollerRef = useRefHome(null);

  const orderedStops = tour.stopIds
    .map(id => restaurants.find(r => r.id === id))
    .filter(Boolean);

  // Filter applied to BOTH the carousel and the map pins
  const filteredStops = orderedStops.filter(r => {
    const v = !!visits[r.id]?.visitedAt;
    if (filter === 'visited') return v;
    if (filter === 'unvisited') return !v;
    return true;
  });

  const done = orderedStops.filter(r => visits[r.id]?.visitedAt).length;
  const total = orderedStops.length;

  // Next-up = first in optimized order from the user position
  const remaining = orderedStops.filter(r => !visits[r.id]?.visitedAt);
  const optimized = mode === 'route' ? ftOptimalOrder(userPos, remaining) : [];
  const nextId = optimized[0]?.id;

  const onScroll = () => {
    const s = scrollerRef.current;
    if (!s) return;
    const cards = s.querySelectorAll('[data-stop-card]');
    let closest = 0, min = Infinity;
    const center = s.scrollLeft + s.clientWidth / 2;
    cards.forEach((c, i) => {
      const mid = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < min) { min = d; closest = i; }
    });
    setActiveIdx(closest);
  };
  const activeStop = filteredStops[activeIdx] || filteredStops[0];
  const scrollToStop = (idx) => {
    const s = scrollerRef.current;
    if (!s) return;
    const c = s.querySelectorAll('[data-stop-card]')[idx];
    if (c) s.scrollTo({ left: c.offsetLeft - (s.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  };

  const next = nextId ? orderedStops.find(r => r.id === nextId) : null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <FTMap
        restaurants={restaurants}
        tour={{ ...tour, stopIds: filteredStops.map(r => r.id) }}
        visits={visits}
        userPos={userPos}
        ambient={filter === 'all' ? (window.FT_AMBIENT || []) : []}
        activeId={activeStop?.id}
        mode={mode}
        night={night}
        accent={accent}
        onTapStop={(id) => {
          const i = orderedStops.findIndex(r => r.id === id);
          if (i >= 0) scrollToStop(i);
          setTimeout(() => onOpenStop(id), 260);
        }}
        onDragUser={(latlng) => setUserPos(latlng)}
      />
      </div>

      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '54px 16px 12px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        pointerEvents: 'none',
      }}>
        <div style={{
          flex: 1, pointerEvents: 'auto',
          padding: '10px 14px', borderRadius: 18,
          background: night ? 'rgba(30,28,26,0.85)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          boxShadow: '0 4px 14px rgba(60,40,20,0.14)',
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
            fontWeight: 700, color: night ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
          }}>
            FT · Toronto
          </div>
          <div style={{
            marginTop: 2, fontFamily: '"Instrument Serif", serif',
            fontSize: 22, lineHeight: 1.05, color: night ? '#fff' : '#1a1411',
            letterSpacing: -0.2,
          }}>
            {tour.name}
          </div>
        </div>
        <div style={{
          pointerEvents: 'auto', padding: 8, borderRadius: 99,
          background: night ? 'rgba(30,28,26,0.85)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          boxShadow: '0 4px 14px rgba(60,40,20,0.14)',
          display: 'flex', alignItems: 'center',
        }}>
          <FTProgressRing done={done} total={total} accent={accent} night={night} />
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{
        position: 'absolute', top: 124, left: 0, right: 0, zIndex: 20,
        display: 'flex', justifyContent: 'center',
      }}>
        <FTModeToggle mode={mode} onChange={setMode} accent={accent} night={night} />
      </div>

      {/* Next-up hero band */}
      {mode === 'route' && next && (
        <button onClick={() => onOpenStop(next.id)} style={{
          position: 'absolute', top: 176, left: 16, right: 16, zIndex: 20,
          padding: '10px 14px', borderRadius: 18, border: 'none',
          background: accent, color: '#fff', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: `0 8px 22px ${accent}55`, cursor: 'pointer',
          opacity: 1,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(255,255,255,0.22)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <FTIcon name="walk" size={18} sw={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.7, fontWeight: 700 }}>
              NEXT STOP · {ftMeters(userPos, next.coords)} M
            </div>
            <div style={{
              fontFamily: '"Instrument Serif", serif', fontSize: 20,
              lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{next.name}</div>
          </div>
          <FTIcon name="chevron" size={18} sw={2.4} />
        </button>
      )}

      {/* Filter pill — slides between All / Visited / Unvisited.
          Hides/shows pins on the map AND filters the cards. */}
      <FTFilterPill
        filter={filter}
        setFilter={setFilter}
        accent={accent}
        night={night}
        counts={{
          all: orderedStops.length,
          visited: orderedStops.filter(r => visits[r.id]?.visitedAt).length,
          unvisited: orderedStops.filter(r => !visits[r.id]?.visitedAt).length,
        }}
      />

      {/* Card stack — wrapper has pointer-events:auto so swipes work in the
          gap between cards too (not only on a card). */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        style={{
          position: 'absolute', bottom: 96, left: 0, right: 0, zIndex: 20,
          display: 'flex', gap: 14, padding: '12px 60px',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          pointerEvents: 'auto',
        }}
        className="ft-hide-scroll"
      >
        {filteredStops.map((r, i) => (
          <div key={r.id} data-stop-card style={{ scrollSnapAlign: 'center' }}>
            <FTStopCard
              restaurant={r}
              idx={orderedStops.findIndex(o => o.id === r.id) + 1}
              visit={visits[r.id]}
              accent={accent}
              night={night}
              userPos={userPos}
              isNext={r.id === nextId}
              onTap={() => onOpenStop(r.id)}
            />
          </div>
        ))}
      </div>

      {/* Page indicator — sits between cards and bottom nav, doesn't block scroll */}
      <div style={{
        position: 'absolute', bottom: 78, left: 0, right: 0, zIndex: 20,
        display: 'flex', justifyContent: 'center', gap: 5, pointerEvents: 'none',
      }}>
        {filteredStops.map((_, i) => (
          <div key={i} style={{
            width: i === activeIdx ? 18 : 5, height: 5, borderRadius: 99,
            background: i === activeIdx ? (night ? '#fff' : '#1a1411') : (night ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'),
            transition: 'width 260ms, background 260ms',
          }} />
        ))}
      </div>

      {/* Floating bottom nav — Preferences · Map · Profile */}
      <FTBottomNav accent={accent} night={night} onProfile={onOpenWallet} />
    </div>
  );
}

// Sliding filter pill — sits just above the carousel.
function FTFilterPill({ filter, setFilter, accent, night, counts }) {
  const items = [
    { id: 'all',       label: 'All' },
    { id: 'visited',   label: 'Visited' },
    { id: 'unvisited', label: 'To go' },
  ];
  const idx = Math.max(0, items.findIndex(i => i.id === filter));
  const bg = night ? 'rgba(22,19,17,0.86)' : 'rgba(255,255,255,0.92)';
  return (
    <div style={{
      position: 'absolute', bottom: 296, left: 0, right: 0, zIndex: 22,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'auto', position: 'relative',
        display: 'flex', padding: 4, borderRadius: 999, background: bg,
        border: `1px solid ${night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          position: 'absolute', top: 4, bottom: 4,
          width: `calc((100% - 8px) / 3)`,
          left: `calc(4px + ${idx} * ((100% - 8px) / 3))`,
          background: accent, borderRadius: 999,
          transition: 'left 320ms cubic-bezier(.2,.8,.2,1.1)',
          boxShadow: `0 4px 12px ${accent}55`,
        }} />
        {items.map(it => {
          const active = filter === it.id;
          return (
            <button key={it.id} onClick={() => setFilter(it.id)} style={{
              position: 'relative', zIndex: 1, border: 'none', background: 'transparent',
              padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: active ? '#fff' : (night ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
              fontFamily: 'Inter, system-ui', fontSize: 12, fontWeight: 600,
              letterSpacing: 0.2, transition: 'color 220ms', minWidth: 78,
              justifyContent: 'center',
            }}>
              {it.label}
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: '1px 6px', borderRadius: 99,
                background: active ? 'rgba(255,255,255,0.22)' : (night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                color: active ? '#fff' : 'inherit',
              }}>{counts[it.id]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FTBottomNav({ accent, night, active = 'map', onProfile }) {
  // Glassy pill with three equally-spaced buttons. Purely visual in the MVP —
  // Map is the current screen; Preferences and Profile are stubs that flash
  // a tooltip so taps feel alive.
  const bg = night ? 'rgba(22,19,17,0.86)' : 'rgba(255,255,255,0.92)';
  const hair = night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const muted = night ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const [flash, setFlash] = useStateHome(null);
  const ping = (label) => {
    setFlash(label);
    clearTimeout(window.__ftNavFlash);
    window.__ftNavFlash = setTimeout(() => setFlash(null), 1400);
  };

  const items = [
    { id: 'prefs',   label: 'Prefs',       icon: 'sliders' },
    { id: 'map',     label: 'Map',         icon: 'near'    },
    { id: 'profile', label: 'Profile',     icon: 'user'    },
  ];

  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 'calc(22px + env(safe-area-inset-bottom))', zIndex: 25,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{
        pointerEvents: 'auto',
        position: 'relative',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        width: '100%',
        padding: 6,
        background: bg,
        border: `1px solid ${hair}`,
        borderRadius: 999,
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        boxShadow: '0 14px 34px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.08)',
      }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <button key={it.id}
              onClick={() => {
                if (it.id === 'profile' && onProfile) return onProfile();
                if (isActive) return;
                ping(it.label);
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, padding: '12px 8px', borderRadius: 999,
                border: 'none', cursor: 'pointer',
                background: isActive ? accent : 'transparent',
                color: isActive ? '#fff' : (night ? 'rgba(255,255,255,0.78)' : '#1a1411'),
                fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
                fontFamily: 'Inter, system-ui',
                transition: 'background 220ms, color 220ms',
              }}>
              <FTIcon name={it.icon} size={17} sw={2} />
              <span style={{ color: isActive ? '#fff' : muted, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                {it.label.toUpperCase()}
              </span>
            </button>
          );
        })}
        {flash && (
          <div style={{
            position: 'absolute', left: '50%', bottom: 'calc(100% + 8px)', transform: 'translateX(-50%)',
            padding: '6px 10px', borderRadius: 10,
            background: night ? '#1a1411' : '#1a1411',
            color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
            whiteSpace: 'nowrap',
            boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
            animation: 'ftNavFlash 1.4s ease both',
          }}>
            {flash} coming soon
          </div>
        )}
      </div>
      <style>{`
        @keyframes ftNavFlash {
          0%   { opacity: 0; transform: translate(-50%, 4px); }
          15%  { opacity: 1; transform: translate(-50%, 0); }
          85%  { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -4px); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { FTHome, FTProgressRing, FTModeToggle });
