import { useAddy } from "../state/store.jsx";
import { FOLDER_NAMES, FOLDER_TINTS } from "../data/readings.js";
import QuickSettings from "../components/QuickSettings.jsx";
import AddReading from "../components/AddReading.jsx";
import { ChevronRight, Clock, Plus } from "../components/Icons.jsx";

const UPCOMING = [
  { title: "History essay outline", folder: "History Essay", due: "Due tomorrow", color: "var(--clay)" },
  { title: "Reading response: respiration", folder: "Biology 101", due: "Due Thursday", color: "var(--warn)" },
  { title: "Problem set 3", folder: "Intro to Economics", due: "Due next Monday", color: "var(--sage)" },
];

export default function Dashboard() {
  const { state, patch, readings } = useAddy();
  const name = state.name.trim();

  return (
    <div className="dash">
      <QuickSettings />

      <main className="stack" style={{ gap: 26, minWidth: 0 }}>
        <section className="card card-lift stack pad-28" style={{ gap: 18 }}>
          <div className="muted f16">
            {name
              ? `Let's pick up where you left off, ${name}`
              : "Let's pick up where you left off"}
          </div>
          <div
            className="row wrap"
            style={{ gap: 24, alignItems: "flex-end", justifyContent: "space-between" }}
          >
            <div className="stack" style={{ gap: 8, minWidth: 260 }}>
              <div style={{ fontSize: 30, fontWeight: 500 }}>Cellular respiration</div>
              <div className="muted f17">Biology 101 · 6 min read · flowchart</div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() =>
                patch({
                  screen: "reading",
                  reading: "bio1",
                  folder: "Biology 101",
                  tab: null,
                  quest: 0,
                  pick: null,
                })
              }
            >
              Continue
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <div className="row muted f16" style={{ justifyContent: "space-between" }}>
              <span>You were on step 4 of 9</span>
              <span>44%</span>
            </div>
            <div className="bar" style={{ height: 10 }}>
              <div className="bar-fill" style={{ width: "44%" }} />
            </div>
          </div>
        </section>

        <section className="stack" style={{ gap: 12 }}>
          <h2 className="h2">Coming up</h2>
          <div className="stack" style={{ gap: 10 }}>
            {UPCOMING.map((u) => (
              <div
                key={u.title}
                className="row wrap card"
                style={{
                  gap: 14,
                  borderLeft: `5px solid ${u.color}`,
                  padding: "16px 18px",
                }}
              >
                <div className="stack" style={{ gap: 3, flex: 1, minWidth: 200 }}>
                  <span className="f18">{u.title}</span>
                  <span className="muted f15">{u.folder}</span>
                </div>
                <span className="pill" style={{ color: u.color }}>
                  <Clock />
                  {u.due}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="stack" style={{ gap: 12 }}>
          <div className="row wrap" style={{ justifyContent: "space-between", gap: 12 }}>
            <h2 className="h2">My folders</h2>
            <button
              type="button"
              className="btn"
              style={{ fontSize: 16 }}
              onClick={() =>
                patch({ addOpen: !state.addOpen, addDone: "", addError: "", dragOver: false })
              }
            >
              <Plus />
              Add a reading
            </button>
          </div>

          {state.addOpen && <AddReading />}

          <div className="grid-auto" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
            {FOLDER_NAMES.map((n) => {
              const count = readings.filter((x) => x.folder === n).length;
              return (
                <button
                  key={n}
                  type="button"
                  className="card stack pad-20"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    color: "var(--text)",
                    gap: 8,
                    minHeight: 110,
                  }}
                  onClick={() => patch({ screen: "folder", folder: n })}
                >
                  <span
                    style={{
                      width: 26,
                      height: 20,
                      borderRadius: 5,
                      background: FOLDER_TINTS[n],
                    }}
                  />
                  <span style={{ fontSize: 19 }}>{n}</span>
                  <span className="muted f15">
                    {count === 1 ? "1 reading" : `${count} readings`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
