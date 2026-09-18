import { useAddy, FONT_OPTIONS } from "../state/store.jsx";
import ThemePicker from "../components/ThemePicker.jsx";
import StreakCalendar from "../components/StreakCalendar.jsx";
import { GardenPlant } from "../components/Plant.jsx";
import {
  FocusTimerStepper,
  ReduceMotionToggle,
} from "../components/QuickSettings.jsx";

export default function Profile() {
  const { state, patch } = useAddy();
  const st = state;
  const name = st.name.trim();
  const display = name || "Sam";

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
    <div className="page page-mid" style={{ gap: 26, paddingBottom: 80 }}>
      <div className="row" style={{ gap: 16 }}>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "var(--sage)",
            color: "var(--surface)",
            display: "grid",
            placeItems: "center",
            fontSize: 24,
          }}
        >
          {display.charAt(0).toUpperCase()}
        </span>
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ fontSize: 28 }}>{display}</h1>
          <span className="muted f16">
            12 day streak ·{" "}
            {st.garden.length === 1 ? "1 plant" : `${st.garden.length} plants`}
          </span>
        </div>
      </div>

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="h2">Learning profile</h2>
        <div className="grid-auto">
          {summary.map((s) => (
            <div key={s.k} className="card stack pad-16" style={{ gap: 4 }}>
              <span className="muted f15">{s.k}</span>
              <span className="f18">{s.v}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-48"
          style={{ alignSelf: "flex-start" }}
          onClick={() => patch({ screen: "onboarding", step: 0 })}
        >
          Retake the questionnaire
        </button>
      </section>

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="h2">Reading settings</h2>
        <div
          className="card pad-22"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 22,
          }}
        >
          <label className="label f15">
            Reading font
            <select
              className="select"
              value={st.font}
              onChange={(e) => patch({ font: e.target.value })}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <div className="label f15">
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
          <div className="label f15">
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
          <div className="label f15">
            <span>Theme</span>
            <ThemePicker minHeight={44} fontSize={15} />
          </div>
          <div className="label f15">
            <span>Focus timer</span>
            <FocusTimerStepper />
          </div>
          <div style={{ alignSelf: "end" }}>
            <ReduceMotionToggle minHeight={48} />
          </div>
        </div>
      </section>

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="h2">Streak history</h2>
        <StreakCalendar />
      </section>

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="h2">Garden</h2>
        <div className="grid-auto-sm">
          {st.garden.map((g) => (
            <div
              key={g.id}
              className="card stack pad-18"
              style={{ alignItems: "center", gap: 10 }}
            >
              <GardenPlant />
              <span className="f16" style={{ textAlign: "center" }}>
                {g.title}
              </span>
              <span className="muted" style={{ fontSize: 14 }}>
                {g.folder}
              </span>
            </div>
          ))}
          {st.garden.length === 0 && (
            <div
              className="card muted f16"
              style={{ borderStyle: "dashed", padding: 24 }}
            >
              Finish a reading as a Quest and your plant lands here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
