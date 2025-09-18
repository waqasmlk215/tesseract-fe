import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MissionsPage from "./pages/MissionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/missions" element={<MissionsPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;