import { useAddy } from "./state/store.jsx";
import AppHeader from "./components/AppHeader.jsx";
import StudyPlay from "./components/StudyPlay.jsx";
import StudyBuddy from "./components/StudyBuddy.jsx";
import Login from "./screens/Login.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Folder from "./screens/Folder.jsx";
import Reading from "./screens/Reading.jsx";
import Profile from "./screens/Profile.jsx";
import Focus from "./screens/Focus.jsx";

const IN_SHELL = ["dashboard", "folder", "reading", "profile"];

export default function App() {
  const { state, tab } = useAddy();
  const { screen } = state;

  return (
    <div className="addy">
      {screen === "login" && <Login />}
      {screen === "onboarding" && <Onboarding />}

      {IN_SHELL.includes(screen) && (
        <>
          <AppHeader />
          {screen === "dashboard" && <Dashboard />}
          {screen === "folder" && <Folder />}
          {screen === "reading" && <Reading />}
          {screen === "profile" && <Profile />}
        </>
      )}

      {screen === "focus" && <Focus />}
      <StudyPlay active={screen === "reading" && tab === "guided"} />
      {screen !== "login" && screen !== "onboarding" && <StudyBuddy />}
    </div>
  );
}
