import { useState } from "react";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Dashboard onLogout={() => setIsLoggedIn(false)} />
  );
}

export default App;
