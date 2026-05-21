/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Proprietaire/Dashboard.tsx
// GreenBuild v3.0 — Palette alignée Landing + AnalystePage

import { useState, type JSX }                   from "react";
import { useNavigate }                from "react-router-dom";
import { motion, AnimatePresence }    from "framer-motion";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

import { useDossierStore }            from "../../store/dossierStore";
import { useEntreprises }             from "../../hooks/useEntreprises";
import ScoreEnergetique               from "../../components/ScoreEnergetique";
import RecommandationCard             from "../../components/RecommandationCard";
import PlanBudget                     from "../../components/PlanBudget";
import CertificatPDF                  from "../../components/CertificatPDF";
import { NOM_MOIS_COURT }             from "../../types/Facture";
import { calcConsommationEquipement } from "../../services/scoreService";

// ── Palette alignée Landing + AnalystePage ────────────────────
const G = {
  primary:  "#15803d",
  hover:    "#166534",
  light:    "#F2F2F2",
  border:   "#E8E8E8",
  dark:     "#1A4A2E",
  text:     "#6b6b5e",
};

// ── Icônes SVG professionnelles ───────────────────────────────
const Ico = {
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
    </svg>
  ),
  Wrench: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M20 12a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v0z"/>
    </svg>
  ),
  Bot: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
      <circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/>
      <path d="M9 17h6"/>
    </svg>
  ),
  Award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6"/><path d="M8.21 14.89L7 23l5-3 5 3-1.21-8.12"/>
      <path d="M9 9l1 1 2-3"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

type Onglet = "score" | "recommandations" | "budget" | "rapport" | "certificat";

const ONGLETS: { id: Onglet; label: string; Icon: () => JSX.Element }[] = [
  { id: "score",           label: "Score",           Icon: Ico.Zap      },
  { id: "recommandations", label: "Recommandations", Icon: Ico.Wrench   },
  { id: "budget",          label: "Plan budget",     Icon: Ico.Wallet   },
  { id: "rapport",         label: "Rapport IA",      Icon: Ico.Bot      },
  { id: "certificat",      label: "Certificat",      Icon: Ico.Award    },
];

// ── Composants réutilisables ──────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ Icon, title, sub }: { Icon: () => JSX.Element; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: G.light, border: `1px solid ${G.border}`, color: G.primary }}>
        <Icon />
      </div>
      <div>
        <h3 className="text-sm font-bold" style={{ color: G.dark }}>{title}</h3>
        <p className="text-[11px]" style={{ color: G.text }}>{sub}</p>
      </div>
    </div>
  );
}

// ── Tooltip Recharts ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-stone-600 dark:text-stone-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.stroke ?? p.fill }} className="font-medium">
          {p.name} : {p.value} kWh
        </p>
      ))}
    </div>
  );
};

// ── Onglet Score ──────────────────────────────────────────────
function OngletScore() {
  const score       = useDossierStore((s) => s.score);
  const factures    = useDossierStore((s) => s.factures);
  const equipements = useDossierStore((s) => s.equipements);
  const batiment    = useDossierStore((s) => s.batiment);

  if (!score || !batiment) return null;

  const theoriqueMensuel = score.consommationTheoriqueAnnuelle / 12;
  const dataGraphique = factures
    .slice().sort((a, b) => a.mois - b.mois)
    .map((f) => ({
      mois:      NOM_MOIS_COURT[f.mois],
      Réelle:    f.consommationKwh,
      Théorique: Math.round(theoriqueMensuel),
    }));

  const dataEquipements = equipements.map((eq) => ({
    name: eq.nom.length > 14 ? eq.nom.slice(0, 14) + "…" : eq.nom,
    kWh:  Math.round(calcConsommationEquipement(eq)),
  })).sort((a, b) => b.kWh - a.kWh);

  const kpis = [
    { label: "Consom. théorique",     valeur: `${score.consommationTheoriqueAnnuelle}`, unit: "kWh/an",    Icon: Ico.Zap      },
    { label: "Consom. réelle / mois", valeur: `${score.consommationReelleMoyenne}`,     unit: "kWh/mois",  Icon: Ico.Activity },
    { label: "Statut consommation",   valeur: score.statutComparaison,                  unit: "",           Icon: Ico.BarChart },
    { label: "Intensité énergétique", valeur: `${Math.round(score.consommationTheoriqueAnnuelle / batiment.surfaceM2)}`, unit: "kWh/m²/an", Icon: Ico.Home },
  ];

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl p-8 text-center"
           style={{ background: "#f8faf8", border: "1px solid #e8f0e9" }}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative">
          <ScoreEnergetique score={score} taille="lg" detail barre />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex items-center gap-3"
            style={{ borderTop: `3px solid ${G.primary}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: G.light, border: `1px solid ${G.border}`, color: G.primary }}>
              <k.Icon />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-stone-800 dark:text-stone-100 truncate capitalize">{k.valeur}</p>
              {k.unit && <p className="text-[10px]" style={{ color: G.text }}>{k.unit}</p>}
              <p className="text-[10px] truncate" style={{ color: G.text }}>{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Card>
        <SectionHeader Icon={Ico.Activity} title="Consommation réelle vs théorique" sub="12 mois · kWh" />
        <div className="p-5">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dataGraphique} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: G.text }} />
              <YAxis tick={{ fontSize: 11, fill: G.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="Réelle" stroke={G.primary} strokeWidth={2.5}
                dot={{ fill: G.primary, r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }} animationDuration={1200} />
              <Line type="monotone" dataKey="Théorique" stroke="#6DB33F" strokeWidth={2}
                strokeDasharray="6 4" dot={false} animationDuration={1400} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionHeader Icon={Ico.BarChart} title="Consommation par équipement" sub="kWh/an · triés par impact" />
        <div className="p-5">
          <ResponsiveContainer width="100%" height={Math.max(160, dataEquipements.length * 38)}>
            <BarChart data={dataEquipements} layout="vertical" margin={{ left: 10, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={G.border} />
              <XAxis type="number" tick={{ fontSize: 10, fill: G.text }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: G.text }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="kWh" fill={G.primary} radius={[0, 6, 6, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ── Onglet Recommandations ────────────────────────────────────
// ── Onglet Recommandations ────────────────────────────────────
function OngletRecommandations() {
  const recommandations        = useDossierStore((s) => s.recommandations);
  const { entreprisesParReco } = useEntreprises();

  if (recommandations.length === 0) {
    return (
      <Card>
        <div className="text-center py-14 px-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: G.light, border: `1px solid ${G.border}`, color: G.primary }}>
            <Ico.Award />
          </div>
          <p className="text-sm font-bold" style={{ color: G.dark }}>Aucun problème détecté</p>
          <p className="text-xs mt-1" style={{ color: G.text }}>Votre bâtiment respecte toutes les normes RTCM.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader
          Icon={Ico.Wrench}
          title={`Problèmes détectés (${recommandations.length})`}
          sub="Anomalies identifiées · triées par priorité"
        />
        <div className="p-5 space-y-2">
          {recommandations.map((r, i) => (
            <motion.div key={r.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex-shrink-0 mt-0.5">{r.code}</span>
              <span className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed flex-1">{r.description}</span>
            </motion.div>
          ))}
        </div>
      </Card>
      {recommandations.map((r, i) => {
        const ep = entreprisesParReco.find((e) => e.recommandation.code === r.code);
        return (
          <motion.div key={r.code} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            {/* ✅ index retiré — prop inexistante sur EntreprisesPartenairesProps */}
            <RecommandationCard entreprises={ep?.entreprises ?? []} />
          </motion.div>
        );
      })}
    </div>
  );
}
// ── Onglet Rapport ────────────────────────────────────────────
function OngletRapport() {
  const score           = useDossierStore((s) => s.score);
  const batiment        = useDossierStore((s) => s.batiment);
  const recommandations = useDossierStore((s) => s.recommandations);

  const [rapport,     setRapport]     = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [erreur,      setErreur]      = useState<string | null>(null);

  const generer = async () => {
    setErreur(null);
    setIsStreaming(true);
    setRapport("");

    try {
      const prompt = `Tu es un expert en efficacité énergétique au Maroc.
Génère un rapport professionnel pour ce bâtiment :
- Type : ${batiment?.type}
- Surface : ${batiment?.surfaceM2} m²
- Ville : ${batiment?.ville}
- Classe énergétique : ${score?.classe}
- Score : ${score?.valeur}/100
- Consommation : ${score?.consommationTheoriqueAnnuelle} kWh/an
- Problèmes détectés : ${recommandations.length}

Rédige un rapport structuré avec :
1. Résumé de la situation
2. Analyse des points critiques  
3. Recommandations prioritaires
4. Estimation des économies potentielles
Sois précis et professionnel, en français.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
         "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
          "HTTP-Referer":  "http://localhost:5181/",
          "X-Title":       "green2",
        },
        body: JSON.stringify({
          model:      "anthropic/claude-sonnet-4-5",
          max_tokens: 80,
          messages:   [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(err?.error?.message ?? `Erreur HTTP ${response.status}`);
      }

      const data = await response.json() as {
        choices?: { message: { content: string } }[];
      };

      const full = data.choices?.[0]?.message?.content ?? "";
      if (!full) throw new Error("Réponse vide");

      const words = full.split(" ");
      let accumulated = "";
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? "" : " ") + words[i];
        setRapport(accumulated);
        await new Promise((r) => setTimeout(r, 16));
      }

    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: G.light, border: `1px solid ${G.border}`, color: G.primary }}>
            <Ico.Bot />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: G.dark }}>Rapport IA — Claude</h3>
            <p className="text-xs mt-0.5" style={{ color: G.text }}>Analyse professionnelle de votre bâtiment générée par IA</p>
          </div>
        </div>
        <button
          onClick={generer}
          disabled={isStreaming}
          className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 text-white transition-colors flex items-center justify-center gap-2"
          style={{ background: isStreaming ? G.hover : G.primary }}
          onMouseEnter={e => !isStreaming && (e.currentTarget.style.background = G.hover)}
          onMouseLeave={e => !isStreaming && (e.currentTarget.style.background = G.primary)}
        >
          {isStreaming ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Génération en cours…
            </>
          ) : rapport ? "🔄 Régénérer" : "🤖 Générer le rapport IA"}
        </button>
      </div>

      {erreur && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-xl text-xs text-red-700 dark:text-red-300">
          ⚠️ {erreur}
        </div>
      )}

      {(rapport || isStreaming) && (
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: G.light, border: `1px solid ${G.border}`, color: G.primary }}>
              <Ico.FileText />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: G.dark }}>Rapport GreenBuild</h3>
            {isStreaming && (
              <span className="text-[10px] px-2 py-0.5 rounded-full animate-pulse font-medium ml-auto text-white"
                    style={{ background: G.primary }}>
                ● En cours…
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ color: G.text }}>
            {rapport}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                style={{ background: G.primary }}
              />
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Dashboard() {
  const [ongletActif, setOngletActif] = useState<Onglet>("score");
  const navigate = useNavigate();

  const score           = useDossierStore((s) => s.score);
  const batiment        = useDossierStore((s) => s.batiment);
  const recommandations = useDossierStore((s) => s.recommandations);
  const resetDossier    = useDossierStore((s) => s.resetDossier);

  const handleNouveauDossier = () => {
    if (typeof resetDossier === "function") resetDossier();
    navigate("/proprietaire/soumettre");
  };

  const CLASSE_COLOR: Record<string, string> = {
    A: "#1A4A2E", B: "#15803d", C: "#6DB33F",
    D: "#FAC775", E: "#EF9F27", F: "#F0997B", G: "#D85A30",
  };
  const classeColor = score ? (CLASSE_COLOR[score.classe] ?? "#6b7280") : "#6b7280";

  if (!score || !batiment) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style={{ background: G.light, border: `1px solid ${G.border}`, color: G.primary }}>
            <Ico.FileText />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: G.dark }}>Aucun dossier calculé</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: G.text }}>
            Soumettez un dossier via le formulaire pour voir votre tableau de bord énergétique.
          </p>
          <motion.button onClick={handleNouveauDossier} whileHover={{ translateY: -1 }} whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
            style={{ background: G.primary, boxShadow: `0 4px 16px rgba(21,128,61,0.25)` }}
            onMouseEnter={e => (e.currentTarget.style.background = G.hover)}
            onMouseLeave={e => (e.currentTarget.style.background = G.primary)}>
            <Ico.Plus /> Remplir le formulaire →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full px-4 py-1.5 mb-4 shadow-sm"
               style={{ color: G.text }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G.primary }} />
            Portail Propriétaire · Dashboard énergétique
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: G.dark }}>
                Mon Dashboard <span style={{ color: G.primary }}>énergétique</span>
              </h1>
              <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={{ color: G.text }}>
                <span>{batiment.type}</span>
                <span className="text-stone-300">·</span>
                <span>{batiment.surfaceM2} m²</span>
                <span className="text-stone-300">·</span>
                <span>{batiment.ville}</span>
                <span className="text-stone-300">·</span>
                <span className="font-bold text-xs px-2 py-0.5 rounded-lg text-white" style={{ background: classeColor }}>
                  Classe {score.classe}
                </span>
              </p>
            </div>
            <motion.button onClick={handleNouveauDossier} whileHover={{ translateY: -1 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 text-xs font-semibold border px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 transition-all shadow-sm"
              style={{ borderColor: G.border, color: G.text }}>
              <Ico.Plus /> Nouveau dossier
            </motion.button>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto border"
             style={{ background: G.light, borderColor: G.border }}>
          {ONGLETS.map((o) => (
            <button key={o.id} onClick={() => setOngletActif(o.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={ongletActif === o.id ? {
                background: G.primary,
                color: "#fff",
                boxShadow: `0 2px 8px rgba(21,128,61,0.25)`,
              } : { color: G.text }}>
              <span style={{ color: ongletActif === o.id ? "#fff" : G.text }}>
                <o.Icon />
              </span>
              <span className="hidden sm:block">{o.label}</span>
              {o.id === "recommandations" && recommandations.length > 0 && (
                <span className="w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: ongletActif === o.id ? "#fff" : G.primary,
                        color:      ongletActif === o.id ? G.primary : "#fff",
                      }}>
                  {recommandations.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={ongletActif}
            initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {ongletActif === "score"           && <OngletScore />}
            {ongletActif === "recommandations" && <OngletRecommandations />}
            {ongletActif === "budget"          && <PlanBudget />}
            {ongletActif === "rapport"         && <OngletRapport />}
            {ongletActif === "certificat"      && <CertificatPDF />}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 flex-wrap mt-6">
          {["Conforme RTCM", "Certifié AMEE", "Loi 47-09", "Analyse IA"].map((t) => (
            <span key={t} className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: G.light, color: G.primary, border: `1px solid ${G.border}` }}>
              {t}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}