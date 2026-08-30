import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ScanProject from "./pages/ScanProject";
import Inventory from "./pages/Inventory";
import ArtifactDetail from "./pages/ArtifactDetail";
import RiskAnalysis from "./pages/RiskAnalysis";
import PQCReadiness from "./pages/PQCReadiness";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function applyThemeFromSettings() {
  try {
    const raw = localStorage.getItem("cryptai-settings");
    const settings = raw ? JSON.parse(raw) : null;
    const darkMode = settings?.general?.darkMode ?? true;
    document.body.classList.toggle("theme-light", !darkMode);
    document.body.classList.toggle("theme-dark", darkMode);
  } catch {
    document.body.classList.add("theme-dark");
    document.body.classList.remove("theme-light");
  }
}

export default function App() {
  useEffect(() => {
    applyThemeFromSettings();

    const handleStorage = () => applyThemeFromSettings();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan" element={<ScanProject />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/:id" element={<ArtifactDetail />} />
        <Route path="/risks" element={<RiskAnalysis />} />
        <Route path="/pqc" element={<PQCReadiness />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
