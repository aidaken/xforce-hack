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
  // add-a-reading form
  addMode: "text",
  addText: "",
  addLink: "",
  addFile: null,
  addFolder: "Biology 101",
  addDone: "",
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
  }, [state.theme, state.rm, state.size, state.lh]);

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
      fontStack: fontStack(state.font),
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
