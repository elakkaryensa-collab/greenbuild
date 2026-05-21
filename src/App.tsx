// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/Layout"
import LandingPage    from "./pages/Landing/LandingPage"
import SoumissionForm from "./pages/Proprietaire/SoumissionForm"
import Dashboard      from "./pages/Proprietaire/Dashboard"
import TechnicienPage from "./pages/Technicien/TechnicienPage"
import AuditeurPage   from "./pages/Auditeur/AuditeurPage"
import AdminPage      from "./pages/AdminAMEE/AdminPage"
import AnalystePage   from "./pages/Analyste/AnalystePage"
import CertificatPDF  from "./components/CertificatPDF"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<LandingPage />} />
          <Route path="/certificat/:id" element={<CertificatPDF />} />

          <Route element={<Layout />}>
            <Route path="/proprietaire" element={<SoumissionForm />} />
            <Route path="/soumettre"    element={<SoumissionForm />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/technicien"   element={<TechnicienPage />} />
            <Route path="/auditeur"     element={<AuditeurPage />} />
            <Route path="/admin"        element={<AdminPage />} />
            <Route path="/analyste"     element={<AnalystePage />} />
            <Route path="/verifier"     element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}