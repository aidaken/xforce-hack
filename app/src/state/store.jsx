import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SEED_READINGS } from "../data/readings.js";

const AddyContext = createContext(null);

/** Demo timer speed: the source design ran the focus timer at 2 ticks per
 *  simulated minute so a 25-minute session finishes in ~50s on stage. */
const TICKS_PER_MIN = 2;
const ALOUD_MS_PER_WORD = 300;

const initialState = {
  screen: "login",
  step: 0,
  // onboarding answers
  name: "",
  reason: "",
  struggles: [],
  prefs: [],
  focusMin: 25,
  sound: "Lo-fi",
  buddy: "Calm",
  notes: "",
  // appearance
  theme: "paper",
  font: "Lexend",
  // set once the student picks a font by hand, so the dyslexia default
  // never overrides a choice they made themselves
  fontTouched: false,
  size: 18,
  lh: 1.6,
  rm: false,
  // ambient sound
  playing: false,
  vol: 40,
  // navigation + reading
  folder: "Biology 101",
  reading: "bio1",
  tab: null,
  hl: [],
  checks: {},
  // quest
  quest: 0,
  pick: null,
  leaves: 0,
  questDone: false,
  // panels
  fidOpen: false,
  whyOpen: false,
  nwOpen: false,
  regen: "",
  addOpen: false,
  split: 52,
  monthOffset: 0,
  // add-a-reading panel (Dashboard → "Add a reading")
  addMode: "text",
  addText: "",
  addLink: "",
  addFile: null,
  // client-side PDF extraction result: { text, pages, totalPages, scanned, truncated }
  addPdf: null,
  addPdfBusy: false,
  addFolder: "Biology 101",
  addStage: "",
  addError: "",
  addBusy: false,
  dragOver: false,
  // focus mode
  focusSent: 0,
  aloud: false,
  word: -1,
  speed: 1,
  timerPct: 0,
  timerRunning: false,
  onBreak: false,
  visited: false,
  returning: false,
  garden: [{ id: "seed", title: "Photosynthesis basics", folder: "Biology 101" }],
};

export function AddyProvider({ children, startScreen, theme, buddyMode }) {
  const [readings, setReadings] = useState(SEED_READINGS);
  const [state, setState] = useState(() => ({
    ...initialState,
    screen: startScreen || initialState.screen,
    theme: theme || initialState.theme,
    buddy: buddyMode || initialState.buddy,
  }));

  /** setState-with-a-partial, matching the shape the design's logic used. */
  const patch = useCallback((next) => {
    setState((s) => ({ ...s, ...(typeof next === "function" ? next(s) : next) }));
  }, []);

  const current =
    readings.find((r) => r.id === state.reading) || readings[0];

  // --- theme + typography, applied to <html> like the original apply() ---
  useEffect(() => {
    const el = document.documentElement;
    el.className = `theme-${state.theme}${state.rm ? " rm" : ""}`;
    el.style.setProperty("--fs", `${state.size}px`);
    el.style.setProperty("--lh", String(state.lh));
    el.style.setProperty("--font", fontStack(state.font));
    el.style.fontFamily = fontStack(state.font);
  }, [state.theme, state.rm, state.size, state.lh, state.font]);

  // --- focus timer ---
  useEffect(() => {
    if (!state.timerRunning) return undefined;
    const per = 100 / (state.focusMin * TICKS_PER_MIN);
    const id = setInterval(() => {
      setState((s) => {
        const pct = s.timerPct + per;
        if (pct >= 100) {
          return { ...s, timerPct: 100, onBreak: true, timerRunning: false };
        }
        return { ...s, timerPct: pct };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state.timerRunning, state.focusMin]);

  // --- read-aloud word highlighter ---
  const sentences = current.sents;
  useEffect(() => {
    if (!state.aloud) return undefined;
    const id = setInterval(() => {
      setState((s) => {
        const line = sentences[s.focusSent];
        if (!line) return { ...s, aloud: false, word: -1 };
        const words = line.t.split(" ");
        if (s.word + 1 >= words.length) {
          if (s.focusSent + 1 >= sentences.length) {
            return { ...s, aloud: false, word: -1 };
          }
          return { ...s, focusSent: s.focusSent + 1, word: 0 };
        }
        return { ...s, word: s.word + 1 };
      });
    }, ALOUD_MS_PER_WORD / state.speed);
    return () => clearInterval(id);
  }, [state.aloud, state.speed, sentences]);

  // --- draggable split handle ---
  const splitRef = useRef(null);
  const dragging = useRef(false);
  const startDrag = useCallback(() => {
    dragging.current = true;
  }, []);
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !splitRef.current) return;
      const r = splitRef.current.getBoundingClientRect();
      const pct = Math.min(
        75,
        Math.max(25, ((e.clientX - r.left) / r.width) * 100),
      );
      patch({ split: pct });
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [patch]);

  const value = useMemo(
    () => ({
      state,
      patch,
      readings,
      setReadings,
      current,
      tab: state.tab || current.rec,
      splitRef,
      startDrag,
      font: effectiveFont(state),
      fontStack: fontStack(effectiveFont(state)),
      // selection helpers, straight from the design
      sel: (on) => ({
        background: on ? "var(--ochre)" : "var(--surface)",
        borderColor: on ? "var(--clay)" : "var(--border)",
      }),
      toggleIn: (key, label) =>
        patch((s) => {
          const arr = s[key];
          return {
            [key]: arr.includes(label)
              ? arr.filter((x) => x !== label)
              : arr.concat([label]),
          };
        }),
      go: (screen) => patch({ screen }),
    }),
    [state, patch, readings, current, startDrag],
  );

  return <AddyContext.Provider value={value}>{children}</AddyContext.Provider>;
}

export function useAddy() {
  const ctx = useContext(AddyContext);
  if (!ctx) throw new Error("useAddy must be used inside <AddyProvider>");
  return ctx;
}

/**
 * Does this profile read as dyslexic? "Both" counts — someone with ADHD and
 * dyslexia still has the decoding load. Falls back to the struggle answers
 * for students who skip the question or would rather not say.
 */
export function isDyslexicProfile(reason, struggles = []) {
  const r = String(reason || "").toLowerCase();
  if (r === "dyslexia" || r === "both") return true;
  if (r === "adhd") return false;
  return struggles.some((s) => /blur|swap|lose my place|re-read/i.test(s));
}

/** The font actually in force: OpenDyslexic for a dyslexic profile, unless
 *  the student has chosen one themselves. */
export function effectiveFont(state) {
  if (state.fontTouched) return state.font;
  return isDyslexicProfile(state.reason, state.struggles)
    ? "OpenDyslexic"
    : state.font;
}

export function fontStack(font) {
  if (font === "Georgia") return "Georgia, serif";
  if (font === "OpenDyslexic")
    return "OpenDyslexic, 'Atkinson Hyperlegible', Verdana, sans-serif";
  if (font === "Atkinson Hyperlegible")
    return "'Atkinson Hyperlegible', Verdana, sans-serif";
  if (font === "Verdana") return "Verdana, sans-serif";
  if (font === "Arial") return "Arial, Helvetica, sans-serif";
  return "Lexend, 'Atkinson Hyperlegible', Verdana, sans-serif";
}

export const FONT_OPTIONS = [
  "Lexend",
  "Atkinson Hyperlegible",
  "OpenDyslexic",
  "Verdana",
  "Arial",
  "Georgia",
];
