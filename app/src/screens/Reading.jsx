import { useState } from "react";
import { useAddy } from "../state/store.jsx";
import { FORMAT_NAMES } from "../data/readings.js";
import { chat, learnerFromProfile } from "../lib/api.js";
import { Flowchart, Checklist, Quest } from "../components/ReadingFormats.jsx";
import {
  Check,
  ChevronLeft,
  Info,
  Speaker,
  Target,
  Warn,
} from "../components/Icons.jsx";

const TABS = ["flowchart", "checklist", "quest"];

/** "This isn't working" options. Each one both reshapes the local view and
 *  gives the model a concrete instruction for the remake. */
const NOT_WORKING = [
  {
    label: "Too much at once",
    note: "Rebuilt with fewer ideas per step.",
    tab: () => "quest",
    ask: "Break this into smaller steps — fewer ideas per step.",
  },
  {
    label: "Too simple",
    note: "Rebuilt with more detail in each step.",
    tab: (tab) => tab,
    ask: "Add more detail to each step without adding new facts.",
  },
  {
    label: "Wrong format",
    note: "Switched format. Tell me again if this one misses too.",
    tab: (tab) =>
      tab === "flowchart" ? "checklist" : tab === "checklist" ? "quest" : "flowchart",
    ask: "This format is wrong for the material. Restructure it a different way.",
  },
  {
    label: "I'm lost",
    note: "Started you at step 1 with a quick check after each part.",
    tab: () => "quest",
    ask: "Start from the beginning, one small step at a time, with a check after each part.",
  },
];

export default function Reading() {
  const { state, patch, current, tab, splitRef, startDrag, fontStack } = useAddy();
  const st = state;
  const [remake, setRemake] = useState({ busy: false, text: "", error: "" });

  const flags = current.flags.length
    ? current.flags
    : ["Nothing flagged. Every idea in the source has a home in this version."];

  async function askForRemake(option) {
    patch({
      nwOpen: false,
      tab: option.tab(tab),
      regen: option.note,
      quest: 0,
      pick: null,
      questDone: false,
    });
    setRemake({ busy: true, text: "", error: "" });
    try {
      const res = await chat({
        learner: learnerFromProfile(st.reason, st.struggles),
        message: option.ask,
        documentId: current.source?.id,
        document: {
          title: current.title,
          text: current.sents.map((s) => s.t).join(" "),
          conceptType: current.source?.conceptType || "process",
        },
      });
      setRemake({ busy: false, text: res.text || "", error: "" });
    } catch (err) {
      setRemake({
        busy: false,
        text: "",
        error:
          err.code === "LLM_UNCONFIGURED"
            ? "Addy's model isn't configured, so it kept the local version."
            : err.message || "The remake didn't come back.",
      });
    }
  }

  return (
    <div className="page page-wide">
      <div className="row wrap" style={{ gap: 14 }}>
        <button
          type="button"
          className="btn"
          style={{ fontSize: 16 }}
          onClick={() => patch({ screen: "folder", folder: current.folder })}
        >
          <ChevronLeft size={15} />
          Back
        </button>
        <h1 style={{ fontSize: 26, flex: 1, minWidth: 200 }}>{current.title}</h1>
        <button
          type="button"
          className="btn"
          style={{ fontSize: 16 }}
          onClick={() =>
            patch({
              screen: "focus",
              returning: st.visited,
              visited: true,
              timerPct: 0,
              onBreak: false,
              timerRunning: true,
            })
          }
        >
          <Target />
          Focus mode
        </button>
        <button
          type="button"
          className="btn btn-sage"
          style={{ fontSize: 16 }}
          onClick={() =>
            patch({
              screen: "focus",
              aloud: true,
              word: 0,
              returning: st.visited,
              visited: true,
              timerPct: 0,
              onBreak: false,
              timerRunning: true,
            })
          }
        >
          <Speaker />
          Read aloud
        </button>
      </div>

      {current.rationale && (
        <div className="row wrap" style={{ gap: 12 }}>
          <div
            className="row card"
            style={{
              gap: 10,
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 16,
              maxWidth: "100%",
            }}
          >
            <Info />
            <span className="pretty">{current.rationale}</span>
            <button
              type="button"
              className="btn-link"
              style={{ whiteSpace: "nowrap" }}
              onClick={() => patch({ whyOpen: !st.whyOpen })}
            >
              Why?
            </button>
          </div>
        </div>
      )}
      {st.whyOpen && (
        <p
          className="card muted pad-18"
          style={{ margin: 0, maxWidth: "75ch", fontSize: 17, lineHeight: 1.6 }}
        >
          {current.why}
        </p>
      )}

      <div className="row wrap" style={{ gap: 10 }}>
        {TABS.map((k) => {
          const on = tab === k;
          return (
            <button
              key={k}
              type="button"
              className="btn btn-48"
              aria-pressed={on}
              onClick={() => patch({ tab: k, hl: [], pick: null })}
              style={{
                color: on ? "var(--clayfg)" : "var(--text)",
                background: on ? "var(--clay)" : "var(--surface)",
                borderColor: on ? "var(--clay)" : "var(--border)",
                gap: 10,
              }}
            >
              {FORMAT_NAMES[k]}
              {current.rec === k && (
                <span
                  style={{
                    fontSize: 13,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: "var(--ochre)",
                    color: "#2B2A26",
                  }}
                >
                  Recommended
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="split" ref={splitRef}>
        <div className="split-pane" style={{ flex: `0 0 ${st.split}%` }}>
          <div className="mono" style={{ marginBottom: 14 }}>
            original
          </div>
          <div className="stack" style={{ gap: 12, maxWidth: "65ch" }}>
            {current.sents.map((s) => (
              <span
                key={s.id}
                style={{
                  borderRadius: 6,
                  padding: "2px 4px",
                  transition: "background .2s",
                  fontFamily: fontStack,
                  fontSize: st.size,
                  lineHeight: st.lh,
                  background: st.hl.includes(s.id) ? "var(--hl)" : "transparent",
                }}
              >
                {s.t}
              </span>
            ))}
          </div>
        </div>

        <div
          className="split-handle"
          onMouseDown={startDrag}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the original and Addy panes"
        >
          <span
            style={{ width: 3, height: 44, borderRadius: 999, background: "var(--border)" }}
          />
        </div>

        <div className="split-pane grow" style={{ background: "var(--bg)" }}>
          <div className="mono" style={{ marginBottom: 14 }}>
            addy version · {FORMAT_NAMES[tab]}
          </div>
          {tab === "flowchart" && <Flowchart />}
          {tab === "checklist" && <Checklist />}
          {tab === "quest" && <Quest />}
        </div>
      </div>

      <div className="row wrap" style={{ gap: 12, alignItems: "flex-start" }}>
        <div
          className="card"
          style={{ flex: 1, minWidth: 300, overflow: "hidden" }}
        >
          <button
            type="button"
            className="row"
            onClick={() => patch({ fidOpen: !st.fidOpen })}
            aria-expanded={st.fidOpen}
            style={{
              width: "100%",
              textAlign: "left",
              minHeight: 56,
              padding: "14px 18px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: 17,
              gap: 12,
            }}
          >
            <Check color="var(--ok)" />
            <span style={{ flex: 1 }}>
              Fidelity check · {current.sents.length} of {current.sents.length} ideas
              covered · 0 added that weren't in the source
            </span>
            <span className="muted f15">{st.fidOpen ? "Hide" : "Show"}</span>
          </button>
          {st.fidOpen && (
            <div
              className="stack"
              style={{
                padding: "16px 18px 18px",
                gap: 10,
                borderTop: "1px solid var(--border)",
              }}
            >
              {flags.map((text) => (
                <div
                  key={text}
                  className="muted f16"
                  style={{ display: "flex", gap: 10, lineHeight: 1.55 }}
                >
                  <span style={{ flex: "0 0 15px", marginTop: 4 }}>
                    <Warn size={15} color="var(--warn)" />
                  </span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stack" style={{ minWidth: 260, gap: 8 }}>
          <button
            type="button"
            className="btn"
            style={{ minHeight: 56, fontSize: 17 }}
            onClick={() => patch({ nwOpen: !st.nwOpen })}
            aria-expanded={st.nwOpen}
          >
            This isn't working
          </button>
          {st.nwOpen && (
            <div className="card stack" style={{ padding: 10, gap: 6 }}>
              {NOT_WORKING.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => askForRemake(o)}
                  style={{
                    textAlign: "left",
                    minHeight: 48,
                    padding: "12px 14px",
                    background: "transparent",
                    border: "none",
                    borderRadius: 12,
                    color: "var(--text)",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {st.regen && (
            <div className="f16" style={{ color: "var(--sage)", padding: "4px 2px" }}>
              {st.regen}
            </div>
          )}
          {remake.busy && (
            <div className="muted f16" style={{ padding: "4px 2px" }}>
              Addy is rebuilding this…
            </div>
          )}
          {remake.error && (
            <div className="row f16" style={{ gap: 8, color: "var(--warn)" }}>
              <Warn />
              {remake.error}
            </div>
          )}
        </div>
      </div>

      {remake.text && (
        <div className="card stack pad-22" style={{ gap: 10, maxWidth: "75ch" }}>
          <div className="mono">addy's remake</div>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontFamily: fontStack,
              fontSize: st.size,
              lineHeight: st.lh,
            }}
          >
            {remake.text}
          </p>
        </div>
      )}
    </div>
  );
}
