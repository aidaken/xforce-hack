import { useAddy } from "../state/store.jsx";
import { ChevronLeft, ChevronRight } from "./Icons.jsx";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// The design pinned "today" to 18 Sep 2026 so the streak copy always lines up.
const TODAY = new Date(2026, 8, 18);

function studiedFor(y, m) {
  if (y === 2026 && m === 8)
    return [1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const out = [];
  const days = new Date(y, m + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    if ((d * 7 + m * 3 + y) % 5 < 2 || (d + m) % 9 === 0) out.push(d);
  }
  return out;
}

export default function StreakCalendar() {
  const { state, patch } = useAddy();
  const offset = state.monthOffset;
  const base = new Date(2026, 8 + offset, 1);
  const y = base.getFullYear();
  const m = base.getMonth();
  const total = new Date(y, m + 1, 0).getDate();
  const studied = studiedFor(y, m);
  const isNow = y === TODAY.getFullYear() && m === TODAY.getMonth();

  let best = 0;
  let run = 0;
  for (let d = 1; d <= total; d++) {
    if (studied.includes(d)) {
      run += 1;
      best = Math.max(best, run);
    } else run = 0;
  }

  const note = isNow
    ? "Sep 7 – 18 · 12 days in a row, your best run yet."
    : `${studied.length} study days in ${MONTHS[m]} · longest run ${best}${best === 1 ? " day" : " days"}`;

  return (
    <div className="card stack pad-22" style={{ gap: 18 }}>
      <div className="row" style={{ gap: 12 }}>
        <button
          type="button"
          className="btn btn-icon"
          aria-label="Previous month"
          onClick={() => patch((s) => ({ monthOffset: Math.max(-11, s.monthOffset - 1) }))}
        >
          <ChevronLeft size={15} />
        </button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 19 }}>
          {MONTHS[m]} {y}
        </div>
        {offset < 0 ? (
          <button
            type="button"
            className="btn btn-icon"
            aria-label="Next month"
            onClick={() => patch((s) => ({ monthOffset: Math.min(0, s.monthOffset + 1) }))}
          >
            <ChevronRight size={15} />
          </button>
        ) : (
          <span style={{ width: 44, height: 44 }} />
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 6,
          maxWidth: 420,
        }}
      >
        {WEEKDAYS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="muted"
            style={{ height: 24, display: "grid", placeItems: "center", fontSize: 13 }}
          >
            {d}
          </span>
        ))}
        {Array.from({ length: base.getDay() }, (_, i) => (
          <span key={`blank-${i}`} style={{ height: 44 }} />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const future = isNow && n > TODAY.getDate();
          const on = !future && studied.includes(n);
          const today = isNow && n === TODAY.getDate();
          return (
            <span
              key={n}
              aria-current={today ? "date" : undefined}
              style={{
                height: 44,
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                fontSize: 15,
                background: on ? "var(--ochre)" : "var(--bg)",
                color: on ? "var(--text)" : "var(--text2)",
                border: `1.5px solid ${today ? "var(--clay)" : on ? "var(--ochre)" : "var(--border)"}`,
                fontWeight: today ? 600 : 400,
              }}
            >
              {n}
            </span>
          );
        })}
      </div>

      {offset < 0 && (
        <button
          type="button"
          className="btn f15"
          style={{ alignSelf: "flex-start", padding: "0 16px" }}
          onClick={() => patch({ monthOffset: 0 })}
        >
          Back to this month
        </button>
      )}

      <div
        className="row wrap muted f15"
        style={{ gap: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}
      >
        <span className="row" style={{ gap: 8 }}>
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background: "var(--ochre)",
              border: "1.5px solid var(--border)",
            }}
          />
          Studied
        </span>
        <span className="row" style={{ gap: 8 }}>
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              background: "var(--bg)",
              border: "1.5px solid var(--clay)",
            }}
          />
          Today
        </span>
        <span>{note}</span>
      </div>
    </div>
  );
}
