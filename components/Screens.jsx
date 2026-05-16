// Screens: DetailSheet, CheckIn flow, Review flow, Completion
// Each uses shared motion tokens and works on a 402×874 iPhone frame.

const { useState: useStateScreens, useEffect: useEffectScreens, useRef: useRefScreens } = React;

// ─── Detail bottom sheet ───────────────────────────────────
function FTDetailSheet({ restaurant, visit, accent, night, onClose, onCheckIn, onReview }) {
  if (!restaurant) return null;
  const visited = !!visit?.visitedAt;
  const hasReview = !!visit?.review;
  const bg = night ? '#1a1816' : '#fff';
  const text = night ? '#fff' : '#1a1411';
  const muted = night ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: bg, borderRadius: '28px 28px 0 0',
      boxShadow: '0 -20px 40px rgba(0,0,0,0.15)',
      zIndex: 40,
      animation: 'ftSheetIn 380ms cubic-bezier(.2,.8,.2,1.05)',
      maxHeight: '82%', display: 'flex', flexDirection: 'column',
    }}>
      {/* Handle + close */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
        <div style={{ width: 36, height: 5, background: 'rgba(0,0,0,0.15)', borderRadius: 99 }} />
      </div>
      <button onClick={onClose} aria-label="Close" style={{
        position: 'absolute', top: 12, right: 14, border: 'none',
        background: night ? 'rgba(255,255,255,0.1)' : 'rgba(26,20,17,0.08)',
        width: 36, height: 36, borderRadius: 99, display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        color: text, zIndex: 2,
        boxShadow: night ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <FTIcon name="x" size={18} sw={2.4} />
      </button>

      <div style={{ overflowY: 'auto', padding: '14px 20px 24px', flex: 1 }}>
        {/* Hero image */}
        <FTPlaceholder label={`${restaurant.name} · ${restaurant.cuisine}`} hue={restaurant.hue} h={180} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 16, gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: '"Instrument Serif", ui-serif, Georgia, serif',
              fontSize: 32, lineHeight: 1.05, color: text, letterSpacing: -0.3,
            }}>{restaurant.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: muted, fontSize: 13 }}>
              <span>{restaurant.cuisine}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{restaurant.neighborhood}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <FTPriceRow price={restaurant.price} />
            </div>
          </div>
          {visited && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              background: night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderRadius: 99, color: text, fontSize: 12, fontWeight: 600,
            }}>
              <FTIcon name="check" size={14} sw={2.6} /> Visited
            </div>
          )}
        </div>

        {/* Short desc */}
        <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.5, color: text, textWrap: 'pretty' }}>
          {restaurant.short}
        </p>

        {/* Must order */}
        <div style={{
          marginTop: 16, padding: '12px 14px', borderRadius: 16,
          background: night ? 'rgba(255,255,255,0.05)' : '#FAF4EC',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 99, background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <FTIcon name="crown" size={16} sw={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4, color: muted, fontWeight: 600 }}>Must order</div>
            <div style={{ fontSize: 15, color: text, fontWeight: 600 }}>{restaurant.must}</div>
          </div>
        </div>

        {/* Review if present */}
        {hasReview && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, color: muted, fontWeight: 600, marginBottom: 6 }}>Your review</div>
            <FTStars value={visit.review.stars} accent={accent} size={18} />
            <p style={{ margin: '8px 0 0', fontSize: 14, color: text, lineHeight: 1.5 }}>{visit.review.text}</p>
          </div>
        )}

        {/* Photos if any */}
        {visit?.photos?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, color: muted, fontWeight: 600, marginBottom: 8 }}>Your photos</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {visit.photos.map((p, i) => (
                <div key={p.id} style={{ flexShrink: 0 }}>
                  <FTPlaceholder label={`photo ${i+1}`} hue={(restaurant.hue + i*30) % 360} h={96} style={{ width: 96 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{
        padding: '12px 20px 26px', borderTop: `1px solid ${night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', gap: 10, background: bg,
      }}>
        {!visited ? (
          <button onClick={onCheckIn} style={ftPrimaryBtn(accent)}>
            <FTIcon name="near" size={18} sw={2.1} /> Check in here
          </button>
        ) : !hasReview ? (
          <button onClick={onReview} style={ftPrimaryBtn(accent)}>
            <FTIcon name="star" size={18} sw={2.1} /> Leave a review
          </button>
        ) : (
          <button onClick={onClose} style={{ ...ftPrimaryBtn(accent), background: night ? '#2a2623' : '#1a1411' }}>
            Back to map
          </button>
        )}
      </div>
    </div>
  );
}

function ftPrimaryBtn(accent) {
  return {
    flex: 1, height: 52, borderRadius: 16, border: 'none',
    background: accent, color: '#fff',
    fontFamily: 'Inter, ui-sans-serif', fontSize: 16, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', boxShadow: '0 6px 16px rgba(200,74,46,0.28)',
  };
}

// ─── Check-in flow (GPS verify → photo → confirm) ──────────
function FTCheckInFlow({ restaurant, userPos, accent, night, onCancel, onComplete }) {
  const [step, setStep] = useStateScreens(0); // 0 verify, 1 photo, 2 confirming
  const [photoCount, setPhotoCount] = useStateScreens(1);

  // Real GPS distance using lat/lng (haversine, meters)
  const realDist = ftMeters(userPos, restaurant.coords);
  // HACK: after 5s in "Finding you…", pretend we arrived so demo always advances
  const [arrived, setArrived] = useStateScreens(false);
  const dist = arrived ? 0 : realDist;
  const withinRange = arrived || realDist < 150;

  useEffectScreens(() => {
    if (step === 0) {
      const arriveT = setTimeout(() => setArrived(true), 5000);
      return () => clearTimeout(arriveT);
    }
  }, [step]);

  useEffectScreens(() => {
    if (step === 0 && withinRange) {
      const t = setTimeout(() => setStep(1), 700);
      return () => clearTimeout(t);
    }
  }, [step, withinRange]);

  const bg = night ? '#1a1816' : '#fff';
  const text = night ? '#fff' : '#1a1411';
  const muted = night ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg, zIndex: 60,
      display: 'flex', flexDirection: 'column',
      animation: 'ftFadeIn 260ms',
    }}>
      {/* header */}
      <div style={{ padding: '62px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onCancel} style={ftIconBtn(night)}>
          <FTIcon name="x" size={18} sw={2.2} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600, color: text }}>
          Check in
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* stepper */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 20px 24px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= step ? accent : (night ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
            transition: 'background 300ms',
          }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: '0 24px', overflowY: 'auto' }}>
        {step === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{
              width: 120, height: 120, borderRadius: 99, margin: '0 auto',
              background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 99,
                border: `2px solid ${accent}`, opacity: 0.4,
                animation: 'ftPulse 1.6s ease-out infinite',
              }} />
              <div style={{ color: accent }}>
                <FTIcon name="near" size={48} sw={1.6} />
              </div>
            </div>
            <div style={{ marginTop: 28, fontFamily: '"Instrument Serif", serif', fontSize: 32, color: text, lineHeight: 1.1 }}>
              Finding you…
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: muted }}>
              Verifying you're at <b style={{ color: text }}>{restaurant.name}</b>
            </div>
            <div style={{
              marginTop: 36, padding: '14px 18px', borderRadius: 14,
              background: night ? 'rgba(255,255,255,0.05)' : '#F5EFE6',
              display: 'inline-flex', alignItems: 'center', gap: 10, color: text, fontSize: 13,
            }}>
              <FTIcon name="walk" size={16} sw={2.2} /> ~{dist} m away
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ paddingTop: 12 }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, color: text, lineHeight: 1.1 }}>
              You made it.
            </div>
            <div style={{ marginTop: 6, fontSize: 14, color: muted }}>Add a photo of your meal.</div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Array.from({ length: photoCount }).map((_, i) => (
                <FTPlaceholder key={i} label={`photo ${i+1}`} hue={(restaurant.hue + i*40) % 360} h={140} />
              ))}
              <button onClick={() => setPhotoCount(c => Math.min(c + 1, 4))} style={{
                height: 140, borderRadius: 18, border: `2px dashed ${night ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)'}`,
                background: 'transparent', cursor: 'pointer', color: text,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <FTIcon name="camera" size={26} sw={1.8} />
                <div style={{ fontSize: 13 }}>Add photo</div>
              </button>
            </div>

            <div style={{
              marginTop: 24, padding: 14, borderRadius: 14,
              background: night ? 'rgba(255,255,255,0.05)' : '#FAF4EC',
              fontSize: 13, color: muted,
            }}>
              Photos are stored on this device only. They'll sync when you create an account later.
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{
              width: 120, height: 120, borderRadius: 99, margin: '0 auto',
              background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: `0 12px 30px ${accent}55`,
              animation: 'ftPop 420ms cubic-bezier(.2,.9,.2,1.2)',
            }}>
              <FTIcon name="check" size={60} sw={2.4} />
            </div>
            <div style={{ marginTop: 28, fontFamily: '"Instrument Serif", serif', fontSize: 34, color: text, lineHeight: 1.05 }}>
              Checked in.
            </div>
            <div style={{ marginTop: 10, fontSize: 15, color: muted }}>
              Nice — one closer to the end of the tour.
            </div>
          </div>
        )}
      </div>

      {/* action */}
      <div style={{ padding: '12px 20px 26px' }}>
        {step === 1 && (
          <button onClick={() => { setStep(2); setTimeout(() => onComplete({ photos: photoCount }), 1100); }} style={ftPrimaryBtn(accent)}>
            Confirm check-in
          </button>
        )}
      </div>
    </div>
  );
}

function ftIconBtn(night) {
  return {
    width: 36, height: 36, borderRadius: 99, border: 'none',
    background: night ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: night ? '#fff' : '#1a1411', cursor: 'pointer',
  };
}

// ─── Review flow ───────────────────────────────────────────
function FTReviewFlow({ restaurant, accent, night, onCancel, onSubmit }) {
  const [stars, setStars] = useStateScreens(0);
  const [text, setText] = useStateScreens('');
  const bg = night ? '#1a1816' : '#fff';
  const fg = night ? '#fff' : '#1a1411';
  const muted = night ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg, zIndex: 60,
      display: 'flex', flexDirection: 'column',
      animation: 'ftFadeIn 260ms',
    }}>
      <div style={{ padding: '62px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onCancel} style={ftIconBtn(night)}>
          <FTIcon name="x" size={18} sw={2.2} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600, color: fg }}>
          Review
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, padding: '12px 24px', overflowY: 'auto' }}>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 32, color: fg, lineHeight: 1.1 }}>
          How was <span style={{ fontStyle: 'italic' }}>{restaurant.name}</span>?
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: muted }}>Tap the stars, leave a line.</div>

        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <FTStars value={stars} onChange={setStars} size={40} accent={accent} />
        </div>

        <div style={{ marginTop: 28 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`The ${restaurant.must?.toLowerCase()} was…`}
            maxLength={240}
            style={{
              width: '100%', minHeight: 120, padding: 14,
              border: `1px solid ${night ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              background: night ? 'rgba(255,255,255,0.03)' : '#FAF6F0',
              borderRadius: 16, resize: 'none', fontFamily: 'Inter, ui-sans-serif',
              fontSize: 15, color: fg, outline: 'none', boxSizing: 'border-box',
              lineHeight: 1.5,
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: muted, textAlign: 'right' }}>
            {text.length}/240
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 20px 26px' }}>
        <button
          disabled={stars === 0}
          onClick={() => onSubmit({ stars, text: text.trim() || 'Loved it.' })}
          style={{
            ...ftPrimaryBtn(accent),
            opacity: stars === 0 ? 0.4 : 1, cursor: stars === 0 ? 'not-allowed' : 'pointer',
          }}>
          Post review
        </button>
      </div>
    </div>
  );
}

// ─── Completion celebration ────────────────────────────────
function FTCompletion({ tour, accent, night, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: night ? 'rgba(18,16,15,0.97)' : 'rgba(255,250,244,0.97)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, animation: 'ftFadeIn 420ms',
    }}>
      {/* confetti */}
      {Array.from({ length: 28 }).map((_, i) => {
        const hue = (i * 40) % 360;
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.1;
        const size = 6 + (i % 3) * 3;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${left}%`, top: -20,
            width: size, height: size * 1.4, borderRadius: 2,
            background: `oklch(0.72 0.17 ${hue})`,
            animation: `ftConfetti 2.4s ${delay}s ease-in forwards`,
            transform: `rotate(${i * 17}deg)`,
          }} />
        );
      })}

      {/* stamp */}
      <div style={{
        width: 140, height: 140, borderRadius: 99,
        border: `3px solid ${accent}`, color: accent,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: 'rotate(-8deg)', animation: 'ftStamp 680ms cubic-bezier(.2,.9,.2,1.4)',
        fontFamily: '"Instrument Serif", serif',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, fontWeight: 700, fontFamily: 'Inter', textTransform: 'uppercase' }}>Tour</div>
        <div style={{ fontSize: 38, lineHeight: 1, fontStyle: 'italic' }}>complete</div>
        <div style={{ fontSize: 11, letterSpacing: 3, fontWeight: 700, fontFamily: 'Inter', textTransform: 'uppercase' }}>Toronto</div>
      </div>

      <div style={{
        marginTop: 36, fontFamily: '"Instrument Serif", serif', fontSize: 40,
        color: night ? '#fff' : '#1a1411', lineHeight: 1, textAlign: 'center', letterSpacing: -0.5,
      }}>
        You ate the whole city.
      </div>
      <div style={{
        marginTop: 12, fontSize: 15, color: night ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
        textAlign: 'center', maxWidth: 280, textWrap: 'pretty',
      }}>
        Ten stops. One walking tour of Toronto's best bites, done. Nice work.
      </div>

      <button onClick={onClose} style={{
        marginTop: 36, padding: '14px 28px', borderRadius: 99, border: 'none',
        background: accent, color: '#fff', fontSize: 15, fontWeight: 600,
        cursor: 'pointer', boxShadow: `0 6px 18px ${accent}44`,
      }}>
        See my tour
      </button>
    </div>
  );
}

Object.assign(window, { FTDetailSheet, FTCheckInFlow, FTReviewFlow, FTCompletion, ftPrimaryBtn });
