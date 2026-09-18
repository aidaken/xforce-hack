import { useState } from "react";
import { useAddy } from "../state/store.jsx";
import { FILE_ACCEPT, INGEST_ERRORS } from "../lib/api.js";
import { ingestAsReading, openReadingPatch } from "../lib/ingestReading.js";
import { Upload, Warn } from "./Icons.jsx";

/**
 * Dashboard ingest card — sits between Quick settings and the continue-reading
 * card. Drop a file, paste text, or paste a public URL; ADDY ingests it and
 * opens the reading workspace.
 */
export default function IngestDrop() {
  const { state, patch, setReadings } = useAddy();
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = !!file || text.trim().length > 0 || url.startsWith("http");

  async function run(next = {}) {
    const useFile = next.file !== undefined ? next.file : file;
    const useText = next.text !== undefined ? next.text : text;
    const useUrl = next.url !== undefined ? next.url : url;
    const mode = useFile ? "file" : useUrl.startsWith("http") ? "link" : "text";
    if (mode === "file" && !useFile) return;
    if (mode === "link" && !useUrl.startsWith("http")) return;
    if (mode === "text" && !useText.trim()) return;
    if (busy) return;

    setBusy(true);
    setError("");
    try {
      const reading = await ingestAsReading({
        mode,
        file: useFile,
        text: useText,
        url: useUrl,
        folder: state.addFolder || "Biology 101",
      });
      setReadings((list) => [...list, reading]);
      setFile(null);
      setText("");
      setUrl("");
      setBusy(false);
      patch(openReadingPatch(reading));
    } catch (err) {
      setBusy(false);
      setError(
        INGEST_ERRORS[err.code] ||
          err.message ||
          "That did not go through. Try again.",
      );
    }
  }

  function takeFile(f) {
    if (!f) return;
    setFile(f);
    setError("");
    run({ file: f, text: "", url: "" });
  }

  return (
    <section className="card card-lift stack pad-28" style={{ gap: 16 }}>
      <div className="stack" style={{ gap: 6 }}>
        <div style={{ fontSize: 22, fontWeight: 500 }}>Drop a file or content</div>
        <div className="muted f16">
          This is where Addy starts. Drop a PDF, Word doc, or Google Doc, paste
          a passage, or add a public link — then it restructures the reading.
        </div>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          takeFile(e.dataTransfer?.files?.[0]);
        }}
        className="stack"
        style={{
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 132,
          padding: 22,
          borderRadius: 14,
          cursor: busy ? "wait" : "pointer",
          textAlign: "center",
          border: `2px dashed ${dragOver ? "var(--clay)" : "var(--border)"}`,
          background: dragOver ? "var(--ochre)" : "var(--bg)",
        }}
      >
        <Upload />
        <span className="f18">
          {busy ? "Reading it…" : file ? file.name : "Drop a file here, or click to choose"}
        </span>
        <span className="muted f15">PDF, Word, Google Doc, or text · up to 8 MB</span>
        <input
          type="file"
          accept={FILE_ACCEPT}
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            takeFile(f);
          }}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
        />
      </label>

      <textarea
        className="textarea"
        rows="3"
        value={text}
        disabled={busy}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or paste a textbook paragraph…"
        style={{ fontSize: 16, background: "var(--bg)" }}
      />

      <div className="row wrap" style={{ gap: 10, alignItems: "stretch" }}>
        <input
          className="field"
          type="url"
          value={url}
          disabled={busy}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https:// article or public Google Doc"
          style={{ flex: 1, minWidth: 200, minHeight: 48, fontSize: 16 }}
        />
        <button
          type="button"
          className="btn btn-primary btn-48"
          onClick={() => run()}
          disabled={!ready || busy}
          style={{
            cursor: ready && !busy ? "pointer" : "not-allowed",
            opacity: ready && !busy ? 1 : 0.5,
          }}
        >
          {busy ? "Reading it…" : "Restructure this"}
        </button>
      </div>

      {error && (
        <div className="row f16" style={{ gap: 8, color: "var(--warn)" }}>
          <Warn />
          {error}
        </div>
      )}
    </section>
  );
}
