import { useAddy } from "../state/store.jsx";
import {
  ChevronDown,
  ChevronUp,
  Close,
  Logo,
  Pause,
  Play,
} from "../components/Icons.jsx";

const SPEEDS = { 1: 1.25, 1.25: 1.5, 1.5: 0.75, 0.75: 1 };

export default function Focus() {
  const { state, patch, current, fontStack } = useAddy();
  const st = state;

  const exit = () =>
    patch({
      screen: "reading",
      aloud: false,
      onBreak: false,
      returning: false,
      timerRunning: false,
    });

  return (
    <div className="focus">
      <div style={{ height: 5, background: "var(--soft)" }}>
        <div
          style={{
            height: "100%",
            background: "var(--sage)",
            transition: "width 1s linear",
            width: `${st.timerPct}%`,
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "56px 24px 140px",
        }}
      >
        <div className="stack" style={{ width: "100%", maxWidth: "65ch", gap: 22 }}>
          {st.returning && (
            <div
              className="row card muted"
              style={{ gap: 12, padding: "14px 18px", fontSize: 17 }}
            >
              <Logo size={24} fill="var(--sage)" eyesHidden />
              Welcome back — you were on step {st.focusSent + 1}.
            </div>
          )}
          <div className="mono" style={{ fontSize: 15 }}>
            {current.title} · {st.focusMin} min focus
          </div>

          {current.sents.map((s, i) => {
            const active = i === st.focusSent;
            const spoken = active && st.aloud;
            return (
              <p
                key={s.id}
                onClick={() => patch({ focusSent: i, word: -1 })}
                style={{
                  margin: 0,
                  padding: "6px 10px",
                  borderRadius: 8,
                  transition: "opacity .25s, background .25s",
                  cursor: "pointer",
                  fontFamily: fontStack,
                  fontSize: st.size + 2,
                  lineHeight: st.lh,
                  letterSpacing: "0.02em",
                  opacity: active ? 1 : 0.55,
                  background: active ? "var(--hl)" : "transparent",
                }}
              >
                {spoken
                  ? s.t.split(" ").map((w, j) => (
                      <span
                        key={`${w}-${j}`}
                        style={{
                          borderRadius: 5,
                          padding: "1px 2px",
                          background: j === st.word ? "var(--clay)" : "transparent",
                        }}
                      >
                        {w}{" "}
                      </span>
                    ))
                  : s.t}
              </p>
            );
          })}
        </div>
      </div>

      <div className="focus-dock">
        <div className="focus-dock-inner">
          <button
            type="button"
            className="btn-plain row"
            style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, fontSize: 15, gap: 6, color: "var(--text)", cursor: "pointer" }}
            onClick={() => patch((s) => ({ focusSent: Math.max(0, s.focusSent - 1), word: -1 }))}
          >
            <ChevronUp />
            Previous
          </button>
          <button
            type="button"
            className="btn-plain row"
            style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, fontSize: 15, gap: 6, color: "var(--text)", cursor: "pointer" }}
            onClick={() =>
              patch((s) => ({
                focusSent: Math.min(current.sents.length - 1, s.focusSent + 1),
                word: -1,
              }))
            }
          >
            Next
            <ChevronDown />
          </button>
          <span style={{ width: 1, height: 28, background: "var(--border)" }} />
          <button
            type="button"
            className="row"
            style={{
              minHeight: 44,
              padding: "0 16px",
              borderRadius: 999,
              border: "none",
              background: "var(--sage)",
              color: "var(--surface)",
              fontSize: 15,
              cursor: "pointer",
              gap: 8,
            }}
            onClick={() =>
              patch((s) => (s.aloud ? { aloud: false } : { aloud: true, word: 0 }))
            }
          >
            {st.aloud ? <Pause size={12} /> : <Play size={12} />}
            {st.aloud ? "Pause" : "Read aloud"}
          </button>
          <button
            type="button"
            className="btn f15"
            style={{ borderRadius: 999, padding: "0 14px" }}
            onClick={() => patch((s) => ({ speed: SPEEDS[s.speed] || 1 }))}
          >
            {st.speed}× speed
          </button>
          <span style={{ width: 1, height: 28, background: "var(--border)" }} />
          <button
            type="button"
            className="btn-plain row"
            style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, fontSize: 15, gap: 6, cursor: "pointer" }}
            onClick={exit}
          >
            <Close />
            Exit focus
          </button>
        </div>
      </div>

      {st.onBreak && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            className="stack"
            style={{ maxWidth: 440, alignItems: "center", gap: 18, textAlign: "center" }}
          >
            <Logo size={90} fill="var(--sage)" eyes="var(--surface)" />
            <div style={{ fontSize: 30 }}>Nice work — take 5 minutes.</div>
            <p className="muted" style={{ margin: 0, fontSize: 18 }}>
              Stand up, get water. Addy will keep your place.
            </p>
            <div className="row wrap" style={{ gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-primary btn-52"
                onClick={() => patch({ onBreak: false, timerPct: 0, timerRunning: true })}
              >
                Back to reading
              </button>
              <button type="button" className="btn btn-52" onClick={exit}>
                Finish for now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
