import { useAddy } from "../state/store.jsx";
import { Check, FlowArrow, Warn } from "./Icons.jsx";
import Plant from "./Plant.jsx";

/** Shared per-step view model: hover cross-highlights the source sentences. */
function useStepVMs() {
  const { state, patch, current } = useAddy();
  return current.steps.map((s, i) => {
    const on = s.s.some((id) => state.hl.includes(id));
    const checked = !!state.checks[current.id + i];
    return {
      key: `${current.id}-${i}`,
      n: i + 1,
      t: s.t,
      b: s.b,
      arrow: i < current.steps.length - 1,
      borderColor: on ? "var(--clay)" : "var(--border)",
      boxShadow: on ? "0 6px 20px rgba(43,42,38,.10)" : "none",
      enter: () => patch({ hl: s.s }),
      leave: () => patch({ hl: [] }),
      check: () =>
        patch((st) => ({
          checks: { ...st.checks, [current.id + i]: !checked },
          hl: s.s,
        })),
      checked,
    };
  });
}

export function Flowchart() {
  const steps = useStepVMs();
  return (
    <div className="stack" style={{ alignItems: "stretch", maxWidth: 520 }}>
      {steps.map((s) => (
        <div key={s.key} className="stack" style={{ alignItems: "center" }}>
          <div
            onMouseEnter={s.enter}
            onMouseLeave={s.leave}
            onClick={s.enter}
            style={{
              width: "100%",
              background: "var(--surface)",
              borderRadius: 12,
              padding: "18px 20px",
              cursor: "pointer",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              transition: "box-shadow .2s",
              border: `1.5px solid ${s.borderColor}`,
              boxShadow: s.boxShadow,
            }}
          >
            <span
              style={{
                flex: "0 0 30px",
                height: 30,
                borderRadius: 999,
                background: "var(--soft)",
                color: "var(--text)",
                display: "grid",
                placeItems: "center",
                fontSize: 15,
              }}
            >
              {s.n}
            </span>
            <span className="stack" style={{ gap: 6 }}>
              <span style={{ fontSize: 19 }}>{s.t}</span>
              <span className="muted f16" style={{ lineHeight: 1.55 }}>
                {s.b}
              </span>
            </span>
          </div>
          {s.arrow && <FlowArrow />}
        </div>
      ))}
    </div>
  );
}

export function Checklist() {
  const steps = useStepVMs();
  const done = steps.filter((s) => s.checked).length;
  return (
    <div className="stack" style={{ gap: 10, maxWidth: 560 }}>
      {steps.map((s) => (
        <div
          key={s.key}
          onMouseEnter={s.enter}
          onMouseLeave={s.leave}
          onClick={s.check}
          role="checkbox"
          aria-checked={s.checked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              s.check();
            }
          }}
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            background: "var(--surface)",
            borderRadius: 12,
            padding: "16px 18px",
            cursor: "pointer",
            border: `1.5px solid ${s.borderColor}`,
          }}
        >
          <span
            style={{
              flex: "0 0 26px",
              height: 26,
              borderRadius: 7,
              display: "grid",
              placeItems: "center",
              border: "1.5px solid var(--border)",
              background: s.checked ? "var(--ok)" : "transparent",
            }}
          >
            {s.checked && <Check size={15} color="var(--surface)" />}
          </span>
          <span className="stack" style={{ gap: 5 }}>
            <span
              className="f18"
              style={{ color: s.checked ? "var(--text2)" : "var(--text)" }}
            >
              {s.t}
            </span>
            <span className="muted f16" style={{ lineHeight: 1.55 }}>
              {s.b}
            </span>
          </span>
        </div>
      ))}
      <div className="muted f16" style={{ paddingTop: 6 }}>
        {done} of {steps.length} checked off
      </div>
    </div>
  );
}

export function Quest() {
  const { state, patch, current } = useAddy();
  const st = state;
  const steps = current.steps;
  const idx = Math.min(st.quest, steps.length - 1);
  const qs = steps[idx];
  // Ingested passages have no generated quiz; those read as plain beats.
  const hasQuiz = Array.isArray(qs.o) && qs.o.length > 0;
  const right = hasQuiz && st.pick !== null && st.pick === qs.a;
  const wrong = hasQuiz && st.pick !== null && st.pick !== qs.a;
  const lastStep = st.quest + 1 >= steps.length;

  const advance = () =>
    patch((s) => {
      if (s.quest + 1 >= steps.length) {
        const has = s.garden.some((g) => g.id === current.id);
        return {
          questDone: true,
          pick: null,
          garden: has
            ? s.garden
            : s.garden.concat([
                { id: current.id, title: current.title, folder: current.folder },
              ]),
        };
      }
      return { quest: s.quest + 1, pick: null, hl: [] };
    });

  return (
    <div className="stack" style={{ gap: 18, maxWidth: 560 }}>
      <div className="stack" style={{ gap: 8 }}>
        <div className="row muted f15" style={{ justifyContent: "space-between" }}>
          <span>
            Step {Math.min(st.quest + 1, steps.length)} of {steps.length}
          </span>
          <span>
            {st.leaves === 1 ? "1 leaf earned" : `${st.leaves} leaves earned`}
          </span>
        </div>
        <div className="bar">
          <div
            className="bar-fill"
            style={{ width: `${Math.round((st.quest / steps.length) * 100)}%` }}
          />
        </div>
      </div>

      {!st.questDone && (
        <div
          className="card stack pad-22 anim-fade-up"
          style={{ gap: 14, borderWidth: 1.5 }}
        >
          <div style={{ fontSize: 22 }}>{qs.t}</div>
          <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
            {qs.b}
          </p>
          <div style={{ height: 1, background: "var(--border)" }} />

          {hasQuiz ? (
            <>
              <div className="f17">{qs.q}</div>
              <div className="stack" style={{ gap: 8 }}>
                {qs.o.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      patch((s) => ({
                        pick: i,
                        hl: qs.s,
                        leaves:
                          i === qs.a && s.pick !== qs.a ? s.leaves + 1 : s.leaves,
                      }))
                    }
                    style={{
                      textAlign: "left",
                      minHeight: 48,
                      padding: "12px 16px",
                      fontSize: 17,
                      borderRadius: 12,
                      cursor: "pointer",
                      color: "var(--text)",
                      background:
                        st.pick === i && i === qs.a
                          ? "var(--ochre)"
                          : "var(--surface)",
                      border: `1.5px solid ${
                        st.pick === i
                          ? i === qs.a
                            ? "var(--ok)"
                            : "var(--warn)"
                          : "var(--border)"
                      }`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {right && (
                <div className="row wrap" style={{ gap: 12 }}>
                  <span
                    className="row f17"
                    style={{ gap: 8, color: "var(--ok)" }}
                  >
                    <Check />
                    That's it.
                  </span>
                  <button type="button" className="btn btn-primary btn-48" onClick={advance}>
                    {lastStep ? "Finish reading" : "Next step"}
                  </button>
                </div>
              )}
              {wrong && (
                <div className="row f17" style={{ gap: 8, color: "var(--warn-text)" }}>
                  <Warn />
                  Not quite — the answer is in the step above. Try again.
                </div>
              )}
            </>
          ) : (
            <button type="button" className="btn btn-primary btn-48" onClick={advance}>
              {lastStep ? "Finish reading" : "Next step"}
            </button>
          )}
        </div>
      )}

      {st.questDone && (
        <div
          className="card stack pad-28"
          style={{ gap: 14, alignItems: "flex-start", border: "1.5px solid var(--sage)" }}
        >
          <div style={{ fontSize: 24 }}>Reading finished.</div>
          <p className="muted" style={{ margin: 0, fontSize: 17 }}>
            Your plant went into the Garden.{" "}
            {st.leaves === 1
              ? "That's 1 leaf from this one."
              : `That's ${st.leaves} leaves from this one.`}
          </p>
          <button
            type="button"
            className="btn btn-sage btn-48"
            onClick={() => patch({ screen: "profile" })}
          >
            See my garden
          </button>
        </div>
      )}

      <div className="row" style={{ justifyContent: "center", padding: "10px 0" }}>
        <Plant leaves={st.leaves} bloomed={st.leaves >= steps.length} />
      </div>
    </div>
  );
}
