// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Layout ───────────────────────────────────────────────────
import Layout                  from "./components/Layout";

// ── Pages  ────────────────────────────────────────────────────
import LandingPage             from "./pages/Landing/LandingPage";
import SoumissionForm          from "./pages/Proprietaire/SoumissionForm";
import Dashboard               from "./pages/Proprietaire/Dashboard";
import TechnicienPage          from "./pages/Technicien/TechnicienPage";
import AuditeurPage            from "./pages/Auditeur/AuditeurPage";
import AdminPage               from "./pages/AdminAMEE/AdminPage";
import AnalystePage            from "./pages/Analyste/AnalystePage";
import CertificatPDF           from "./components/CertificatPDF";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Sans Layout ───────────────────────────────── */}
        <Route path="/"               element={<LandingPage />} />
        <Route path="/certificat/:id" element={<CertificatPDF />} />

        {/* ── Avec navbar (Layout) ──────────────────────── */}
        <Route element={<Layout />}>
          {/* ✅ /proprietaire pointe vers SoumissionForm (correspond au Layout nav) */}
          <Route path="/proprietaire" element={<SoumissionForm />} />
          <Route path="/soumettre"    element={<SoumissionForm />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/technicien"   element={<TechnicienPage />} />
          <Route path="/auditeur"     element={<AuditeurPage />} />
          <Route path="/admin"        element={<AdminPage />} />
          <Route path="/analyste"     element={<AnalystePage />} />
          {/* ✅ /verifier — page vérification certificat avec Layout */}
          <Route path="/verifier"     element={<Dashboard />} />
        </Route>

        {/* ── Fallback ──────────────────────────────────── */}
        <Route path="*"               element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}