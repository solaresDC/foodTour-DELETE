// Apple Wallet–style pass: a stamp card with one slot per tour stop.
// Each visit "punches" its slot. At 10/10 a final reward unlocks.

const { useState: useStateWallet, useEffect: useEffectWallet } = React;

function FTWallet({ tour, restaurants, visits, accent, night, onClose }) {
  const orderedStops = tour.stopIds
    .map(id => restaurants.find(r => r.id === id))
    .filter(Boolean);
  const done = orderedStops.filter(r => visits[r.id]?.visitedAt).length;
  const total = orderedStops.length;
  const completed = done >= total;

  // Format pass number for that real-wallet feel (FT-XXXX-XXXX)
  const passNo = useStateWallet(() => {
    let n = 0;
    for (const id of Object.keys(visits)) for (const c of id) n = (n * 31 + c.charCodeAt(0)) >>> 0;
    if (!n) n = 8472051;
    const s = String(n).padStart(8, '0');
    return `FT-${s.slice(0, 4)}-${s.slice(4, 8)}`;
  })[0];

  // Mount animation
  const [mounted, setMounted] = useStateWallet(false);
  useEffectWallet(() => { const t = setTimeout(() => setMounted(true), 20); return () => clearTimeout(t); }, []);

  const passBg = `linear-gradient(155deg, ${accent} 0%, ${shade(accent, -0.18)} 60%, ${shade(accent, -0.36)} 100%)`;

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 68, paddingBottom: 24,
      opacity: mounted ? 1 : 0,
      transition: 'opacity 280ms',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 'calc(100% - 32px)', maxWidth: 340,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'transform 420ms cubic-bezier(.2,.8,.2,1.1)',
        display: 'flex', flexDirection: 'column', gap: 12,
        maxHeight: 'calc(100% - 92px)', overflowY: 'auto',
        paddingRight: 2,
      }}
      className="ft-hide-scroll">
        {/* Close handle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            fontWeight: 700, color: 'rgba(255,255,255,0.75)',
          }}>FT Wallet · Pass</div>
          <button onClick={onClose} style={{
            border: 'none', background: 'rgba(255,255,255,0.14)',
            color: '#fff', borderRadius: 99, padding: '6px 10px',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <FTIcon name="x" size={11} sw={2.6} /> Close
          </button>
        </div>

        {/* The pass */}
        <div style={{
          position: 'relative',
          borderRadius: 22, overflow: 'hidden',
          background: passBg, color: '#fff',
          boxShadow: '0 30px 60px rgba(0,0,0,0.45), 0 6px 14px rgba(0,0,0,0.18)',
        }}>
          {/* Subtle texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 0%, rgba(255,255,255,0.18) 0%, transparent 40%), repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)`,
            pointerEvents: 'none',
          }} />

          {/* Pass header */}
          <div style={{ position: 'relative', padding: '18px 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Instrument Serif", serif', fontSize: 18, fontWeight: 600,
              }}>FT</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.78, fontWeight: 700 }}>
                  Toronto · {tour.name}
                </div>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, lineHeight: 1.05, marginTop: 2 }}>
                  Stamp Card
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.78, fontWeight: 700 }}>STOPS</div>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 26, lineHeight: 1, marginTop: 2 }}>
                  {done}<span style={{ opacity: 0.55 }}>/{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div style={{ position: 'relative', height: 18 }}>
            <div style={{
              position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)',
              width: 20, height: 20, borderRadius: 99, background: night ? '#12100f' : '#F4EFE9',
            }} />
            <div style={{
              position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
              width: 20, height: 20, borderRadius: 99, background: night ? '#12100f' : '#F4EFE9',
            }} />
            <div style={{
              position: 'absolute', left: 16, right: 16, top: '50%',
              borderTop: '1px dashed rgba(255,255,255,0.4)',
            }} />
          </div>

          {/* Stamp grid */}
          <div style={{ padding: '14px 16px 16px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10,
            }}>
              {orderedStops.map((r, i) => {
                const v = visits[r.id];
                const stamped = !!v?.visitedAt;
                return (
                  <FTStamp key={r.id}
                    idx={i + 1}
                    name={r.name}
                    cuisine={r.cuisine}
                    hue={r.hue}
                    stamped={stamped}
                    visitedAt={v?.visitedAt}
                  />
                );
              })}
            </div>

            {/* Pass footer */}
            <div style={{
              marginTop: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 10, letterSpacing: 1.4, fontWeight: 700,
              color: 'rgba(255,255,255,0.78)',
            }}>
              <span>PASS · {passNo}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {completed ? <><FTIcon name="check" size={11} sw={3} /> COMPLETE</> : <>VALID · {total - done} TO GO</>}
              </span>
            </div>

            {/* Faux barcode */}
            <div style={{
              marginTop: 10, height: 38, borderRadius: 6, background: '#fff',
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 1.6,
            }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const w = ((i * 13 + 7) % 4) + 1;
                return <div key={i} style={{ width: w, height: '100%', background: '#1a1411' }} />;
              })}
            </div>
            <div style={{
              marginTop: 6, textAlign: 'center', fontSize: 9.5,
              letterSpacing: 4, fontWeight: 700, color: 'rgba(255,255,255,0.78)',
            }}>{passNo}</div>
          </div>
        </div>

        {/* Reward unlock */}
        <FTReward completed={completed} done={done} total={total} accent={accent} night={night} />
      </div>
    </div>
  );
}

function FTStamp({ idx, name, cuisine, hue, stamped, visitedAt }) {
  const [show, setShow] = useStateWallet(stamped);
  // Pop-in for newly stamped cells (if mount happens after a visit, this
  // doesn't differentiate, but the static stamp still looks right.)
  useEffectWallet(() => { if (stamped) setShow(true); }, [stamped]);

  const date = stamped && visitedAt
    ? new Date(visitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()
    : '';

  return (
    <div style={{
      position: 'relative',
      aspectRatio: '1 / 1',
      borderRadius: 12,
      background: stamped ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.10)',
      border: stamped ? 'none' : '1.5px dashed rgba(255,255,255,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {stamped ? (
        <>
          {/* Stamp graphic — radial blob with stop number, slightly rotated */}
          <div style={{
            position: 'absolute', inset: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotate(${(idx * 37) % 14 - 7}deg)`,
            transition: 'transform 320ms cubic-bezier(.2,.9,.2,1.1)',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: 99,
              border: `2.5px solid oklch(0.42 0.12 ${hue})`,
              color: `oklch(0.36 0.12 ${hue})`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              opacity: 0.92,
              backgroundImage: `repeating-linear-gradient(45deg, transparent 0 6px, oklch(0.42 0.12 ${hue} / 0.08) 6px 7px)`,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 800 }}>FT</div>
              <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 19, lineHeight: 1, fontWeight: 600 }}>
                {String(idx).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 6.5, letterSpacing: 1.6, fontWeight: 700, marginTop: 1 }}>{date}</div>
            </div>
          </div>
        </>
      ) : (
        <div style={{
          fontFamily: '"Instrument Serif", serif', fontSize: 16, color: 'rgba(255,255,255,0.45)', fontWeight: 600,
        }}>{String(idx).padStart(2, '0')}</div>
      )}
    </div>
  );
}

function FTReward({ completed, done, total, accent, night }) {
  return (
    <div style={{
      borderRadius: 18, padding: 16,
      background: night ? 'rgba(30,28,26,0.94)' : 'rgba(255,255,255,0.96)',
      color: night ? '#fff' : '#1a1411',
      boxShadow: '0 18px 36px rgba(0,0,0,0.32)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: completed ? accent : (night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
        color: completed ? '#fff' : (night ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FTIcon name="crown" size={22} sw={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          fontWeight: 700, opacity: 0.6,
        }}>
          {completed ? 'Reward unlocked' : `Reward in ${total - done} stops`}
        </div>
        <div style={{
          marginTop: 2,
          fontFamily: '"Instrument Serif", serif', fontSize: 19, lineHeight: 1.1,
          letterSpacing: -0.2,
        }}>
          {completed ? 'A free dessert at any stop on us' : 'A free dessert at any stop on us'}
        </div>
      </div>
      {completed && (
        <button style={{
          border: 'none', background: accent, color: '#fff',
          borderRadius: 99, padding: '8px 14px', fontWeight: 700,
          fontSize: 12, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          Redeem
        </button>
      )}
    </div>
  );
}

// Tiny color helper — shade a hex toward black/white in approximate OKLCH lightness.
function shade(hex, amt) {
  // amt: -1..1 (negative = darker)
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map(h => parseInt(h, 16));
  const adj = (c) => {
    const v = amt < 0 ? Math.round(c * (1 + amt)) : Math.round(c + (255 - c) * amt);
    return Math.max(0, Math.min(255, v));
  };
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return '#' + toHex(adj(r)) + toHex(adj(g)) + toHex(adj(b));
}

Object.assign(window, { FTWallet });
