import { useAddy, FONT_OPTIONS } from "../state/store.jsx";
import { Play, Pause } from "./Icons.jsx";
import ThemePicker from "./ThemePicker.jsx";

const SOUND_CHIPS = ["Off", "Lo-fi", "Classical", "Nature", "Brown noise"];
const BUDDY_CHIPS = ["Calm", "Playful", "Off"];

export function FocusTimerStepper({ fontSize = 17 }) {
  const { state, patch } = useAddy();
  return (
    <div className="row" style={{ gap: 10 }}>
      <button
        type="button"
        className="btn btn-icon"
        aria-label="Shorter focus session"
        onClick={() => patch((s) => ({ focusMin: Math.max(5, s.focusMin - 5) }))}
        style={{ fontSize: 20 }}
      >
        –
      </button>
      <div style={{ flex: 1, textAlign: "center", fontSize }}>
        {state.focusMin} min
      </div>
      <button
        type="button"
        className="btn btn-icon"
        aria-label="Longer focus session"
        onClick={() => patch((s) => ({ focusMin: Math.min(60, s.focusMin + 5) }))}
        style={{ fontSize: 20 }}
      >
        +
      </button>
    </div>
  );
}

export function ReduceMotionToggle({ minHeight = 44 }) {
  const { state, patch } = useAddy();
  return (
    <button
      type="button"
      onClick={() => patch({ rm: !state.rm })}
      role="switch"
      aria-checked={state.rm}
      className="row"
      style={{
        justifyContent: "space-between",
        gap: 12,
        minHeight,
        padding: "8px 12px",
        background: "var(--bg)",
        border: "1.5px solid var(--border)",
        borderRadius: 12,
        cursor: "pointer",
        color: "var(--text)",
        fontSize: 16,
      }}
    >
      <span>Reduce motion</span>
      <span
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          padding: 3,
          transition: "background .2s",
          justifyContent: state.rm ? "flex-end" : "flex-start",
          background: state.rm ? "var(--sage)" : "var(--border)",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "var(--surface)",
          }}
        />
      </span>
    </button>
  );
}

export function FontSelect({ fontSize = 16 }) {
  const { state, patch } = useAddy();
  return (
    <select
      className="select"
      style={{ minHeight: 44, fontSize }}
      value={state.font}
      onChange={(e) => patch({ font: e.target.value })}
      aria-label="Reading font"
    >
      {FONT_OPTIONS.map((f) => (
        <option key={f} value={f} style={{ fontFamily: f }}>
          {f}
        </option>
      ))}
    </select>
  );
}

export default function QuickSettings() {
  const { state, patch, sel } = useAddy();

  return (
    <aside className="card stack pad-20" style={{ gap: 22 }}>
      <div style={{ fontSize: 19, fontWeight: 500 }}>Quick settings</div>

      <div className="stack" style={{ gap: 10 }}>
        <div className="muted f15">Sound</div>
        <div className="row wrap" style={{ gap: 8 }}>
          {SOUND_CHIPS.map((label) => (
            <button
              key={label}
              type="button"
              className="chip"
              style={{ padding: "8px 14px", fontSize: 15, ...sel(state.sound === label) }}
              aria-pressed={state.sound === label}
              onClick={() => patch({ sound: label })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={() => patch({ playing: !state.playing })}
            aria-label={state.playing ? "Pause ambient sound" : "Play ambient sound"}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "1.5px solid var(--border)",
              background: "var(--bg)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--text)",
            }}
          >
            {state.playing ? <Pause /> : <Play />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={state.vol}
            onChange={(e) => patch({ vol: parseInt(e.target.value, 10) })}
            aria-label="Volume"
            style={{ flex: 1, accentColor: "var(--sage)", height: 44 }}
          />
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="muted f15">Reading font</div>
        <FontSelect />
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="muted f15">Theme</div>
        <ThemePicker minHeight={44} fontSize={15} />
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="muted f15">Focus timer</div>
        <FocusTimerStepper />
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="muted f15">Study buddy</div>
        <div className="row" style={{ gap: 8 }}>
          {BUDDY_CHIPS.map((label) => (
            <button
              key={label}
              type="button"
              style={{
                flex: 1,
                minHeight: 44,
                fontSize: 15,
                borderRadius: 12,
                cursor: "pointer",
                color: "var(--text)",
                border: "1.5px solid var(--border)",
                ...sel(state.buddy === label),
              }}
              aria-pressed={state.buddy === label}
              onClick={() => patch({ buddy: label })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ReduceMotionToggle />
    </aside>
  );
}
