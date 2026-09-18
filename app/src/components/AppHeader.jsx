import { useAddy } from "../state/store.jsx";
import { Logo, Search, Streak } from "./Icons.jsx";

export default function AppHeader() {
  const { state, patch } = useAddy();
  const initial = (state.name.trim() || "Sam").charAt(0).toUpperCase();

  return (
    <header className="header">
      <button
        type="button"
        onClick={() => patch({ screen: "dashboard" })}
        className="row"
        style={{
          gap: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text)",
          padding: 6,
        }}
      >
        <Logo size={30} />
        <span style={{ fontSize: 22, fontWeight: 600 }}>Addy</span>
      </button>

      <label
        className="row muted"
        style={{
          flex: 1,
          maxWidth: 420,
          gap: 10,
          minHeight: 44,
          padding: "0 14px",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <Search />
        <input
          placeholder="Search readings"
          value={state.search || ""}
          onChange={(e) => patch({ search: e.target.value })}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 16,
            color: "var(--text)",
          }}
        />
      </label>

      <div className="pill" style={{ marginLeft: "auto" }}>
        <Streak />
        <span>12 day streak</span>
      </div>

      <button
        type="button"
        onClick={() => patch({ screen: "profile" })}
        aria-label="Your profile"
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: "var(--sage)",
          color: "var(--surface)",
          border: "none",
          fontSize: 17,
          cursor: "pointer",
        }}
      >
        {initial}
      </button>
    </header>
  );
}
