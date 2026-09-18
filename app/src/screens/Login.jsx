import { useAddy } from "../state/store.jsx";
import { Logo } from "../components/Icons.jsx";

export default function Login() {
  const { patch } = useAddy();
  const startOnboarding = () => patch({ screen: "onboarding", step: 0 });

  return (
    <div className="center-page">
      <div
        className="stack"
        style={{ width: "100%", maxWidth: 430, gap: 26 }}
      >
        <div className="stack" style={{ alignItems: "center", gap: 14 }}>
          <Logo size={168} />
          <div
            className="muted pretty"
            style={{ fontSize: 18, textAlign: "center", maxWidth: "32ch" }}
          >
            Readings, rearranged into shapes your brain likes better.
          </div>
        </div>

        <form
          className="card card-lift stack pad-28"
          style={{ gap: 18 }}
          onSubmit={(e) => {
            e.preventDefault();
            startOnboarding();
          }}
        >
          <label className="label">
            Email
            <input
              className="field"
              type="email"
              defaultValue="sam@school.edu"
              autoComplete="username"
            />
          </label>
          <label className="label">
            Password
            <input
              className="field"
              type="password"
              defaultValue="demo"
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-52">
            Log in
          </button>
          <div
            className="row muted"
            style={{ justifyContent: "center", gap: 6, fontSize: 16 }}
          >
            <span>New here?</span>
            <a
              href="#create"
              onClick={(e) => {
                e.preventDefault();
                startOnboarding();
              }}
            >
              Create an account
            </a>
          </div>
        </form>

        <button
          type="button"
          className="btn-plain"
          onClick={() => patch({ screen: "dashboard" })}
          style={{
            alignSelf: "center",
            fontSize: 15,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            minHeight: 44,
          }}
        >
          Skip to the dashboard (demo)
        </button>
      </div>
    </div>
  );
}
