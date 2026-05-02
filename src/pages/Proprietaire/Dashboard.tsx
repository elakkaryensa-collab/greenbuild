// ─────────────────────────────────────────────────────────────
// src/pages/Proprietaire/Dashboard.tsx
// GreenBuild v3.0 — Dashboard résultats complet (CDC Étape A)
// Score A-G animé + Recharts 12 mois + Recommandations +
// Plan budget + Rapport Claude streaming + Certificat PDF
// ─────────────────────────────────────────────────────────────

import { useState }                   from "react";
import { Link }                       from "react-router-dom";
import { motion }                     from "framer-motion";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

import { useDossierStore }            from "../../store/dossierStore";
import { useClaude }                  from "../../hooks/useClaude";
import { useEntreprises }             from "../../hooks/useEntreprises";
import ScoreEnergetique               from "../../components/ScoreEnergetique";
import RecommandationCard             from "../../components/RecommandationCard";
import PlanBudget                     from "../../components/PlanBudget";
import CertificatPDF                  from "../../components/CertificatPDF";
import { NOM_MOIS_COURT }             from "../../types/Facture";
import { calcConsommationEquipement } from "../../services/scoreService";

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

// Onglets du dashboard
type Onglet = "score" | "recommandations" | "budget" | "rapport" | "certificat";

const ONGLETS: { id: Onglet; label: string; icon: string }[] = [
  { id: "score",           label: "Score",           icon: "⚡" },
  { id: "recommandations", label: "Recommandations", icon: "🔧" },
  { id: "budget",          label: "Plan budget",     icon: "💰" },
  { id: "rapport",         label: "Rapport IA",      icon: "🤖" },
  { id: "certificat",      label: "Certificat",      icon: "🏅" },
];

// ══════════════════════════════════════════════════════════════
// ONGLET SCORE — graphiques Recharts
// ══════════════════════════════════════════════════════════════

function OngletScore() {
  const score       = useDossierStore((s) => s.score);
  const factures    = useDossierStore((s) => s.factures);
  const equipements = useDossierStore((s) => s.equipements);
  const batiment    = useDossierStore((s) => s.batiment);

  if (!score || !batiment) return null;

  // Données graphique 12 mois — réel vs théorique
  const theoriqueMensuel = score.consommationTheoriqueAnnuelle / 12;
  const dataGraphique = factures
    .slice().sort((a, b) => a.mois - b.mois)
    .map((f) => ({
      mois:      NOM_MOIS_COURT[f.mois],
      Réelle:    f.consommationKwh,
      Théorique: Math.round(theoriqueMensuel),
    }));

  // Données graphique équipements
  const dataEquipements = equipements.map((eq) => ({
    name: eq.nom.length > 12 ? eq.nom.slice(0, 12) + "…" : eq.nom,
    kWh:  Math.round(calcConsommationEquipement(eq)),
  })).sort((a, b) => b.kWh - a.kWh);

  return (
    <div className="space-y-6">

      {/* Score central */}
      <div className="bg-white dark:bg-stone-900
                      border border-stone-100 dark:border-stone-800
                      rounded-2xl p-8 text-center">
        <ScoreEnergetique score={score} taille="lg" detail barre />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Consom. théorique",  valeur: `${score.consommationTheoriqueAnnuelle} kWh/an`,  icon: "📐", color: "text-blue-600   dark:text-blue-400"   },
          { label: "Consom. réelle moy.", valeur: `${score.consommationReelleMoyenne} kWh/mois`,    icon: "📊", color: "text-stone-700 dark:text-stone-300"  },
          { label: "Statut conso.",       valeur: score.statutComparaison,                          icon: score.statutComparaison === "normal" ? "✅" : "⚠️", color: score.statutComparaison === "normal" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400" },
          { label: "kWh/m²/an",          valeur: `${Math.round(score.consommationTheoriqueAnnuelle / batiment.surfaceM2)}`, icon: "🏠", color: "text-purple-600 dark:text-purple-400" },
        ].map((k) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-stone-900
                       border border-stone-100 dark:border-stone-800
                       rounded-2xl p-4 text-center"
          >
            <span className="text-xl block mb-1">{k.icon}</span>
            <span className={`text-sm font-extrabold block capitalize ${k.color}`}>{k.valeur}</span>
            <span className="text-xs text-stone-400 mt-0.5 block">{k.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Graphique 12 mois */}
      <div className="bg-white dark:bg-stone-900
                      border border-stone-100 dark:border-stone-800
                      rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
          Consommation réelle vs théorique — 12 mois (kWh)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dataGraphique} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone" dataKey="Réelle"
              stroke="#16a34a" strokeWidth={2}
              dot={{ fill: "#16a34a", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone" dataKey="Théorique"
              stroke="#86efac" strokeWidth={2} strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique équipements */}
      <div className="bg-white dark:bg-stone-900
                      border border-stone-100 dark:border-stone-800
                      rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
          Consommation par équipement (kWh/an)
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dataEquipements} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} width={80} />
            <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
            <Bar dataKey="kWh" fill="#16a34a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ONGLET RAPPORT CLAUDE
// ══════════════════════════════════════════════════════════════

function OngletRapport() {
  const {
    generer, apiKey, setApiKey, apiKeyValide,
    isStreaming, isError, erreur, rapport, hasRapport, peutGenerer,
  } = useClaude();

  return (
    <div className="space-y-4">

      {/* Saisie clé API */}
      <div className="bg-white dark:bg-stone-900
                      border border-stone-100 dark:border-stone-800
                      rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl">🔑</span>
          <div>
            <h3 className="text-sm font-semibold text-stone-800 dark:text-white">
              Clé API Claude (Anthropic)
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Saisie dans l'interface uniquement — jamais stockée dans le code.
              Obtenez votre clé sur{" "}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                className="text-green-600 underline">console.anthropic.com</a>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="sk-ant-api03-…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 text-sm border border-stone-200 dark:border-stone-700
                       bg-stone-50 dark:bg-stone-800
                       rounded-xl px-3 py-2.5 font-mono
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       text-stone-800 dark:text-stone-200"
          />
          {apiKeyValide && (
            <span className="flex items-center text-green-600 text-xs font-medium">✓ Valide</span>
          )}
        </div>

        <button
          onClick={generer}
          disabled={!peutGenerer}
          className="mt-3 w-full py-3 rounded-xl text-sm font-semibold
                     bg-green-600 hover:bg-green-700 disabled:opacity-50
                     text-white transition-colors flex items-center justify-center gap-2"
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
          ) : "🤖 Générer le rapport IA"}
        </button>
      </div>

      {/* Erreur */}
      {isError && erreur && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800
                        rounded-xl text-xs text-red-700 dark:text-red-300">
          ⚠️ {erreur}
        </div>
      )}

      {/* Rapport streamé */}
      {(isStreaming || hasRapport) && (
        <div className="bg-white dark:bg-stone-900
                        border border-stone-100 dark:border-stone-800
                        rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📋</span>
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Rapport professionnel GreenBuild
            </h3>
            {isStreaming && (
              <span className="text-[10px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300
                               px-2 py-0.5 rounded-full animate-pulse font-medium ml-auto">
                ● En cours…
              </span>
            )}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-stone-700 dark:text-stone-300
                            leading-relaxed bg-transparent p-0 border-0">
              {rapport}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 align-middle"
                />
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE DASHBOARD
// ══════════════════════════════════════════════════════════════

export default function Dashboard() {
  const [ongletActif, setOngletActif] = useState<Onglet>("score");

  const score           = useDossierStore((s) => s.score);
  const batiment        = useDossierStore((s) => s.batiment);
  const recommandations = useDossierStore((s) => s.recommandations);
  const { entreprisesParReco } = useEntreprises();

  // Redirection si pas de données
  if (!score || !batiment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📋</p>
        <h2 className="text-lg font-bold text-stone-800 dark:text-white mb-2">
          Aucun dossier calculé
        </h2>
        <p className="text-sm text-stone-400 mb-6">
          Soumettez d'abord un dossier via le formulaire pour voir votre dashboard.
        </p>
        <Link to="/proprietaire"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
                     text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors no-underline">
          🏠 Remplir le formulaire
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Mon Dashboard énergétique
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {batiment.type} · {batiment.surfaceM2} m² · {batiment.ville} ·{" "}
            <span className={`font-semibold ${
              score.classe === "A" || score.classe === "B" ? "text-green-600" :
              score.classe === "C" ? "text-amber-600" : "text-red-600"
            }`}>Classe {score.classe}</span>
          </p>
        </div>
        <Link to="/proprietaire"
          className="text-xs font-medium text-stone-500 border border-stone-200 dark:border-stone-700
                     px-3 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800
                     transition-colors no-underline">
          ← Nouveau dossier
        </Link>
      </div>

      {/* ── Navigation onglets ───────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-6 overflow-x-auto">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOngletActif(o.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
              transition-all whitespace-nowrap flex-shrink-0
              ${ongletActif === o.id
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              }
            `}
          >
            <span className="text-base leading-none">{o.icon}</span>
            <span className="hidden sm:block">{o.label}</span>
            {o.id === "recommandations" && recommandations.length > 0 && (
              <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold
                               rounded-full flex items-center justify-center">
                {recommandations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Contenu onglet actif ─────────────────────────────── */}
      <motion.div
        key={ongletActif}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {ongletActif === "score" && <OngletScore />}

        {ongletActif === "recommandations" && (
          <div className="space-y-4">
            {recommandations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Aucun problème détecté
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Votre bâtiment respecte toutes les normes RTCM.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-stone-500">
                    <span className="font-semibold text-stone-800 dark:text-white">
                      {recommandations.length} problème{recommandations.length > 1 ? "s" : ""}
                    </span>{" "}
                    détecté{recommandations.length > 1 ? "s" : ""} — triés par priorité
                  </p>
                </div>
                {recommandations.map((r, i) => {
                  const ep = entreprisesParReco.find((e) => e.recommandation.code === r.code);
                  return (
                    <RecommandationCard
                      key={r.code}
                      recommandation={r}
                      entreprises={ep?.entreprises ?? []}
                      index={i}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}

        {ongletActif === "budget"      && <PlanBudget />}
        {ongletActif === "rapport"     && <OngletRapport />}
        {ongletActif === "certificat"  && <CertificatPDF />}
      </motion.div>

    </div>
  );
}