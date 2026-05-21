// ─────────────────────────────────────────────────────────────
// src/pages/Analyste/AnalystePage.tsx
// GreenBuild v3.3 — Fond vert quasi-blanc · Section IA épurée
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

import type { PieLabelRenderProps } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_REGIONS }           from "../../data/normesRTCM";
import type { ClasseEnergetique } from "../../types/Score";

// ── Palette ───────────────────────────────────────────────────
const P = {
   primary:  "#15803d",
 dark:     "#1A4A2E",
  accent:   "#6DB33F",
  warm:     "#B5451B",
  muted:    "#6b6b5e",
  bg:       "#F7F7F7",
  card:     "#FFFFFF",
  border:   "#E8E8E8",
  subtle:   "#F2F2F2",
};

// ── Spectre classes A→G ───────────────────────────────────────
const CLS_CLR: Record<ClasseEnergetique, string> = {
  A: "#1A4A2E",
  B: "#2D6B45",
  C: "#6DB33F",
  D: "#FAC775",
  E: "#EF9F27",
  F: "#F0997B",
  G: "#D85A30",
};

// ── Données ───────────────────────────────────────────────────
const TENDANCES = [
  { mois: "Jan", dossiers: 32,  certifies: 18, score: 58 },
  { mois: "Fév", dossiers: 28,  certifies: 21, score: 60 },
  { mois: "Mar", dossiers: 41,  certifies: 29, score: 61 },
  { mois: "Avr", dossiers: 55,  certifies: 38, score: 62 },
  { mois: "Mai", dossiers: 48,  certifies: 35, score: 63 },
  { mois: "Jun", dossiers: 62,  certifies: 44, score: 64 },
  { mois: "Jul", dossiers: 71,  certifies: 52, score: 65 },
  { mois: "Aoû", dossiers: 59,  certifies: 43, score: 64 },
  { mois: "Sep", dossiers: 83,  certifies: 61, score: 66 },
  { mois: "Oct", dossiers: 97,  certifies: 74, score: 67 },
  { mois: "Nov", dossiers: 108, certifies: 82, score: 68 },
  { mois: "Déc", dossiers: 124, certifies: 96, score: 69 },
];

const CLASSES: { classe: ClasseEnergetique; nb: number; fill: string }[] = [
  { classe: "A", nb: 89,  fill: CLS_CLR["A"] },
  { classe: "B", nb: 201, fill: CLS_CLR["B"] },
  { classe: "C", nb: 312, fill: CLS_CLR["C"] },
  { classe: "D", nb: 287, fill: CLS_CLR["D"] },
  { classe: "E", nb: 143, fill: CLS_CLR["E"] },
  { classe: "F", nb: 62,  fill: CLS_CLR["F"] },
  { classe: "G", nb: 14,  fill: CLS_CLR["G"] },
];

const TOTAL     = TENDANCES.reduce((s, t) => s + t.dossiers, 0);
const CERTIFIES = TENDANCES.reduce((s, t) => s + t.certifies, 0);
const SCORE_MOY = Math.round(TENDANCES.reduce((s, t) => s + t.score, 0) / TENDANCES.length);
const PROGRESS  = Math.round(((TENDANCES[11].score - TENDANCES[0].score) / TENDANCES[0].score) * 100);
const TOTAL_CLS = CLASSES.reduce((s, c) => s + c.nb, 0);

type OngletId = "tendances" | "regions" | "classes" | "plan";

// ── Icônes ────────────────────────────────────────────────────
const Ico = {
  TrendUp:   (): React.ReactElement => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Map:       (): React.ReactElement => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  BarChart2: (): React.ReactElement => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Sparkle:   (): React.ReactElement => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4-.7-.7.7M5.6 18.4l.7-.7m11.4.7-.7-.7"/><circle cx="12" cy="12" r="4"/></svg>,
  FileText:  (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Award:     (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Activity:  (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Globe:     (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Download:  (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  AlertTri:  (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Generate:  (): React.ReactElement => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Stop:      (): React.ReactElement => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>,
  Refresh:   (): React.ReactElement => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Export:    (): React.ReactElement => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  History:   (): React.ReactElement => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>,
  National:  (): React.ReactElement => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Regional:  (): React.ReactElement => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Classes:   (): React.ReactElement => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Policy:    (): React.ReactElement => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

// ── Recharts config ───────────────────────────────────────────
const TT_STYLE = {
  contentStyle: {
    fontSize: "12px", borderRadius: "10px",
    background: "#fff", border: `1px solid ${P.border}`,
    color: P.dark, boxShadow: "0 4px 16px rgba(26,74,46,0.08)",
  },
  labelStyle: { color: P.muted, fontWeight: 500 },
};
const TICK = { fontSize: 10, fill: "#8aaa8e" };
const GRID = "#e8f4ec";

// ── Card ─────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border ${className}`}
         style={{ borderColor: P.border }}>
      {children}
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────
function SectionHeader({ Icon, title, sub }: {
  Icon: () => React.ReactElement; title: string; sub: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: P.border }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: P.subtle, border: `1px solid ${P.border}`, color: P.primary }}>
        <Icon />
      </div>
      <div>
        <h3 className="text-sm font-bold" style={{ color: P.dark }}>{title}</h3>
        <p className="text-[11px]" style={{ color: P.muted }}>{sub}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION PLAN IA
// ══════════════════════════════════════════════════════════════

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      return (
        <p key={i} className="text-sm font-semibold mt-5 mb-2 first:mt-0 pb-1.5"
           style={{ color: P.dark, borderBottom: `1px solid ${P.border}` }}>
          {line.slice(2, -2)}
        </p>
      );
    }
    const numMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
    if (numMatch) {
      return (
        <div key={i} className="flex gap-3 mt-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded text-[10px] font-semibold
                           flex items-center justify-center mt-0.5"
                style={{ background: P.border, color: P.primary }}>
            {numMatch[1]}
          </span>
          <p className="text-sm leading-relaxed" style={{ color: "#3a5a3e" }}>
            <span className="font-semibold" style={{ color: P.dark }}>{numMatch[2]}</span>
            {numMatch[3]}
          </p>
        </div>
      );
    }
    if (line.startsWith("- ")) {
      const content = line.slice(2).replace(/\*\*(.+?)\*\*/g, "§§$1§§");
      const parts   = content.split("§§");
      return (
        <div key={i} className="flex gap-2.5 mt-2">
          <span className="flex-shrink-0 w-1 h-1 rounded-full mt-2.5 ml-1"
                style={{ background: P.muted, opacity: 0.5 }} />
          <p className="text-sm leading-relaxed" style={{ color: P.muted }}>
            {parts.map((pp, j) =>
              j % 2 === 1
                ? <span key={j} className="font-medium" style={{ color: P.dark }}>{pp}</span>
                : pp
            )}
          </p>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} className="text-sm leading-relaxed mt-1" style={{ color: P.muted }}>
        {parts.map((pp, j) =>
          j % 2 === 1
            ? <span key={j} className="font-medium" style={{ color: P.dark }}>{pp}</span>
            : pp
        )}
      </p>
    );
  });
}

type TypeRapport = "national" | "regional" | "classes" | "recommandations";

interface RapportSauvegarde {
  id:      string;
  type:    TypeRapport;
  label:   string;
  contenu: string;
  date:    string;
}

const TYPES_RAPPORT: {
  value: TypeRapport;
  label: string;
  Icon: () => React.ReactElement;
  desc: string;
}[] = [
  { value: "national",        label: "Plan national",     Icon: Ico.National, desc: "Analyse + plan d'action 2025–2026"   },
  { value: "regional",        label: "Analyse régionale", Icon: Ico.Regional, desc: "Régions performantes vs faibles"     },
  { value: "classes",         label: "Rapport classes",   Icon: Ico.Classes,  desc: "Analyse A–G et recommandations"      },
  { value: "recommandations", label: "Politique AMEE",    Icon: Ico.Policy,   desc: "Mesures Loi 47-09 & Stratégie 2030" },
];

function buildPrompt(type: TypeRapport): string {
  const base = `
Données GreenBuild 2024 :
- Dossiers soumis : ${TOTAL} | Certifiés : ${CERTIFIES} (${Math.round(CERTIFIES / TOTAL * 100)}%)
- Score moyen national : ${SCORE_MOY}/100 | Progression : +${PROGRESS}%
- Top régions : Souss-Massa (B, 76pts), Rabat-Salé-Kénitra (B, 74pts), Casablanca-Settat (B, 71pts)
- Régions faibles : Béni Mellal-Khénifra (E, 35pts), Drâa-Tafilalet (E, 38pts)
- Classes : A(89), B(201), C(312), D(287), E(143), F(62), G(14)`;
  const prompts: Record<TypeRapport, string> = {
    national: `${base}\nTu es conseiller principal de l'AMEE. Rédige un **Plan d'Action National** :\n**1. Analyse de la situation nationale**\n**2. Plan d'action 2025-2026** (5 actions concrètes chiffrées)\n**3. Recommandations politiques** (3 mesures Loi 47-09 & Stratégie 2030)\nSois précis, professionnel, en français.`,
    regional: `${base}\nTu es analyste territorial de l'AMEE. Rédige une **Analyse Régionale Comparative** :\n**1. Régions performantes** — Facteurs de succès\n**2. Régions en difficulté** — Causes et risques\n**3. Plan de rattrapage régional** (4 mesures ciblées)\n**4. Indicateurs de suivi** (KPIs recommandés)`,
    classes: `${base}\nTu es expert en performance énergétique. Rédige un **Rapport Classes Énergétiques** :\n**1. État des lieux** — Répartition A–G commentée\n**2. Analyse par segment** — Causes des mauvaises performances\n**3. Objectifs 2026** — Cibles de transition réalistes\n**4. Recommandations techniques** (5 mesures concrètes)`,
    recommandations: `${base}\nTu es juriste-expert en politique énergétique marocaine. Rédige un **Rapport Politique** :\n**1. Bilan de la Loi 47-09** — Application et lacunes\n**2. Alignement Stratégie 2030** — Écarts identifiés\n**3. Recommandations législatives** (3 amendements)\n**4. Mécanismes d'incitation** (subventions, fiscalité)`,
  };
  return prompts[type];
}

// ── PlanIA ─────────────────────────────────────────────────────
function PlanIA() {
  const [typeRapport,  setTypeRapport]  = useState<TypeRapport>("national");
  const [rapport,      setRapport]      = useState<string>("");
  const [isStreaming,  setIsStreaming]  = useState<boolean>(false);
  const [erreur,       setErreur]       = useState<string | null>(null);
  const [historique,   setHistorique]   = useState<RapportSauvegarde[]>([]);
  const [rapportActif, setRapportActif] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const stopGeneration = () => { abortRef.current?.abort(); setIsStreaming(false); };

  const generer = async () => {
    setErreur(null); setIsStreaming(true); setRapport(""); setRapportActif(null);
    abortRef.current = new AbortController();
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", signal: abortRef.current.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4-5", max_tokens: 82,
          messages: [{ role: "user", content: buildPrompt(typeRapport) }],
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(err?.error?.message ?? `Erreur HTTP ${response.status}`);
      }
      const data = await response.json() as { choices?: { message: { content: string } }[] };
      const full = data.choices?.[0]?.message?.content ?? "";
      if (!full) throw new Error("Réponse vide de l'API");
      const words = full.split(" ");
      let accumulated = "";
      for (let i = 0; i < words.length; i++) {
        if (abortRef.current?.signal.aborted) break;
        accumulated += (i === 0 ? "" : " ") + words[i];
        setRapport(accumulated);
        await new Promise(r => setTimeout(r, 16));
      }
      const id   = Date.now().toString();
      const meta = TYPES_RAPPORT.find(t => t.value === typeRapport)!;
      setHistorique(prev => [{
        id, type: typeRapport, label: meta.label,
        contenu: full, date: new Date().toLocaleString("fr-MA"),
      }, ...prev.slice(0, 4)]);
      setRapportActif(id);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setErreur(err instanceof Error ? err.message : "Erreur réseau inconnue");
    } finally {
      setIsStreaming(false);
    }
  };

  const exportTxt = () => {
    if (!rapport) return;
    const blob = new Blob([rapport], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `greenbuild-rapport-${typeRapport}-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const rapportAffiche = rapportActif
    ? historique.find(h => h.id === rapportActif)?.contenu ?? rapport
    : rapport;

  return (
    <div className="space-y-4">

      {/* ── Sélecteur type ── */}
      <Card>
        <SectionHeader Icon={Ico.Sparkle} title="Générateur de rapport IA" sub="Sélectionnez le type d'analyse" />
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TYPES_RAPPORT.map(t => {
              const active = typeRapport === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTypeRapport(t.value)}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-150"
                  style={{
                    borderColor: active ? P.primary : P.border,
                    background:  active ? P.subtle  : P.card,
                    boxShadow:   active ? `inset 0 0 0 1px ${P.primary}` : "none",
                  }}
                >
                  <span style={{ color: active ? P.primary : "#9aada0" }}>
                    <t.Icon />
                  </span>
                  <span className="text-xs font-semibold leading-tight"
                        style={{ color: active ? P.dark : P.muted }}>
                    {t.label}
                  </span>
                  <span className="text-[10px] leading-tight" style={{ color: "#9aada0" }}>
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-2">
        <motion.button
          onClick={isStreaming ? stopGeneration : generer}
          whileHover={!isStreaming ? { translateY: -1 } : {}}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all text-white"
          style={{
            background: isStreaming ? P.warm : P.primary,
            boxShadow:  isStreaming ? "0 2px 12px rgba(194,92,56,0.2)" : "0 2px 12px rgba(45,107,69,0.2)",
          }}
        >
          {isStreaming ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Arrêter
            </>
          ) : rapport ? (
            <><Ico.Refresh /> Régénérer</>
          ) : (
            <><Ico.Generate /> Générer le rapport</>
          )}
        </motion.button>

        {rapport && !isStreaming && (
          <motion.button
            onClick={exportTxt}
            whileHover={{ translateY: -1 }} whileTap={{ scale: 0.97 }}
            className="px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all"
            style={{ borderColor: P.border, color: P.muted, background: P.card }}
          >
            <Ico.Export /> .txt
          </motion.button>
        )}
      </div>

      {/* ── Erreur ── */}
      <AnimatePresence>
        {erreur && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border text-sm"
            style={{ background: "#fdf2ee", borderColor: "#f5c4b0", color: P.warm }}
          >
            <Ico.AlertTri />
            <p>{erreur}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Historique ── */}
      {historique.length > 1 && (
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest mb-2"
             style={{ color: P.muted }}>
            <Ico.History /> Historique
          </p>
          <div className="flex gap-2 flex-wrap">
            {historique.map(h => {
              const active = rapportActif === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => { setRapportActif(h.id); setRapport(h.contenu); }}
                  className="text-[11px] px-3 py-1.5 rounded-lg border transition-all font-medium"
                  style={{
                    borderColor: active ? P.primary : P.border,
                    background:  active ? P.subtle  : P.card,
                    color:       active ? P.primary : P.muted,
                  }}
                >
                  {h.label} · {h.date}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Rapport ── */}
      <AnimatePresence>
        {(rapportAffiche || isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden border shadow-sm"
            style={{ borderColor: P.border }}
          >
            {/* En-tête du rapport */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: P.border, background: P.subtle }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: P.card, border: `1px solid ${P.border}`, color: P.primary }}>
                  {(() => {
                    const t = TYPES_RAPPORT.find(t => t.value === typeRapport);
                    return t ? <t.Icon /> : null;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: P.dark }}>
                    {TYPES_RAPPORT.find(t => t.value === typeRapport)?.label}
                  </p>
                  <p className="text-[10px]" style={{ color: P.muted }}>
                    {new Date().toLocaleDateString("fr-MA", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}Stratégie 2030 · Loi 47-09
                  </p>
                </div>
              </div>
              {isStreaming && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium"
                     style={{ background: P.card, borderColor: P.border, color: P.primary }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: P.primary }} />
                  Génération…
                </div>
              )}
            </div>

            {/* Corps */}
            <div className="px-6 py-5">
              {renderMarkdown(rapportAffiche)}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
                      style={{ background: P.primary }} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── État vide ── */}
      {!rapportAffiche && !isStreaming && !erreur && (
        <div className="text-center py-14 rounded-2xl border border-dashed"
             style={{ borderColor: P.border }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
               style={{ background: P.subtle, border: `1px solid ${P.border}`, color: P.primary }}>
            <Ico.Sparkle />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: P.dark }}>Prêt à générer</p>
          <p className="text-xs" style={{ color: P.muted }}>Sélectionnez un type puis cliquez sur Générer</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════
const ONGLETS: { id: OngletId; label: string; Icon: () => React.ReactElement }[] = [
  { id: "tendances", label: "Tendances", Icon: Ico.TrendUp   },
  { id: "regions",   label: "Régions",   Icon: Ico.Map       },
  { id: "classes",   label: "Classes",   Icon: Ico.BarChart2 },
  { id: "plan",      label: "Plan IA",   Icon: Ico.Sparkle   },
];

export default function AnalystePage() {
  const [onglet, setOnglet] = useState<OngletId>("tendances");

  const exportCSV = () => {
    const sep = ";";
    const q   = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const sections: string[] = [
      q("GREENBUILD — RAPPORT NATIONAL 2024"),
      q("Agence Marocaine pour l'Efficacité Énergétique (AMEE)"),
      q(`Exporté le : ${new Date().toLocaleDateString("fr-MA")}`),
      "",
      q("=== SYNTHÈSE NATIONALE ==="),
      [q("Indicateur"), q("Valeur")].join(sep),
      [q("Total dossiers annuels"),   q(TOTAL)].join(sep),
      [q("Dossiers certifiés"),       q(CERTIFIES)].join(sep),
      [q("Taux de certification"),    q(`${Math.round((CERTIFIES/TOTAL)*100)} %`)].join(sep),
      [q("Score moyen national"),     q(`${SCORE_MOY} / 100`)].join(sep),
      [q("Progression annuelle"),     q(`+${PROGRESS} %`)].join(sep),
      "",
      q("=== TENDANCES MENSUELLES ==="),
      [q("Mois"), q("Dossiers soumis"), q("Dossiers certifiés"), q("Taux certif. (%)"), q("Score /100")].join(sep),
      ...TENDANCES.map(t => [q(t.mois), q(t.dossiers), q(t.certifies),
        q(Math.round((t.certifies/t.dossiers)*100)), q(t.score)].join(sep)),
      "",
      q("=== SCORES PAR RÉGION ==="),
      [q("Région"), q("Classe"), q("Score /100"), q("Dossiers"), q("Certifiés"), q("Taux %")].join(sep),
      ...[...MOCK_REGIONS].sort((a, b) => b.scoreMoyen - a.scoreMoyen).map(r =>
        [q(r.nom), q(r.classemoyenne), q(r.scoreMoyen), q(r.nbDossiers), q(r.nbCertifies),
          q(Math.round((r.nbCertifies/r.nbDossiers)*100))].join(sep)
      ),
      "",
      q("=== RÉPARTITION PAR CLASSE ==="),
      [q("Classe"), q("Bâtiments"), q("Part %")].join(sep),
      ...CLASSES.map(c => [q(`Classe ${c.classe}`), q(c.nb),
        q(`${Math.round((c.nb/TOTAL_CLS)*100)} %`)].join(sep)),
      [q("TOTAL"), q(TOTAL_CLS), q("100 %")].join(sep),
    ];
    const csv  = "\uFEFF" + sections.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `greenbuild-rapport-${new Date().getFullYear()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const KPIS = [
    { label: "Dossiers annuels",     val: TOTAL,              Icon: Ico.FileText, accent: P.primary },
    { label: "Certifiés",            val: CERTIFIES,          Icon: Ico.Award,    accent: "#4A90A4" },
    { label: "Score moyen national", val: `${SCORE_MOY}/100`, Icon: Ico.Activity, accent: P.accent  },
    { label: "Progression annuelle", val: `+${PROGRESS}%`,    Icon: Ico.TrendUp,  accent: P.warm    },
  ];

  return (
    <div className="min-h-screen" style={{ background: P.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── En-tête ── */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs rounded-full px-4 py-1.5 mb-4 border"
               style={{ background: P.card, borderColor: P.border, color: P.muted }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: P.primary }} />
            Données 2024 · Portail Analyste
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: P.dark }}>
                Analyste <span style={{ color: P.primary }}>national</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: P.muted }}>
                Tendances · Classes énergétiques · Stratégie 2030
              </p>
            </div>
            <motion.button
              onClick={exportCSV}
              whileHover={{ translateY: -1 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all"
              style={{ background: P.card, borderColor: P.border, color: P.primary }}
            >
              <Ico.Download /> Export CSV
            </motion.button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KPIS.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 border"
              style={{ borderColor: P.border, borderTop: `3px solid ${k.accent}` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: P.subtle, border: `1px solid ${P.border}`, color: k.accent }}>
                <k.Icon />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: k.accent }}>{k.val}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: P.muted }}>{k.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Onglets ── */}
        <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto border"
             style={{ background: P.subtle, borderColor: P.border }}>
          {ONGLETS.map(o => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background: onglet === o.id ? P.primary : "transparent",
                color:      onglet === o.id ? "#fff"     : P.muted,
                boxShadow:  onglet === o.id ? "0 1px 6px rgba(45,107,69,0.2)" : "none",
              }}
            >
              <span style={{ color: onglet === o.id ? "#fff" : "#9aada0" }}><o.Icon /></span>
              {o.label}
            </button>
          ))}
        </div>

        {/* ── Contenu ── */}
        <AnimatePresence mode="wait">

          {/* ══ TENDANCES ══ */}
          {onglet === "tendances" && (
            <motion.div key="tendances"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <Card>
                <SectionHeader Icon={Ico.TrendUp} title="Dossiers soumis vs certifiés — 12 mois"
                  sub="Évolution nationale de l'activité" />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={TENDANCES}>
                      <defs>
                        <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={P.primary} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={P.primary} stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={P.accent} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={P.accent} stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis dataKey="mois" tick={TICK} />
                      <YAxis tick={TICK} />
                      <Tooltip {...TT_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Area type="monotone" dataKey="dossiers" name="Dossiers"
                            stroke={P.primary} fill="url(#gD)" strokeWidth={2}
                            dot={{ r: 3, fill: P.primary, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="certifies" name="Certifiés"
                            stroke={P.accent} fill="url(#gC)" strokeWidth={2}
                            dot={{ r: 3, fill: P.accent, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <SectionHeader Icon={Ico.Activity} title="Évolution du score moyen national"
                  sub={`+${PROGRESS}% sur l'année · Score actuel : ${TENDANCES[11].score}/100`} />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={TENDANCES}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis dataKey="mois" tick={TICK} />
                      <YAxis domain={[50, 80]} tick={TICK} />
                      <Tooltip
                        contentStyle={TT_STYLE.contentStyle}
                        labelStyle={TT_STYLE.labelStyle}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((value: any, name: any) => [
                          `${value ?? "–"}/100`,
                          typeof name === "string" ? name : String(name ?? ""),
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ]) as any}
                      />
                      <Line type="monotone" dataKey="score" name="Score moyen"
                            stroke={P.primary} strokeWidth={2}
                            dot={{ r: 3, fill: P.primary, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ══ RÉGIONS ══ */}
          {onglet === "regions" && (
            <motion.div key="regions"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            >
              <Card>
                <SectionHeader Icon={Ico.Map} title="Score moyen par région"
                  sub="Du meilleur au plus faible · 12 régions" />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                      data={[...MOCK_REGIONS].sort((a, b) => b.scoreMoyen - a.scoreMoyen)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                      <XAxis type="number" domain={[0, 100]} tick={TICK} />
                      <YAxis type="category" dataKey="nom" width={165}
                        tick={{ ...TICK, fontSize: 9 }}
                        tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + "…" : v} />
                      <Tooltip
                        contentStyle={TT_STYLE.contentStyle}
                        labelStyle={TT_STYLE.labelStyle}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((value: any, name: any) => [
                          `${value ?? "–"}/100`,
                          typeof name === "string" ? name : "Score moyen",
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ]) as any}
                      />
                      <Bar dataKey="scoreMoyen" radius={[0, 5, 5, 0]}>
                        {[...MOCK_REGIONS].sort((a, b) => b.scoreMoyen - a.scoreMoyen).map(r =>
                          <Cell key={r.id} fill={CLS_CLR[r.classemoyenne]} />
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="border-t" style={{ borderColor: P.border }}>
                  <div className="grid grid-cols-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                       style={{ background: P.subtle, color: P.muted }}>
                    <span>Région</span>
                    <span className="text-center">Classe</span>
                    <span className="text-center">Score</span>
                    <span className="text-right">Certifiés</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y" style={{ borderColor: P.border + "60" }}>
                    {[...MOCK_REGIONS].sort((a, b) => b.scoreMoyen - a.scoreMoyen).map(r => (
                      <div key={r.id} className="grid grid-cols-4 px-5 py-2.5 items-center hover:bg-green-50 transition-colors">
                        <span className="text-xs truncate" style={{ color: P.dark }}>{r.nom.split("-")[0]}</span>
                        <span className="flex justify-center">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
                                style={{ background: CLS_CLR[r.classemoyenne] }}>
                            {r.classemoyenne}
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-center" style={{ color: P.dark }}>
                          {r.scoreMoyen}/100
                        </span>
                        <span className="text-xs text-right" style={{ color: P.muted }}>
                          {r.nbCertifies}/{r.nbDossiers}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ══ CLASSES ══ */}
          {onglet === "classes" && (
            <motion.div key="classes"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
              className="grid lg:grid-cols-2 gap-4"
            >
              <Card>
                <SectionHeader Icon={Ico.Globe} title="Répartition nationale par classe"
                  sub={`${TOTAL_CLS} bâtiments certifiés`} />
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={CLASSES} dataKey="nb" nameKey="classe"
                           cx="50%" cy="50%" outerRadius={95} innerRadius={50}
                           label={(props: PieLabelRenderProps) => {
                             const { cx, cy, midAngle, outerRadius: oR, percent, index } = props;
                             if (typeof cx!=="number"||typeof cy!=="number"||typeof midAngle!=="number"||
                                 typeof oR!=="number"||typeof percent!=="number"||typeof index!=="number") return null;
                             if (percent < 0.04) return null;
                             const R = Math.PI / 180;
                             const r = oR + 18;
                             return (
                               <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
                                     fill={CLASSES[index].fill} textAnchor="middle" dominantBaseline="central"
                                     fontSize={10} fontWeight={700}>
                                 {`${CLASSES[index].classe} ${(percent * 100).toFixed(0)}%`}
                               </text>
                             );
                           }}
                           labelLine={false}>
                        {CLASSES.map(e => <Cell key={e.classe} fill={e.fill} stroke="#fff" strokeWidth={2} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={TT_STYLE.contentStyle}
                        labelStyle={TT_STYLE.labelStyle}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((value: any, name: any) => [
                          `${value ?? "–"} bâtiments`,
                          `Classe ${typeof name === "string" ? name : String(name ?? "")}`,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ]) as any}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <SectionHeader Icon={Ico.BarChart2} title="Détail par classe énergétique"
                  sub="Bâtiments et part nationale" />
                <div className="p-5 space-y-3">
                  {CLASSES.map(r => {
                    const pct = Math.round((r.nb / TOTAL_CLS) * 100);
                    return (
                      <div key={r.classe} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                             style={{ background: r.fill }}>
                          {r.classe}
                        </div>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                             style={{ background: P.border }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                            style={{ background: r.fill }} />
                        </div>
                        <span className="text-xs font-semibold w-20 text-right flex-shrink-0"
                              style={{ color: P.dark }}>
                          {r.nb}{" "}
                          <span style={{ color: P.muted, fontWeight: 400 }}>({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}
                  <div className="mt-2 pt-4 border-t grid grid-cols-3 gap-2"
                       style={{ borderColor: P.border }}>
                    {[
                      { label: "Performants A–B", val: 89 + 201,      color: P.dark,   bg: "#daf0e2" },
                      { label: "Moyens C–D",       val: 312 + 287,     color: P.primary, bg: P.subtle  },
                      { label: "Énergivores E–G",  val: 143 + 62 + 14, color: P.warm,   bg: "#fceee8" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl px-3 py-2.5 text-center"
                           style={{ background: s.bg }}>
                        <p className="text-sm font-black" style={{ color: s.color }}>{s.val}</p>
                        <p className="text-[10px] mt-0.5 leading-tight" style={{ color: P.muted }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ══ PLAN IA ══ */}
          {onglet === "plan" && (
            <motion.div key="plan"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
            >
              <PlanIA />
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Tags conformité ── */}
        <div className="flex gap-2 flex-wrap">
          {["Conforme RTCM", "Certifié AMEE", "Loi 47-09", "Stratégie 2030"].map(t => (
            <span key={t} className="text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                  style={{ background: P.subtle, color: P.primary, borderColor: P.border }}>
              {t}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}