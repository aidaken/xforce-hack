import { useAddy } from "../state/store.jsx";

const THEMES = [
  { label: "Paper", key: "paper", sw: "#F7F1E3", fg: "#2B2A26" },
  { label: "Sage", key: "sage", sw: "#ECEFE4", fg: "#26291F" },
  { label: "Dusk", key: "dusk", sw: "#22201C", fg: "#E8E0CF" },
];

export default function ThemePicker({ minHeight = 48, fontSize = 16 }) {
  const { state, patch } = useAddy();
  return (
    <div className="row" style={{ gap: 8 }}>
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => patch({ theme: t.key })}
          aria-pressed={state.theme === t.key}
          style={{
            flex: 1,
            minHeight,
            fontSize,
            borderRadius: 12,
            cursor: "pointer",
            color: t.fg,
            background: t.sw,
            border: `2px solid ${state.theme === t.key ? "var(--clay)" : "var(--border)"}`,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
