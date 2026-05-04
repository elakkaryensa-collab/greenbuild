// ─────────────────────────────────────────────────────────────
// src/pages/Landing/LandingPage.tsx
// GreenBuild v3.0 — Page d'accueil
// ─────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";

const SCORES = [
  { letter: "A", bg: "#C0DD97", color: "#27500A", pct: 95, label: "Très performant" },
  { letter: "B", bg: "#97C459", color: "#3B6D11", pct: 80, label: "Performant" },
  { letter: "C", bg: "#C0DD97", color: "#639922", pct: 65, label: "Assez performant" },
  { letter: "D", bg: "#FAC775", color: "#BA7517", pct: 50, label: "Peu performant" },
  { letter: "E", bg: "#EF9F27", color: "#854F0B", pct: 35, label: "Énergivore" },
  { letter: "F", bg: "#F0997B", color: "#993C1D", pct: 20, label: "Très énergivore" },
  { letter: "G", bg: "#D85A30", color: "#712B13", pct: 8,  label: "Extrêmement énergivore" },
] as const;

const PORTAILS = [
  {
    path: "/proprietaire",
    name: "Propriétaire",
    desc: "Soumettez et suivez votre dossier",
    bg: "#EAF3DE",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z" fill="#3B6D11" />
      </svg>
    ),
  },
  {
    path: "/technicien",
    name: "Technicien",
    desc: "Gérez les audits terrain",
    bg: "#E6F1FB",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" fill="#185FA5" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#185FA5" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    path: "/auditeur",
    name: "Auditeur",
    desc: "Validez les rapports officiels",
    bg: "#FAEEDA",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#BA7517" strokeWidth="1.5" />
        <path d="M5 8h6M5 5h6M5 11h4" stroke="#BA7517" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    path: "/analyste",
    name: "Analyste",
    desc: "Tableaux de bord nationaux",
    bg: "#EEEDFE",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12l4-4 3 3 5-7" stroke="#534AB7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: "/admin",
    name: "Admin AMEE",
    desc: "Supervision & accréditations",
    bg: "#FAECE7",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2a2 2 0 100 4 2 2 0 000-4zM4 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#993C1D" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="4" r="1.5" fill="#993C1D" />
      </svg>
    ),
  },
] as const;

const ETAPES = [
  {
    num: "Étape 1",
    title: "Bâtiment",
    desc: "Surface, matériaux, isolation, zone climatique RTCM",
  },
  {
    num: "Étape 2",
    title: "Équipements",
    desc: "Inventaire complet avec puissance et usage journalier",
  },
  {
    num: "Étape 3",
    title: "Factures",
    desc: "12 mois de consommation ONEE pour le score officiel",
  },
] as const;

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-16 pb-10 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white dark:bg-stone-900
                        border border-stone-200 dark:border-stone-700
                        rounded-full px-4 py-1.5 text-xs text-stone-500 dark:text-stone-400
                        mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Loi 47-09 · AMEE · RTCM
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight mb-3">
          Certifiez votre bâtiment{" "}
          <span className="text-green-700 dark:text-green-400">éco-énergétique</span>
        </h1>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed mb-8">
          Obtenez votre score A–G officiel en 3 étapes. Plateforme conforme à la
          réglementation marocaine.
        </p>

        {/* CTA */}
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          <button
            onClick={() => navigate("/proprietaire")}
            className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white
                       text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            Démarrer la certification →
          </button>
          <button
            onClick={() => navigate("/analyste")}
            className="px-6 py-3 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800
                       text-stone-700 dark:text-stone-300 text-sm font-medium
                       border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
          >
            Voir les statistiques
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-stone-100 dark:divide-stone-800
                        border border-stone-100 dark:border-stone-800
                        rounded-2xl overflow-hidden bg-white dark:bg-stone-900 shadow-sm">
          {[
            { num: "A–G",  label: "Score officiel" },
            { num: "3",    label: "Étapes seulement" },
            { num: "12",   label: "Régions couvertes" },
          ].map((s) => (
            <div key={s.label} className="py-5 text-center">
              <p className="text-xl font-extrabold text-green-700 dark:text-green-400">{s.num}</p>
              <p className="text-xs text-stone-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portails ───────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center mb-4">
          Portails d'accès
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PORTAILS.map((p) => (
            <button
              key={p.path}
              onClick={() => navigate(p.path)}
              className="flex flex-col items-start gap-2 p-4 text-left
                         bg-white dark:bg-stone-900
                         border border-stone-100 dark:border-stone-800
                         rounded-2xl hover:border-stone-300 dark:hover:border-stone-600
                         hover:bg-stone-50 dark:hover:bg-stone-800
                         transition-all duration-150 shadow-sm"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: p.bg }}
              >
                {p.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{p.name}</p>
                <p className="text-xs text-stone-400 leading-relaxed mt-0.5">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Échelle score ──────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center mb-5">
          Échelle de performance énergétique
        </p>
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800
                        rounded-2xl p-5 shadow-sm space-y-3">
          {SCORES.map((s) => (
            <div key={s.letter} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center
                           text-xs font-bold flex-shrink-0"
                style={{ background: s.bg, color: s.color }}
              >
                {s.letter}
              </div>
              <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.pct}%`, background: s.bg }}
                />
              </div>
              <span className="text-xs text-stone-400 w-10 text-right">{s.pct}%</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 w-44 hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center mb-4">
          Comment ça marche
        </p>
        <div className="grid grid-cols-3 gap-3">
          {ETAPES.map((e, i) => (
            <div
              key={e.num}
              className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800
                         rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950
                                flex items-center justify-center
                                text-[10px] font-bold text-green-700 dark:text-green-400 flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                  {e.num}
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1">{e.title}</p>
              <p className="text-xs text-stone-400 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>

        {/* Tags conformité */}
        <div className="flex gap-2 justify-center flex-wrap mt-4">
          {["Conforme RTCM", "Score A–G", "Loi 47-09", "AMEE"].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-3 py-1 rounded-full
                         bg-green-50 dark:bg-green-950
                         text-green-700 dark:text-green-400
                         border border-green-100 dark:border-green-900"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="max-w-2xl mx-auto px-4 py-6 text-center
                         border-t border-stone-100 dark:border-stone-800 mt-4">
        <p className="text-xs text-stone-400">
          GreenBuild v3.0 · Plateforme nationale de certification énergétique · Royaume du Maroc
        </p>
      </footer>
    </div>
  );
}