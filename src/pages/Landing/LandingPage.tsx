// ─────────────────────────────────────────────────────────────
// src/pages/Landing/LandingPage.tsx
// GreenBuild v3.0 — Page d'accueil placeholder Étape 6
// Nom exact CDC : pages/Proprietaire/ ... Landing/LandingPage
// Sera remplacée par la vraie page à l'Étape 8
// ─────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";

const PORTAILS = [
  { path: "/proprietaire", label: "Propriétaire",  fichier: "SoumissionForm.tsx", icon: "🏠", color: "border-green-200  bg-green-50  text-green-700  dark:bg-green-950  dark:border-green-800  dark:text-green-300"  },
  { path: "/technicien",   label: "Technicien",    fichier: "TechnicienPage.tsx", icon: "🔧", color: "border-blue-200   bg-blue-50   text-blue-700   dark:bg-blue-950   dark:border-blue-800   dark:text-blue-300"   },
  { path: "/auditeur",     label: "Auditeur",      fichier: "AuditeurPage.tsx",   icon: "✅", color: "border-amber-200  bg-amber-50  text-amber-700  dark:bg-amber-950  dark:border-amber-800  dark:text-amber-300"  },
  { path: "/admin",        label: "Admin AMEE",    fichier: "AdminPage.tsx",      icon: "🗺️", color: "border-red-200    bg-red-50    text-red-700    dark:bg-red-950    dark:border-red-800    dark:text-red-300"    },
  { path: "/analyste",     label: "Analyste IA",   fichier: "AnalystePage.tsx",   icon: "📈", color: "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col
                    items-center justify-center px-4 py-16">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center
                        justify-center text-3xl shadow-sm">
          🌿
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Green<span className="text-green-600">Build</span>
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Certification énergétique intelligente du Maroc
          </p>
        </div>
      </div>

      {/* Badge étape validée */}
      <div className="mb-10 flex items-center gap-2 bg-green-100 dark:bg-green-950
                      text-green-800 dark:text-green-300 text-xs font-semibold
                      px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Étape 6 ✅ — React Router v7 · 6 routes actives
      </div>

      {/* Grille portails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3
                      w-full max-w-2xl mb-10">
        {PORTAILS.map((p) => (
          <Link
            key={p.path}
            to={p.path}
            className={`
              flex items-center gap-3 p-4 rounded-xl border-2 font-medium
              text-sm hover:scale-[1.03] hover:shadow-md transition-all duration-150
              ${p.color}
            `}
          >
            <span className="text-2xl leading-none">{p.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{p.label}</div>
              <code className="text-[10px] opacity-50 font-mono block truncate">
                {p.fichier}
              </code>
            </div>
            <span className="opacity-30 flex-shrink-0">→</span>
          </Link>
        ))}
      </div>

      {/* Hiérarchie des fichiers */}
      <div className="w-full max-w-2xl bg-stone-900 dark:bg-stone-800
                      rounded-2xl p-5 text-xs font-mono text-stone-300">
        <p className="text-stone-500 mb-3 font-sans text-xs">
          src/ — structure CDC v2
        </p>
        <pre className="leading-6">{`src/
├── App.tsx
├── main.tsx
├── components/
│   └── Layout.tsx
└── pages/
    ├── Landing/
    │   └── LandingPage.tsx       ← ici
    ├── Proprietaire/
    │   ├── SoumissionForm.tsx    ← /proprietaire
    │   └── Dashboard.tsx         ← /proprietaire/dashboard
    ├── Technicien/
    │   └── TechnicienPage.tsx    ← /technicien
    ├── Auditeur/
    │   └── AuditeurPage.tsx      ← /auditeur
    ├── AdminAMEE/
    │   └── AdminPage.tsx         ← /admin
    └── Analyste/
        └── AnalystePage.tsx      ← /analyste`}</pre>
      </div>

      <p className="mt-8 text-xs text-stone-400">
        ENSA Berrechid · Module Technologies Web · Pr. Ilhame Ait Lbachir
      </p>
    </div>
  );
}