import { useAddy } from "../state/store.jsx";
import { FOLDER_NAMES } from "../data/readings.js";
import {
  ingestAsReading,
  openReadingPatch,
  SERVER_UPLOAD_MAX,
} from "../lib/ingestReading.js";
import { INGEST_ERRORS } from "../lib/api.js";
import {
  extractPdfText,
  isPdfFile,
  PDF_MAX_BYTES,
} from "../lib/pdfText.js";
import { Check, Lines, Link, Upload, Warn } from "./Icons.jsx";

const MODES = [
  { k: "text", label: "Paste text", Icon: Lines },
  { k: "pdf", label: "Upload a PDF", Icon: Upload },
  { k: "link", label: "Paste a link", Icon: Link },
];

const CTA = {
  text: "Restructure this",
  pdf: "Upload and restructure",
  link: "Fetch and restructure",
};

/** What the processing state says it is doing, in order. */
const STAGES = [
  ["extract", "Reading the text"],
  ["plan", "Choosing a format"],
  ["check", "Checking nothing was lost"],
];

const WPM = 180;
const MB = (bytes) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

function wordStats(text) {
  const words = String(text || "").trim() ? text.trim().split(/\s+/).length : 0;
  return { words, mins: Math.max(1, Math.round(words / WPM)) };
}

/** Amber, an icon and words — never red, and never colour on its own. */
function Note({ tone = "warn", children }) {
  return (
    <div className={`note note-${tone}`} role={tone === "warn" ? "alert" : undefined}>
      <span className="note-icon">
        {tone === "warn" ? (
          <Warn size={18} color="var(--warn-text)" />
        ) : (
          <Check size={18} color="var(--ok)" />
        )}
      </span>
      <span>{children}</span>
    </div>
  );
}

/**
 * "Add a reading" — the inline panel under the My folders heading.
 *
 * Not a modal on purpose: a dialog that blanks the page and traps focus is
 * disorienting, so this opens in place and leaves the dashboard visible.
 *
 * Each mode keeps its own slot in the store, so switching between paste /
 * upload / link never throws away what is already typed, and closing the
 * panel keeps the draft too.
 */
export default function AddReading() {
  const { state: st, patch, setReadings } = useAddy();

  const pdfReady = !!st.addPdf && !st.addPdf.scanned && !!st.addPdf.text;
  const ready =
    st.addMode === "pdf"
      ? pdfReady
      : st.addMode === "link"
        ? /^https?:\/\//i.test(st.addLink.trim())
        : st.addText.trim().length > 0;

  const linkTyped = st.addLink.trim().length > 0;
  const linkLooksWrong = linkTyped && !/^http/i.test(st.addLink.trim());
  const busy = st.addBusy || st.addPdfBusy;
  const canSubmit = ready && !busy;

  const typed = wordStats(st.addText);
  const pdfStats = wordStats(st.addPdf?.text);

  function reset(extra = {}) {
    patch({ addError: "", addStage: "", ...extra });
  }

  /* ---------- PDF: read the text layer here, in the browser ---------- */

  async function takeFile(file) {
    if (!file) return;
    if (!isPdfFile(file)) {
      patch({
        addFile: null,
        addPdf: null,
        addError:
          "This box takes PDFs. For a Word or Google Doc, paste a link to it, " +
          "or copy the text into “Paste text”.",
      });
      return;
    }
    if (file.size > PDF_MAX_BYTES) {
      patch({
        addFile: null,
        addPdf: null,
        addError: `That PDF is ${MB(file.size)} MB. The limit is 40 MB.`,
      });
      return;
    }

    patch({ addFile: file, addPdf: null, addPdfBusy: true, addError: "", addStage: "" });
    try {
      const pdf = await extractPdfText(file);
      patch({ addPdf: pdf, addPdfBusy: false });
    } catch (err) {
      patch({
        addPdfBusy: false,
        addPdf: null,
        addError:
          INGEST_ERRORS[err.code] || "That PDF could not be opened. Try another file.",
      });
    }
  }

  /* ---------- submit ---------- */

  async function submit(mode = st.addMode) {
    if (busy) return;
    patch({ addBusy: true, addError: "", addStage: "extract" });
    try {
      const reading = await ingestAsReading({
        mode,
        file: st.addFile,
        pdf: st.addPdf,
        text: st.addText,
        url: st.addLink,
        folder: st.addFolder,
        onStage: (addStage) => patch({ addStage }),
      });
      setReadings((list) => [...list, reading]);
      patch(openReadingPatch(reading));
    } catch (err) {
      patch({
        addBusy: false,
        addStage: "",
        addError:
          INGEST_ERRORS[err.code] ||
          err.message ||
          "That did not go through. Try again.",
      });
    }
  }

  /* ---------- processing ---------- */

  if (st.addBusy) {
    const at = STAGES.findIndex(([k]) => k === st.addStage);
    return (
      <section className="panel" aria-label="Adding your reading" aria-busy="true">
        <div style={{ fontSize: 19 }}>Addy is working on it</div>
        <ul className="stack" style={{ gap: 12, margin: 0, padding: 0, listStyle: "none" }}>
          {STAGES.map(([key, label], i) => {
            const done = at > i;
            const now = at === i;
            return (
              <li key={key} className="row f18" style={{ gap: 12 }}>
                <span style={{ flex: "0 0 18px" }}>
                  {done ? (
                    <Check size={18} color="var(--ok)" />
                  ) : (
                    <span
                      style={{
                        display: "block",
                        width: 10,
                        height: 10,
                        marginLeft: 4,
                        borderRadius: 999,
                        background: now ? "var(--clay)" : "var(--border)",
                      }}
                    />
                  )}
                </span>
                <span className={now || done ? "" : "muted"}>{label}</span>
              </li>
            );
          })}
        </ul>
        <div className="muted f16">
          This stays on your screen — nothing opens until it is finished.
        </div>
      </section>
    );
  }

  /* ---------- the form ---------- */

  return (
    <section className="panel" aria-label="Add a reading">
      <div className="seg" role="group" aria-label="Where the reading comes from">
        {MODES.map(({ k, label, Icon }) => (
          <button
            key={k}
            type="button"
            className="seg-btn"
            aria-pressed={st.addMode === k}
            onClick={() => reset({ addMode: k, dragOver: false })}
          >
            <Icon size={17} color="currentColor" />
            {label}
          </button>
        ))}
      </div>

      {st.addMode === "text" && (
        <div className="stack" style={{ gap: 10 }}>
          <label className="label f16" htmlFor="add-text">
            Paste your reading
          </label>
          <textarea
            id="add-text"
            className="textarea"
            rows="7"
            value={st.addText}
            onChange={(e) => reset({ addText: e.target.value })}
            placeholder="Paste a passage here and Addy will restructure it."
            style={{ fontSize: 18, lineHeight: 1.55, background: "var(--bg)" }}
          />
          <div className="muted f16" aria-live="polite">
            {typed.words
              ? `${typed.words.toLocaleString()} words · about ${typed.mins} min to read`
              : "Nothing pasted yet."}
          </div>
        </div>
      )}

      {st.addMode === "pdf" && (
        <div className="stack" style={{ gap: 12 }}>
          <label
            className={`drop${st.dragOver ? " over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!st.dragOver) patch({ dragOver: true });
            }}
            onDragLeave={() => patch({ dragOver: false })}
            onDrop={(e) => {
              e.preventDefault();
              patch({ dragOver: false });
              takeFile(e.dataTransfer?.files?.[0]);
            }}
          >
            <Upload size={34} />
            <span className="stack" style={{ gap: 6 }}>
              <span className="f18">Drop a PDF here, or choose a file</span>
              <span className="muted f16">PDF only · up to 40 MB</span>
              <span className="muted f16">
                The file stays on your computer. Addy reads the text out of it
                here and only sends the words.
              </span>
            </span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                takeFile(f);
              }}
            />
          </label>

          {st.addPdfBusy && (
            <div className="muted f18" aria-live="polite">
              Reading the pages…
            </div>
          )}

          {st.addFile && !st.addPdfBusy && (
            <div
              className="row wrap"
              style={{
                gap: 12,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <Check size={18} color="var(--ok)" />
              <span className="stack" style={{ flex: 1, minWidth: 180, gap: 4 }}>
                <span className="f18" style={{ wordBreak: "break-word" }}>
                  {st.addFile.name}
                </span>
                {st.addPdf && !st.addPdf.scanned && (
                  <span className="muted f16">
                    {st.addPdf.pages} {st.addPdf.pages === 1 ? "page" : "pages"} ·{" "}
                    {pdfStats.words.toLocaleString()} words · about {pdfStats.mins} min
                    to read
                  </span>
                )}
              </span>
              <button
                type="button"
                className="btn f16"
                onClick={() => reset({ addFile: null, addPdf: null })}
              >
                Remove
              </button>
            </div>
          )}

          {st.addPdf?.scanned && (
            <Note>
              <div className="stack" style={{ gap: 12 }}>
                <span>
                  This PDF is pictures of pages, not text, so there is nothing
                  for Addy to read out of it. Copying the passage into “Paste
                  text” is the quickest way through.
                </span>
                <div className="row wrap" style={{ gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-48"
                    onClick={() => reset({ addMode: "text" })}
                  >
                    <Lines size={17} />
                    Switch to paste text
                  </button>
                  {st.addFile?.size <= SERVER_UPLOAD_MAX && (
                    <button
                      type="button"
                      className="btn btn-48"
                      onClick={() => submit("pdfOcr")}
                    >
                      <Upload size={17} color="currentColor" />
                      Let Addy try to read the pictures
                    </button>
                  )}
                </div>
              </div>
            </Note>
          )}

          {st.addPdf?.truncated && !st.addPdf.scanned && (
            <Note>
              This PDF has {st.addPdf.totalPages} pages. Addy read the first{" "}
              {st.addPdf.pages} — that is about as much as one sitting holds.
            </Note>
          )}
        </div>
      )}

      {st.addMode === "link" && (
        <div className="stack" style={{ gap: 10 }}>
          <label className="label f16" htmlFor="add-link">
            Paste a link
          </label>
          <input
            id="add-link"
            className="field"
            type="url"
            value={st.addLink}
            onChange={(e) => reset({ addLink: e.target.value })}
            placeholder="https://… an article or a public Google Doc"
            style={{ minHeight: 52, fontSize: 18 }}
          />
          {linkLooksWrong ? (
            <Note>That doesn't look like a web address yet. It starts with http.</Note>
          ) : (
            <div className="muted f16">
              A Google Doc has to be shared as “Anyone with the link” for Addy to
              open it.
            </div>
          )}
        </div>
      )}

      {st.addError && <Note>{st.addError}</Note>}

      <div
        className="row wrap"
        style={{ gap: 12, alignItems: "flex-end", justifyContent: "space-between" }}
      >
        <label className="label f16" style={{ flex: 1, minWidth: 220 }}>
          Add to folder
          <select
            className="select"
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
        <div className="row wrap" style={{ gap: 12 }}>
          <button
            type="button"
            className="btn btn-48"
            onClick={() => patch({ addOpen: false, dragOver: false, addError: "" })}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-48"
            onClick={() => submit()}
            disabled={!canSubmit}
            style={{
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {CTA[st.addMode]}
          </button>
        </div>
      </div>
    </section>
  );
}
