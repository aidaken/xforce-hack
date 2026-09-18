import { useAddy } from "../state/store.jsx";
import { FORMAT_ICONS, FORMAT_NAMES } from "../data/readings.js";

const STATUS_COLOR = {
  Done: "var(--ok)",
  "In progress": "var(--warn-text)",
};

export default function Folder() {
  const { state, patch, readings } = useAddy();
  const items = readings.filter((x) => x.folder === state.folder);

  return (
    <div className="page page-narrow">
      <div className="row muted f16" style={{ gap: 10 }}>
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            patch({ screen: "dashboard" });
          }}
        >
          Dashboard
        </a>
        <span>›</span>
        <span style={{ color: "var(--text)" }}>{state.folder}</span>
      </div>
      <h1 className="h1">{state.folder}</h1>

      <div className="stack" style={{ gap: 12 }}>
        {items.map((x) => (
          <button
            key={x.id}
            type="button"
            className="card row wrap pad-20"
            style={{ textAlign: "left", gap: 16, cursor: "pointer", color: "var(--text)" }}
            onClick={() =>
              patch({
                screen: "reading",
                reading: x.id,
                tab: null,
                quest: 0,
                pick: null,
                leaves: 0,
                questDone: false,
                hl: [],
                regen: "",
              })
            }
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                display: "grid",
                placeItems: "center",
              }}
              aria-hidden="true"
            >
              {FORMAT_ICONS[x.rec]}
            </span>
            <span className="stack" style={{ gap: 4, flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 20 }}>{x.title}</span>
              <span className="muted f15">
                ~{x.mins} min read · {FORMAT_NAMES[x.rec]}
              </span>
            </span>
            <span
              className="f15"
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: STATUS_COLOR[x.status] || "var(--text2)",
                background: "var(--bg)",
              }}
            >
              {x.status}
            </span>
          </button>
        ))}
        {items.length === 0 && (
          <div className="card muted f16 pad-22" style={{ borderStyle: "dashed" }}>
            Nothing in this folder yet. Add a reading from the dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
