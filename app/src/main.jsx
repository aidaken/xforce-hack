import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AddyProvider } from "./state/store.jsx";
import "./styles.css";

// The design exposed startScreen / theme / buddyMode as authoring props; keep
// them as query overrides so the demo can deep-link to any screen.
const params = new URLSearchParams(window.location.search);
const allowed = ["login", "onboarding", "dashboard", "folder", "reading", "focus", "profile"];
const startScreen = allowed.includes(params.get("screen")) ? params.get("screen") : "login";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AddyProvider
      startScreen={startScreen}
      theme={params.get("theme") || "paper"}
      buddyMode={params.get("buddy") || "Calm"}
    >
      <App />
    </AddyProvider>
  </StrictMode>,
);
