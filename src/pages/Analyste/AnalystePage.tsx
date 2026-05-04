// ─────────────────────────────────────────────────────────────
// src/pages/Analyste/AnalystePage.tsx
// GreenBuild v3.0 — Portail Analyste IA
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie,
  // ✅ CORRECTION 1 : types Recharts importés pour les formatters
  type TooltipProps,
} from "recharts";
import { MOCK_REGIONS } from "../../data/normesRTCM";
import { COULEURS_CLASSES } from "../../types/Score";
import type { ClasseEnergetique } from "../../types/Score";

// ✅ CORRECTION 2 : suppression import "framer-motion"
// framer-motion n'est pas installé dans CRA par défaut → remplacé par CSS

// ── Données tendances nationales (mock 12 mois) ───────────────

const TENDANCES_MENSUELLES = [
  { mois: "Jan", dossiers: 32,  certifies: 18, scoreMoyen: 58 },
  { mois: "Fév", dossiers: 28,  certifies: 21, scoreMoyen: 60 },
  { mois: "Mar", dossiers: 41,  certifies: 29, scoreMoyen: 61 },
  { mois: "Avr", dossiers: 55,  certifies: 38, scoreMoyen: 62 },
  { mois: "Mai", dossiers: 48,  certifies: 35, scoreMoyen: 63 },
  { mois: "Jun", dossiers: 62,  certifies: 44, scoreMoyen: 64 },
  { mois: "Jul", dossiers: 71,  certifies: 52, scoreMoyen: 65 },
  { mois: "Aoû", dossiers: 59,  certifies: 43, scoreMoyen: 64 },
  { mois: "Sep", dossiers: 83,  certifies: 61, scoreMoyen: 66 },
  { mois: "Oct", dossiers: 97,  certifies: 74, scoreMoyen: 67 },
  { mois: "Nov", dossiers: 108, certifies: 82, scoreMoyen: 68 },
  { mois: "Déc", dossiers: 124, certifies: 96, scoreMoyen: 69 },
];

// Répartition par classe nationale
const REPARTITION_CLASSES = [
  { classe: "A", nb: 89,  fill: "#166534" },
  { classe: "B", nb: 201, fill: "#4d7c0f" },
  { classe: "C", nb: 312, fill: "#a16207" },
  { classe: "D", nb: 287, fill: "#9a3412" },
  { classe: "E", nb: 143, fill: "#991b1b" },
  { classe: "F", nb: 62,  fill: "#831843" },
  { classe: "G", nb: 14,  fill: "#4c1d95" },
];

// ── KPIs analytiques ──────────────────────────────────────────

const TOTAL_DOSSIERS  = TENDANCES_MENSUELLES.reduce((s, t) => s + t.dossiers, 0);
const TOTAL_CERTIFIES = TENDANCES_MENSUELLES.reduce((s, t) => s + t.certifies, 0);
const SCORE_MOYEN_NAT = Math.round(
  TENDANCES_MENSUELLES.reduce((s, t) => s + t.scoreMoyen, 0) / TENDANCES_MENSUELLES.length
);
const PROGRESSION = Math.round(
  ((TENDANCES_MENSUELLES[11].scoreMoyen - TENDANCES_MENSUELLES[0].scoreMoyen)
  / TENDANCES_MENSUELLES[0].scoreMoyen) * 100
);

// ── Couleurs hex par classe ───────────────────────────────────

const COULEURS_HEX: Record<ClasseEnergetique, string> = {
  A: "#166534", B: "#4d7c0f", C: "#a16207",
  D: "#9a3412", E: "#991b1b", F: "#831843", G: "#4c1d95",
};

// ✅ CORRECTION 3 : types des onglets déclarés explicitement (pas de "as const" inline dans JSX)
type OngletId = "tendances" | "regions" | "classes" | "plan";

interface OngletConfig {
  id: OngletId;
  label: string;
}

const ONGLETS: OngletConfig[] = [
  { id: "tendances", label: "📈 Tendances" },
  { id: "regions",   label: "🗺️ Régions"  },
  { id: "classes",   label: "📊 Classes"  },
  { id: "plan",      label: "🤖 Plan IA"  },
];

// ✅ CORRECTION 4 : types corrects pour les formatters Recharts
type FormatterFn = TooltipProps<number, string>["formatter"];

const formatScore: FormatterFn = (value) => [`${value}/100`, "Score moyen"];
const formatRegion: FormatterFn = (value) => [`${value}/100`, "Score moyen"];

// ✅ CORRECTION 5 : type correct pour le label du PieChart
interface PieLabelProps {
  classe?: string;
  percent?: number;
}

const renderPieLabel = ({ classe, percent }: PieLabelProps): string => {
  if (!classe || percent === undefined) return "";
  return `${classe} ${(percent * 100).toFixed(0)}%`;
};

// ══════════════════════════════════════════════════════════════
// SECTION RAPPORT CLAUDE NATIONAL
// ══════════════════════════════════════════════════════════════

function RapportNational() {
  const [apiKey,      setApiKey]      = useState<string>("");
  const [rapport,     setRapport]     = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [erreur,      setErreur]      = useState<string | null>(null);

  const genererPlanNational = async (): Promise<void> => {
    if (!apiKey.trim().startsWith("sk-ant-")) {
      setErreur("Clé API invalide — doit commencer par sk-ant-");
      return;
    }

    setErreur(null);
    setIsStreaming(true);
    setRapport("");

    const prompt = `Tu es un expert en politique énergétique du bâtiment au Maroc, conseiller de l'AMEE.

Voici les données nationales GreenBuild actuelles :
- Total dossiers soumis : ${TOTAL_DOSSIERS}
- Total certifiés : ${TOTAL_CERTIFIES} (taux : ${Math.round((TOTAL_CERTIFIES / TOTAL_DOSSIERS) * 100)}%)
- Score moyen national : ${SCORE_MOYEN_NAT}/100
- Progression score sur l'année : +${PROGRESSION}%
- Régions les plus performantes : Casablanca-Settat (B, 71pts), Rabat-Salé-Kénitra (B, 74pts), Souss-Massa (B, 76pts)
- Régions à améliorer : Béni Mellal-Khénifra (E, 35pts), Drâa-Tafilalet (E, 38pts)
- Répartition classes : A(89), B(201), C(312), D(287), E(143), F(62), G(14)

Rédige un plan d'action national structuré en 3 parties :

1. **Analyse de la situation nationale** : interprète ces chiffres, identifie les régions prioritaires et les tendances positives.

2. **Plan d'action national 2025-2026** : propose 5 actions concrètes chiffrées pour améliorer le score moyen national de 5 points en 12 mois.

3. **Recommandations politiques** : propose 3 mesures réglementaires ou incitatives pour accélérer la transition énergétique dans le bâtiment au Maroc, en lien avec la Loi 47-09 et la Stratégie Énergétique 2030.

Ton rapport doit être professionnel, en français, avec des données chiffrées concrètes.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
          // ✅ header requis pour l'accès direct depuis le navigateur
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1200,
          stream:     true,
          messages:   [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        // ✅ CORRECTION 6 : typage correct de l'erreur API
        interface ApiError { error?: { message?: string } }
        const err: ApiError = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Erreur HTTP ${response.status}`);
      }

      // ✅ CORRECTION 7 : vérification explicite de response.body avant getReader()
      if (!response.body) {
        throw new Error("Le serveur n'a pas retourné de flux de données");
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();

      // ✅ CORRECTION 8 : boucle de streaming correcte avec gestion des fragments
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lignes = buffer.split("\n");

        // Garder le dernier fragment incomplet dans le buffer
        buffer = lignes.pop() ?? "";

        for (const ligne of lignes) {
          if (!ligne.startsWith("data: ")) continue;
          const data = ligne.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data) as {
              type: string;
              delta?: { text?: string };
            };
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              setRapport((prev) => prev + parsed.delta!.text!);
            }
          } catch {
            // fragment JSON incomplet — ignoré normalement
          }
        }
      }
    } catch (err) {
      // ✅ CORRECTION 9 : gestion propre du type Error
      setErreur(err instanceof Error ? err.message : "Erreur réseau inconnue");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Clé API */}
      <div className="card" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#f59e0b", marginBottom: "8px" }}>
          🔑 Clé API Claude (Anthropic)
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-api03-…"
          className="input"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
          Ta clé n'est jamais stockée — elle reste uniquement en mémoire de la session.
        </p>
      </div>

      {/* Bouton générer */}
      <button
        onClick={genererPlanNational}
        disabled={isStreaming || !apiKey.trim()}
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", opacity: (isStreaming || !apiKey.trim()) ? 0.5 : 1 }}
      >
        {isStreaming ? (
          <>
            <span className="spinner" style={{ width: "16px", height: "16px" }} />
            Génération du plan national…
          </>
        ) : rapport ? "🔄 Régénérer le plan" : "🤖 Générer le plan national IA"}
      </button>

      {/* Erreur */}
      {erreur && (
        <div className="card" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.3)", padding: "12px 16px" }}>
          <p style={{ fontSize: "13px", color: "#ef4444" }}>❌ {erreur}</p>
        </div>
      )}

      {/* Résultat streaming */}
      {(rapport || isStreaming) && (
        <div className="card animate-fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Plan d'action national — Claude IA
            </h3>
            {isStreaming && (
              <span className="badge badge-green" style={{ marginLeft: "auto" }}>
                <span className="dot pulse" />
                En cours…
              </span>
            )}
          </div>
          <div style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
            fontWeight: 300,
          }}>
            {rapport}
            {isStreaming && (
              <span style={{
                display: "inline-block",
                width: "2px",
                height: "16px",
                background: "var(--green)",
                marginLeft: "2px",
                verticalAlign: "text-bottom",
                animation: "pulse 1s infinite",
              }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════

export default function AnalystePage() {
  const [onglet, setOnglet] = useState<OngletId>("tendances");

  const KPIS = [
    { label: "Dossiers annuels",    val: TOTAL_DOSSIERS,         icon: "📋", color: "var(--color-technicien)"  },
    { label: "Certifiés",           val: TOTAL_CERTIFIES,         icon: "🏅", color: "var(--green)"             },
    { label: "Score moyen nat.",    val: `${SCORE_MOYEN_NAT}/100`,icon: "⚡", color: "var(--color-auditeur)"   },
    { label: "Progression annuelle",val: `+${PROGRESSION}%`,     icon: "📈", color: "var(--color-analyste)"   },
  ];

  // ✅ CORRECTION 10 : style inline pour les tooltips Recharts (thème sombre cohérent)
  const tooltipStyle = {
    contentStyle: {
      fontSize: "12px",
      borderRadius: "8px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)",
    },
  };

  return (
    <div className="page">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Portail Analyste IA</h1>
          <p>Tendances nationales · Plan IA · Stratégie Énergétique 2030</p>
        </div>
        <span className="badge badge-purple">
          <span className="dot pulse" />
          Données 2024
        </span>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid-4 mb-6">
        {KPIS.map((k, i) => (
          <div
            key={k.label}
            className="stat-card animate-fade-in"
            // ✅ CORRECTION 11 : délai CSS via style inline à la place de framer-motion
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span style={{ fontSize: "24px" }}>{k.icon}</span>
            <span className="stat-value" style={{ color: k.color }}>{k.val}</span>
            <span className="stat-label">{k.label}</span>
          </div>
        ))}
      </div>

      {/* ── Onglets ──────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: "4px",
        padding: "4px",
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "24px",
        overflowX: "auto",
      }}>
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={onglet === o.id ? "btn btn-secondary" : "btn btn-ghost"}
            style={{ flexShrink: 0, fontSize: "12px", padding: "7px 14px" }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          ONGLET : TENDANCES
         ══════════════════════════════════════════════════════ */}
      {onglet === "tendances" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Dossiers soumis vs certifiés */}
          <div className="card">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-primary)" }}>
              Dossiers soumis vs certifiés — 12 mois
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TENDANCES_MENSUELLES}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="dossiers"  stroke="#3b82f6" fill="rgba(59,130,246,0.15)"  strokeWidth={2} name="Dossiers" />
                <Area type="monotone" dataKey="certifies" stroke="#10b981" fill="rgba(16,185,129,0.15)"  strokeWidth={2} name="Certifiés" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Évolution score moyen */}
          <div className="card">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-primary)" }}>
              Évolution du score moyen national
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={TENDANCES_MENSUELLES}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis domain={[50, 80]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                {/* ✅ CORRECTION 12 : formatter typé correctement */}
                <Tooltip {...tooltipStyle} formatter={formatScore} />
                <Line
                  type="monotone"
                  dataKey="scoreMoyen"
                  stroke="var(--green)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--green)" }}
                  name="Score moyen"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ONGLET : RÉGIONS
         ══════════════════════════════════════════════════════ */}
      {onglet === "regions" && (
        <div className="card">
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-primary)" }}>
            Score moyen par région
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={[...MOCK_REGIONS].sort((a, b) => b.scoreMoyen - a.scoreMoyen)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              {/* ✅ CORRECTION 13 : types explicites pour les axes */}
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis
                type="category"
                dataKey="nom"
                tick={{ fontSize: 9, fill: "var(--text-muted)" }}
                width={155}
                tickFormatter={(v: string) => v.length > 20 ? v.slice(0, 20) + "…" : v}
              />
              <Tooltip {...tooltipStyle} formatter={formatRegion} />
              <Bar dataKey="scoreMoyen" radius={[0, 4, 4, 0]}>
                {[...MOCK_REGIONS]
                  .sort((a, b) => b.scoreMoyen - a.scoreMoyen)
                  .map((r) => (
                    <Cell key={r.id} fill={COULEURS_HEX[r.classemoyenne]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ONGLET : CLASSES
         ══════════════════════════════════════════════════════ */}
      {onglet === "classes" && (
        <div className="grid-2">

          {/* Camembert */}
          <div className="card">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-primary)" }}>
              Répartition nationale par classe
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={REPARTITION_CLASSES}
                  dataKey="nb"
                  nameKey="classe"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  // ✅ CORRECTION 14 : label typé correctement
                  label={renderPieLabel}
                  labelLine={false}
                >
                  {REPARTITION_CLASSES.map((entry) => (
                    <Cell key={entry.classe} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  {...tooltipStyle}
                  // ✅ CORRECTION 15 : formatter PieChart typé
                  formatter={(value: number, name: string) => [`${value} bâtiments`, `Classe ${name}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Barres de progression par classe */}
          <div className="card">
            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "var(--text-primary)" }}>
              Détail par classe
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {REPARTITION_CLASSES.map((r) => {
                const c     = COULEURS_CLASSES[r.classe as ClasseEnergetique];
                const total = REPARTITION_CLASSES.reduce((s, x) => s + x.nb, 0);
                const pct   = Math.round((r.nb / total) * 100);
                return (
                  <div key={r.classe} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Badge classe */}
                    <span
                      className={`${c.bg} ${c.text}`}
                      style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      {r.classe}
                    </span>
                    {/* Barre */}
                    <div style={{ flex: 1, height: "8px", background: "var(--bg-hover)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: r.fill,
                          borderRadius: "4px",
                          transition: "width 0.7s ease",
                        }}
                      />
                    </div>
                    {/* Valeur */}
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", minWidth: "70px", textAlign: "right" }}>
                      {r.nb} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ONGLET : PLAN IA
         ══════════════════════════════════════════════════════ */}
      {onglet === "plan" && <RapportNational />}

    </div>
  );
}