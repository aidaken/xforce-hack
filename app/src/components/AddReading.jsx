import { useAddy } from "../state/store.jsx";
import { FOLDER_NAMES } from "../data/readings.js";
import { ingestAsReading, openReadingPatch } from "../lib/ingestReading.js";
import {
  FILE_ACCEPT,
  INGEST_ERRORS,
} from "../lib/api.js";
import { Check, Upload, Warn } from "./Icons.jsx";

const MODES = [
  { k: "text", label: "Paste text" },
  { k: "pdf", label: "Upload a file" },
  { k: "link", label: "Paste a link" },
];

export default function AddReading() {
  const { state, patch, setReadings } = useAddy();
  const st = state;

  const ready =
    st.addMode === "pdf"
      ? !!st.addFile
      : st.addMode === "link"
        ? st.addLink.startsWith("http")
        : st.addText.trim().length > 0;

  const words = st.addText.trim() ? st.addText.trim().split(/\s+/).length : 0;
  const countLabel = words
    ? `${words} words · about ${Math.max(1, Math.round(words / 180))} min read`
    : "Nothing pasted yet.";

  const cta =
    st.addMode === "pdf"
      ? "Upload and restructure"
      : st.addMode === "link"
        ? "Fetch and restructure"
        : "Restructure this";

  async function submit() {
    if (!ready || st.addBusy) return;
    patch({ addBusy: true, addError: "", addDone: "" });
    try {
      const reading = await ingestAsReading({
        mode: st.addMode === "pdf" ? "file" : st.addMode,
        file: st.addFile,
        text: st.addText,
        url: st.addLink,
        folder: st.addFolder,
      });
      setReadings((list) => [...list, reading]);
      patch(openReadingPatch(reading));
    } catch (err) {
      patch({
        addBusy: false,
        addError:
          INGEST_ERRORS[err.code] ||
          err.message ||
          "That did not go through. Try again.",
      });
    }
  }

  return (
    <div className="card stack pad-18" style={{ gap: 16 }}>
      <div className="row wrap" style={{ gap: 10 }}>
        {MODES.map((m) => {
          const on = st.addMode === m.k;
          return (
            <button
              key={m.k}
              type="button"
              className="btn"
              aria-pressed={on}
              onClick={() => patch({ addMode: m.k, addDone: "", addError: "" })}
              style={{
                fontSize: 16,
                color: on ? "var(--clayfg)" : "var(--text)",
                background: on ? "var(--clay)" : "var(--bg)",
                borderColor: on ? "var(--clay)" : "var(--border)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {st.addMode === "text" && (
        <>
          <label className="label f15">
            Paste your reading
            <textarea
              className="textarea"
              rows="5"
              value={st.addText}
              onChange={(e) => patch({ addText: e.target.value, addDone: "" })}
              placeholder="Paste a passage here and Addy will restructure it."
              style={{ fontSize: 17, background: "var(--bg)" }}
            />
          </label>
          <div className="muted f15">{countLabel}</div>
        </>
      )}

      {st.addMode === "pdf" && (
        <>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              if (!st.dragOver) patch({ dragOver: true });
            }}
            onDragLeave={() => patch({ dragOver: false })}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer?.files?.[0];
              patch({ dragOver: false, addFile: f || st.addFile, addDone: "" });
            }}
            className="stack"
            style={{
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 160,
              padding: 24,
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "center",
              border: `2px dashed ${st.dragOver ? "var(--clay)" : "var(--border)"}`,
              background: st.dragOver ? "var(--ochre)" : "var(--bg)",
            }}
          >
            <Upload />
            <span className="f18">Drop a file here, or choose one</span>
            <span className="muted f15">PDF, Word, Google Doc or text · up to 8 MB</span>
            <input
              type="file"
              accept={FILE_ACCEPT}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) patch({ addFile: f, addDone: "" });
              }}
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                opacity: 0,
              }}
            />
          </label>
          {st.addFile && (
            <div
              className="row wrap"
              style={{
                gap: 12,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <Check size={18} color="var(--ok)" />
              <span
                className="f16"
                style={{ flex: 1, minWidth: 160, wordBreak: "break-all" }}
              >
                {st.addFile.name}
              </span>
              <button
                type="button"
                className="btn f15"
                style={{ color: "var(--text2)" }}
                onClick={() => patch({ addFile: null })}
              >
                Remove
              </button>
            </div>
          )}
        </>
      )}

      {st.addMode === "link" && (
        <>
          <label className="label f15">
            Paste a link
            <input
              className="field"
              type="url"
              value={st.addLink}
              onChange={(e) => patch({ addLink: e.target.value, addDone: "" })}
              placeholder="https:// article or public Google Doc"
              style={{ minHeight: 52, fontSize: 17 }}
            />
          </label>
          {st.addLink.length > 3 && !st.addLink.startsWith("http") && (
            <div className="row f15" style={{ gap: 8, color: "var(--warn)" }}>
              <Warn size={15} />
              That doesn't look like a web address yet. It should start with
              http.
            </div>
          )}
        </>
      )}

      <div className="row wrap" style={{ gap: 12, alignItems: "flex-end" }}>
        <label className="label f15" style={{ flex: 1, minWidth: 200 }}>
          Add to folder
          <select
            className="select"
            style={{ fontSize: 16 }}
            value={st.addFolder}
            onChange={(e) => patch({ addFolder: e.target.value })}
          >
            {FOLDER_NAMES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn-primary btn-48"
          onClick={submit}
          disabled={!ready || st.addBusy}
          style={{
            cursor: ready && !st.addBusy ? "pointer" : "not-allowed",
            opacity: ready && !st.addBusy ? 1 : 0.5,
          }}
        >
          {st.addBusy ? "Reading it…" : cta}
        </button>
        <button
          type="button"
          className="btn btn-48"
          onClick={() => patch({ addOpen: false, addDone: "", addError: "", dragOver: false })}
        >
          Cancel
        </button>
      </div>

      {st.addDone && (
        <div className="row f16" style={{ gap: 8, color: "var(--ok)" }}>
          <Check />
          {st.addDone}
        </div>
      )}
      {st.addError && (
        <div className="row f16" style={{ gap: 8, color: "var(--warn)" }}>
          <Warn />
          {st.addError}
        </div>
      )}
    </div>
  );
}
