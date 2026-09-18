import { useAddy, FONT_OPTIONS, fontStack } from "../state/store.jsx";
import { Logo, ChevronLeft, ChevronRight } from "../components/Icons.jsx";
import ThemePicker from "../components/ThemePicker.jsx";

const STEP_NAMES = [
  "Your name",
  "Why Addy",
  "Reading",
  "Formats",
  "Focus",
  "Sound",
  "Comfort",
  "Study buddy",
  "All set",
];
const LAST = STEP_NAMES.length - 1;

const REASONS = ["ADHD", "Dyslexia", "Both", "Rather not say", "Just exploring"];
const STRUGGLES = [
  "I lose my place",
  "Letters or words blur or swap",
  "My mind wanders",
  "Walls of text overwhelm me",
  "I re-read the same line",
  "I don't know where to start",
];
const FORMATS = [
  "Diagrams and flowcharts",
  "Step-by-step checklists",
  "Short summaries",
  "Games and quick quizzes",
];
const FOCUS_OPTS = ["5 min", "15 min", "25 min", "45+ min"];
const SOUNDS = ["Silence", "Lo-fi", "Classical", "Nature sounds", "Brown noise"];
const BUDDIES = [
  { label: "Calm", sub: "Only reacts when you finish something" },
  { label: "Playful", sub: "Cheers you on along the way" },
  { label: "Off", sub: "No buddy, no reactions" },
];

function FormatArt({ index }) {
  if (index === 0)
    return (
      <svg width="74" height="44" viewBox="0 0 74 44" aria-hidden="true">
        <rect x="6" y="4" width="26" height="14" rx="4" fill="var(--sage)" />
        <rect x="6" y="26" width="26" height="14" rx="4" fill="var(--sage)" opacity=".55" />
        <line x1="19" y1="18" x2="19" y2="26" stroke="var(--sage)" strokeWidth="2" />
      </svg>
    );
  if (index === 1)
    return (
      <svg width="74" height="44" viewBox="0 0 74 44" aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x="6" y={4 + k * 14} width="12" height="10" rx="3" fill="var(--clay)" opacity={1 - k * 0.25} />
            <rect x="24" y={6 + k * 14} width="38" height="6" rx="3" fill="var(--border)" />
          </g>
        ))}
      </svg>
    );
  if (index === 2)
    return (
      <svg width="74" height="44" viewBox="0 0 74 44" aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <rect key={k} x="6" y={6 + k * 12} width={[58, 48, 34][k]} height="6" rx="3" fill="var(--sage)" opacity={1 - k * 0.2} />
        ))}
      </svg>
    );
  return (
    <svg width="74" height="44" viewBox="0 0 74 44" aria-hidden="true">
      <circle cx="20" cy="22" r="12" fill="var(--warn)" />
      <path d="M44 10 L58 22 L44 34 Z" fill="var(--clay)" />
    </svg>
  );
}

export default function Onboarding() {
  const { state, patch, sel, toggleIn, font } = useAddy();
  const st = state;
  const name = st.name.trim();

  const pct = Math.round(((st.step + 1) / STEP_NAMES.length) * 100);
  const back = () => patch((s) => ({ step: Math.max(0, s.step - 1) }));
  const next = () => patch((s) => ({ step: Math.min(LAST, s.step + 1) }));

  const summary = [
    { k: "Name", v: name || "Not given" },
    { k: "Here for", v: st.reason || "Not said" },
    {
      k: "Formats you like",
      v: st.prefs.length ? st.prefs.join(", ") : "We will suggest as we go",
    },
    { k: "Focus timer", v: `${st.focusMin} min` },
    { k: "Sound", v: st.sound },
    { k: "Study buddy", v: st.buddy },
  ];

  return (
    <div
      className="stack"
      style={{ minHeight: "100vh", alignItems: "center", padding: "0 20px 60px" }}
    >
      <div className="stack" style={{ width: "100%", maxWidth: 720, gap: 10, paddingTop: 26 }}>
        <div className="row muted" style={{ justifyContent: "space-between", fontSize: 15 }}>
          <span>{`Step ${st.step + 1} of ${STEP_NAMES.length}`}</span>
          <span>{STEP_NAMES[st.step]}</span>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="stack" style={{ width: "100%", maxWidth: 720, marginTop: 34, gap: 26 }}>
        {st.step === 0 && (
          <>
            <h1 className="h1 pretty">What should we call you?</h1>
            <input
              className="field field-lg"
              value={st.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Your name"
              autoFocus
            />
          </>
        )}

        {st.step === 1 && (
          <>
            <div className="stack" style={{ gap: 8 }}>
              <h1 className="h1 pretty">What brings you to Addy?</h1>
              <p className="muted" style={{ margin: 0, fontSize: 17 }}>
                No diagnosis needed — this just helps us set things up.
              </p>
            </div>
            <div className="grid-auto">
              {REASONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="tile"
                  style={{ minHeight: 64, ...sel(st.reason === label) }}
                  aria-pressed={st.reason === label}
                  onClick={() => patch({ reason: label })}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {st.step === 2 && (
          <>
            <h1 className="h1 pretty">When reading gets hard, what usually happens?</h1>
            <p className="muted" style={{ margin: "-14px 0 0", fontSize: 17 }}>
              Pick as many as you like.
            </p>
            <div className="row wrap" style={{ gap: 10 }}>
              {STRUGGLES.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="chip"
                  style={{ fontSize: 17, ...sel(st.struggles.includes(label)) }}
                  aria-pressed={st.struggles.includes(label)}
                  onClick={() => toggleIn("struggles", label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {st.step === 3 && (
          <>
            <h1 className="h1 pretty">How do you like to take in information?</h1>
            <div className="grid-auto">
              {FORMATS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className="tile"
                  style={{ gap: 12, padding: 18, ...sel(st.prefs.includes(label)) }}
                  aria-pressed={st.prefs.includes(label)}
                  onClick={() => toggleIn("prefs", label)}
                >
                  <span style={{ display: "block" }}>
                    <FormatArt index={i} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {st.step === 4 && (
          <>
            <div className="stack" style={{ gap: 8 }}>
              <h1 className="h1 pretty">
                How long can you usually focus before needing a break?
              </h1>
              <p className="muted" style={{ margin: 0, fontSize: 17 }}>
                This sets your focus timer. You can change it any time.
              </p>
            </div>
            <div className="row wrap" style={{ gap: 12 }}>
              {FOCUS_OPTS.map((label) => {
                const mins = parseInt(label, 10);
                return (
                  <button
                    key={label}
                    type="button"
                    className="btn"
                    style={{
                      minWidth: 120,
                      minHeight: 64,
                      fontSize: 20,
                      ...sel(st.focusMin === mins),
                    }}
                    aria-pressed={st.focusMin === mins}
                    onClick={() => patch({ focusMin: mins })}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {st.step === 5 && (
          <>
            <h1 className="h1 pretty">What helps you study?</h1>
            <div className="row wrap" style={{ gap: 10 }}>
              {SOUNDS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="chip"
                  style={{ fontSize: 17, padding: "12px 20px", ...sel(st.sound === label) }}
                  aria-pressed={st.sound === label}
                  onClick={() => patch({ sound: label })}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {st.step === 6 && (
          <>
            <h1 className="h1 pretty">Make reading comfortable</h1>
            <div className="grid-auto-lg" style={{ gap: 18 }}>
              <div className="stack" style={{ gap: 16 }}>
                <label className="label">
                  Reading font
                  <select
                    className="select"
                    value={font}
                    onChange={(e) =>
                      patch({ font: e.target.value, fontTouched: true })
                    }
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="label">
                  <span>{`Text size · ${st.size}px`}</span>
                  <input
                    className="range"
                    type="range"
                    min="16"
                    max="28"
                    step="1"
                    value={st.size}
                    onChange={(e) => patch({ size: parseInt(e.target.value, 10) })}
                  />
                </div>
                <div className="label">
                  <span>{`Line spacing · ${st.lh}`}</span>
                  <input
                    className="range"
                    type="range"
                    min="1.4"
                    max="2.2"
                    step="0.1"
                    value={st.lh}
                    onChange={(e) => patch({ lh: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="label">
                  <span>Background tint</span>
                  <ThemePicker />
                </div>
              </div>
              <div className="card stack pad-22" style={{ gap: 10 }}>
                <div className="mono">live preview</div>
                <p
                  style={{
                    margin: 0,
                    maxWidth: "65ch",
                    textAlign: "left",
                    fontFamily: fontStack(font),
                    fontSize: st.size,
                    lineHeight: st.lh,
                    letterSpacing: "0.02em",
                  }}
                >
                  Cellular respiration is the process cells use to turn glucose
                  into usable energy. It happens in three main stages, and each
                  one hands something to the next.
                </p>
              </div>
            </div>
          </>
        )}

        {st.step === 7 && (
          <>
            <h1 className="h1 pretty">Want a study buddy?</h1>
            <div className="grid-auto">
              {BUDDIES.map((b) => (
                <button
                  key={b.label}
                  type="button"
                  className="tile"
                  style={{ padding: 18, ...sel(st.buddy === b.label) }}
                  aria-pressed={st.buddy === b.label}
                  onClick={() => patch({ buddy: b.label })}
                >
                  <span style={{ fontSize: 19 }}>{b.label}</span>
                  <span className="muted f15">{b.sub}</span>
                </button>
              ))}
            </div>
            <label className="label" style={{ fontSize: 17 }}>
              Anything else that trips you up when studying?
              <textarea
                className="textarea"
                rows="3"
                value={st.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder="Optional"
              />
            </label>
          </>
        )}

        {st.step === LAST && (
          <div className="stack" style={{ gap: 18, alignItems: "flex-start" }}>
            <Logo size={72} />
            <h1 style={{ fontSize: 34 }}>
              {`You're all set${name ? `, ${name}` : ""}`}
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: 18, maxWidth: "60ch" }}>
              Here is what we set up. Everything is changeable from Quick
              settings.
            </p>
            <div className="grid-auto" style={{ width: "100%" }}>
              {summary.map((s) => (
                <div key={s.k} className="card stack pad-16" style={{ gap: 4 }}>
                  <span className="muted f15">{s.k}</span>
                  <span className="f18">{s.v}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => patch({ screen: "dashboard" })}
            >
              Go to my dashboard
            </button>
          </div>
        )}

        {st.step < LAST && (
          <div className="row wrap" style={{ gap: 14, marginTop: 8 }}>
            <button type="button" className="btn btn-52" onClick={back} disabled={st.step === 0}
              style={st.step === 0 ? { opacity: 0.45, cursor: "not-allowed" } : undefined}>
              <ChevronLeft />
              Back
            </button>
            <button type="button" className="btn btn-primary btn-52" onClick={next}>
              {st.step === LAST - 1 ? "Finish" : "Next"}
              <ChevronRight />
            </button>
            <button
              type="button"
              className="btn-plain"
              onClick={next}
              style={{
                minHeight: 52,
                padding: "0 18px",
                fontSize: 17,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
