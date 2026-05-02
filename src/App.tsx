// ═══════════════════════════════════════════════════════════════════
// src/App.tsx — GreenBuild v3.0
// Architecture : BrowserRouter + Routes + Layout protégé
// Style : Dashboard professionnel sombre
// ═══════════════════════════════════════════════════════════════════

import { useState, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// ─── Pages actives ──────────────────────────────────────────────────
import LandingPage    from "./pages/Landing/LandingPage";
import TechnicienPage from "./pages/Technicien/TechnicienPage";
import AuditeurPage   from "./pages/Auditeur/AuditeurPage";
import AdminPage      from "./pages/AdminAMEE/AdminPage";

// ─── Pages pas encore codées (décommente quand elles sont prêtes) ───
// import SoumissionForm from "./pages/Proprietaire/SoumissionForm";
// import AnalystePage   from "./pages/Analyste/AnalystePage";

// ════════════════════════════════════════════════════════════════════
// 1. TYPES
// ════════════════════════════════════════════════════════════════════

type Role = "technicien" | "auditeur" | "admin";
// Ajoute "proprietaire" | "analyste" quand les pages seront prêtes

interface User {
  name: string;
  role: Role;
  avatar: string;
}

interface AuthCtx {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

// ════════════════════════════════════════════════════════════════════
// 2. CONTEXTE AUTH (simulé — remplace par ton vrai auth)
// ════════════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => {},
  logout: () => {},
});

const USERS: Record<Role, User> = {
  technicien: { name: "Sara Chraibi",  role: "technicien", avatar: "SC" },
  auditeur:   { name: "Omar El Fassi", role: "auditeur",   avatar: "OE" },
  admin:      { name: "Admin AMEE",    role: "admin",      avatar: "AA" },
  // proprietaire: { name: "Ahmed Benali", role: "proprietaire", avatar: "AB" },
  // analyste:     { name: "Nadia Dahbi",  role: "analyste",     avatar: "ND" },
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const login  = (role: Role) => setUser(USERS[role]);
  const logout = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ════════════════════════════════════════════════════════════════════
// 3. CONFIGURATION DES ROUTES ACTIVES
// ════════════════════════════════════════════════════════════════════

interface RouteConfig {
  path: string;
  label: string;
  icon: string;
  role: Role;
  color: string;
  accent: string;
}

const ROUTES: RouteConfig[] = [
  // ── Pages pas encore prêtes ──────────────────────────────────────
  // { path: "/proprietaire", label: "Propriétaire", icon: "🏠", role: "proprietaire", color: "#10b981", accent: "rgba(16,185,129,0.15)" },
  // { path: "/analyste",     label: "Analyste IA",  icon: "📈", role: "analyste",     color: "#a855f7", accent: "rgba(168,85,247,0.15)"  },

  // ── Pages actives ────────────────────────────────────────────────
  { path: "/technicien", label: "Technicien", icon: "🔧", role: "technicien", color: "#3b82f6", accent: "rgba(59,130,246,0.15)"  },
  { path: "/auditeur",   label: "Auditeur",   icon: "✅", role: "auditeur",   color: "#f59e0b", accent: "rgba(245,158,11,0.15)"  },
  { path: "/admin",      label: "Admin AMEE", icon: "🗺️", role: "admin",      color: "#ef4444", accent: "rgba(239,68,68,0.15)"   },
];

// ════════════════════════════════════════════════════════════════════
// 4. SIDEBAR
// ════════════════════════════════════════════════════════════════════

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const activeRoute = ROUTES.find((r) => location.pathname.startsWith(r.path));

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "220px",
        minHeight: "100vh",
        background: "#0f1117",
        borderRight: "1px solid #1e2330",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "20px 16px",
          borderBottom: "1px solid #1e2330",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", flexShrink: 0,
            boxShadow: "0 0 12px rgba(16,185,129,0.4)",
          }}
        >
          🌿
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 800, fontSize: "16px", color: "#fff", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
            Green<span style={{ color: "#10b981" }}>Build</span>
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>

        {/* Accueil */}
        <NavLink
          to="/" end
          style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "10px",
            padding: collapsed ? "10px 0" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: "8px", textDecoration: "none",
            fontSize: "13px", fontWeight: 500,
            color: isActive ? "#fff" : "#6b7280",
            background: isActive ? "#1e2330" : "transparent",
            transition: "all 0.15s",
          })}
        >
          <span style={{ fontSize: "16px" }}>🏡</span>
          {!collapsed && <span style={{ whiteSpace: "nowrap" }}>Accueil</span>}
        </NavLink>

        {/* Label section */}
        {!collapsed && (
          <p style={{ fontSize: "10px", color: "#374151", fontWeight: 600, padding: "8px 12px 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Portails actifs
          </p>
        )}

        {/* Routes actives */}
        {ROUTES.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: collapsed ? "10px 0" : "10px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: "8px", textDecoration: "none",
              fontSize: "13px", fontWeight: isActive ? 600 : 500,
              color: isActive ? r.color : "#6b7280",
              background: isActive ? r.accent : "transparent",
              borderLeft: isActive && !collapsed ? `3px solid ${r.color}` : "3px solid transparent",
              transition: "all 0.15s",
            })}
          >
            <span style={{ fontSize: "16px" }}>{r.icon}</span>
            {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{r.label}</span>}
          </NavLink>
        ))}

        {/* Pages à venir */}
        {!collapsed && (
          <>
            <p style={{ fontSize: "10px", color: "#374151", fontWeight: 600, padding: "8px 12px 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Bientôt
            </p>
            {[
              { icon: "🏠", label: "Propriétaire" },
              { icon: "📈", label: "Analyste IA"  },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px",
                  fontSize: "13px", color: "#374151",
                  cursor: "not-allowed", opacity: 0.5,
                }}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                <span style={{ marginLeft: "auto", fontSize: "10px", background: "#1e2330", padding: "2px 6px", borderRadius: "4px", color: "#6b7280" }}>
                  soon
                </span>
              </div>
            ))}
          </>
        )}
      </nav>

      {/* ── User ── */}
      {user && (
        <div
          style={{
            borderTop: "1px solid #1e2330",
            padding: collapsed ? "12px 0" : "12px 12px",
            display: "flex", alignItems: "center", gap: "10px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: activeRoute ? activeRoute.color : "#10b981",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}
          >
            {user.avatar}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#e5e7eb", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </p>
              <button
                onClick={() => { logout(); navigate("/"); }}
                style={{ fontSize: "11px", color: "#6b7280", background: "none", border: "none", padding: 0, cursor: "pointer", marginTop: "2px" }}
              >
                Déconnexion →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Toggle ── */}
      <button
        onClick={onToggle}
        style={{
          borderTop: "1px solid #1e2330", padding: "12px",
          background: "none", border: "none", color: "#6b7280",
          cursor: "pointer", fontSize: "12px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {collapsed ? "→" : "← Réduire"}
      </button>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════════════
// 5. TOPBAR
// ════════════════════════════════════════════════════════════════════

function Topbar() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [showPicker, setShowPicker] = useState(false);

  const activeRoute = ROUTES.find((r) => location.pathname.startsWith(r.path));
  const breadcrumb  = activeRoute ? activeRoute.label : "Accueil";

  return (
    <header
      style={{
        height: "56px", background: "#0f1117",
        borderBottom: "1px solid #1e2330",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", position: "sticky", top: 0, zIndex: 50,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#4b5563" }}>GreenBuild</span>
        <span style={{ color: "#374151" }}>/</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: activeRoute ? activeRoute.color : "#10b981" }}>
          {breadcrumb}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Statut */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "11px", color: "#6b7280" }}>Système actif</span>
        </div>

        {/* Login / User */}
        {!user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowPicker(!showPicker)}
              style={{
                background: "#1e2330", border: "1px solid #374151",
                borderRadius: "8px", padding: "6px 14px",
                fontSize: "12px", color: "#e5e7eb", cursor: "pointer", fontWeight: 500,
              }}
            >
              🔐 Se connecter
            </button>
            {showPicker && (
              <div
                style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#161b27", border: "1px solid #1e2330",
                  borderRadius: "12px", padding: "8px", minWidth: "180px",
                  zIndex: 100, boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                {ROUTES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => { login(r.role); setShowPicker(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      width: "100%", padding: "9px 12px",
                      background: "none", border: "none", borderRadius: "8px",
                      fontSize: "13px", color: "#e5e7eb", cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1e2330")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#1e2330", border: "1px solid #374151",
              borderRadius: "8px", padding: "5px 12px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>Connecté :</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: activeRoute ? activeRoute.color : "#10b981" }}>
              {user.role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

// ════════════════════════════════════════════════════════════════════
// 6. LAYOUT
// ════════════════════════════════════════════════════════════════════

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0d14" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 7. ROLE GUARD
// ════════════════════════════════════════════════════════════════════

function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <>{children}</>;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

// ════════════════════════════════════════════════════════════════════
// 8. PAGE 404
// ════════════════════════════════════════════════════════════════════

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <div style={{ fontSize: "64px", color: "#374151" }}>404</div>
      <p style={{ fontSize: "16px", color: "#6b7280" }}>Page introuvable</p>
      <button
        onClick={() => navigate("/")}
        style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
      >
        ← Retour à l'accueil
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 9. APP
// ════════════════════════════════════════════════════════════════════

function AppRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/technicien" element={<RoleGuard role="technicien"><TechnicienPage /></RoleGuard>} />
        <Route path="/auditeur"   element={<RoleGuard role="auditeur"><AuditeurPage /></RoleGuard>} />
        <Route path="/admin"      element={<RoleGuard role="admin"><AdminPage /></RoleGuard>} />

        {/* ── Décommente quand les pages seront prêtes ── */}
        {/* <Route path="/proprietaire" element={<RoleGuard role="proprietaire"><SoumissionForm /></RoleGuard>} /> */}
        {/* <Route path="/analyste"     element={<RoleGuard role="analyste"><AnalystePage /></RoleGuard>} /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <>
          <style>{`
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #0a0d14; font-family: 'Inter', system-ui, sans-serif; }
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: #0f1117; }
            ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }
            ::-webkit-scrollbar-thumb:hover { background: #374151; }
            a { text-decoration: none; }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.4; }
            }
          `}</style>
          <AppRoutes />
        </>
      </AuthProvider>
    </BrowserRouter>
  );
}