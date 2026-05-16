// Shared UI primitives: placeholder food image, icons, buttons.
// All image imagery is STRIPED PLACEHOLDER — no fake illustrations.

function FTPlaceholder({ label = 'food photo', hue = 20, h = 160, radius = 18, style }) {
  // Subtle warm-toned diagonal stripe placeholder with a monospace label.
  // Hue lets each restaurant feel slightly distinct without being garish.
  const bg = `oklch(0.88 0.035 ${hue})`;
  const stripe = `oklch(0.82 0.045 ${hue})`;
  return (
    <div style={{
      position: 'relative', width: '100%', height: h, borderRadius: radius,
      overflow: 'hidden', background: bg,
      backgroundImage:
        `repeating-linear-gradient(135deg, ${stripe} 0 12px, transparent 12px 24px)`,
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
        fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
        color: `oklch(0.4 0.04 ${hue})`, opacity: 0.7,
      }}>{label}</div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────
function FTIcon({ name, size = 20, stroke = 'currentColor', sw = 1.9 }) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'route':   return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.5" {...p}/><circle cx="18" cy="6" r="2.5" {...p}/><path d="M6 15.5V12a4 4 0 014-4h4a4 4 0 004-4V3.5" {...p}/></svg>;
    case 'compass': return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...p}/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" {...p}/></svg>;
    case 'near':    return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" {...p}/><path d="M19 10c0 5.5-7 12-7 12S5 15.5 5 10a7 7 0 0114 0z" {...p}/></svg>;
    case 'camera':  return <svg width={size} height={size} viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5" {...p}/><circle cx="12" cy="13.5" r="3.5" {...p}/><path d="M9 7l1.5-2.5h3L15 7" {...p}/></svg>;
    case 'star':    return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 3.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 18.2 6.2 21.3l1.1-6.4-4.7-4.6 6.5-.9L12 3.5z" {...p}/></svg>;
    case 'check':   return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L20 6.5" {...p}/></svg>;
    case 'x':       return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" {...p}/></svg>;
    case 'list':    return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" {...p}/></svg>;
    case 'chevron': return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" {...p}/></svg>;
    case 'back':    return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" {...p}/></svg>;
    case 'walk':    return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="1.8" {...p}/><path d="M9 21l2-6 2.5 2V21M13.5 17l-2.5-2.5 1.5-4 3 2.5 3 1" {...p}/></svg>;
    case 'clock':   return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...p}/><path d="M12 7v5l3 2" {...p}/></svg>;
    case 'phone':   return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" {...p}/></svg>;
    case 'dollar':  return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 3v18M16 7H10a2.5 2.5 0 000 5h4a2.5 2.5 0 010 5H8" {...p}/></svg>;
    case 'crown':   return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z" {...p}/></svg>;
    case 'sparkle': return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" {...p}/></svg>;
    case 'sliders': return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" {...p}/><circle cx="16" cy="7" r="2.2" {...p}/><circle cx="8" cy="17" r="2.2" {...p}/></svg>;
    case 'user':    return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.6" {...p}/><path d="M4.5 20c1.8-4 4.7-5.5 7.5-5.5s5.7 1.5 7.5 5.5" {...p}/></svg>;
    default:        return null;
  }
}

function FTPill({ children, onClick, style, active, accent }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 32, padding: '0 12px', borderRadius: 999,
      background: active ? accent : 'rgba(255,255,255,0.9)',
      color: active ? '#fff' : '#1a1411',
      border: 'none',
      fontFamily: 'Inter, ui-sans-serif, system-ui', fontSize: 13, fontWeight: 600,
      boxShadow: active ? 'none' : '0 1px 3px rgba(60,40,20,0.14)',
      cursor: 'pointer',
      ...style,
    }}>{children}</button>
  );
}

function FTPriceRow({ price }) {
  const n = price?.length || 0;
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: 'rgba(0,0,0,0.55)' }}>
      {[1,2,3].map(i => (
        <span key={i} style={{
          fontWeight: 700, fontSize: 13,
          color: i <= n ? '#1a1411' : 'rgba(0,0,0,0.22)',
        }}>$</span>
      ))}
    </span>
  );
}

// Stars (filled count of 5)
function FTStars({ value, onChange, size = 22, accent = '#C84A2E' }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i}
                onClick={onChange ? () => onChange(i) : undefined}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  cursor: onChange ? 'pointer' : 'default',
                  color: i <= value ? accent : 'rgba(0,0,0,0.15)',
                  transition: 'transform 150ms',
                }}>
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 3.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 18.2 6.2 21.3l1.1-6.4-4.7-4.6 6.5-.9L12 3.5z"
                  fill={i <= value ? accent : 'rgba(0,0,0,0.09)'}
                  stroke={i <= value ? accent : 'rgba(0,0,0,0.22)'}
                  strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { FTPlaceholder, FTIcon, FTPill, FTPriceRow, FTStars });
