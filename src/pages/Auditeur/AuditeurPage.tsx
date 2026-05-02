// ─────────────────────────────────────────────────────────────
// src/pages/Auditeur/AuditeurPage.tsx
// GreenBuild v3.0 — Portail Auditeur certifié (Étape 12)
// CDC : "vue côte à côte, annoter, corriger, valider, rejeter"
// ─────────────────────────────────────────────────────────────

import { useState }              from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDossierStore }       from "../../store/dossierStore";
import ScoreEnergetique          from "../../components/ScoreEnergetique";
import { NOM_MOIS }              from "../../types/Facture";

type StatutValidation = "idle" | "valide" | "rejete";

// ── Données mock dossiers en attente ─────────────────────────

const DOSSIERS_MOCK = [
  { id: "DOS-2024-001", proprietaire: "Mohammed Alaoui",    ville: "Casablanca",  surface: 120, classe: "D" as const, date: "12 Jan 2025", urgent: true  },
  { id: "DOS-2024-002", proprietaire: "Fatima Benali",      ville: "Rabat",       surface:  85, classe: "C" as const, date: "15 Jan 2025", urgent: false },
  { id: "DOS-2024-003", proprietaire: "Ahmed Tazi",         ville: "Marrakech",   surface: 200, classe: "E" as const, date: "18 Jan 2025", urgent: true  },
  { id: "DOS-2024-004", proprietaire: "Zineb Chraibi",      ville: "Fès",         surface:  95, classe: "B" as const, date: "20 Jan 2025", urgent: false },
];

// ── Composant principal ───────────────────────────────────────

export default function AuditeurPage() {
  const batiment      = useDossierStore((s) => s.batiment);
  const score         = useDossierStore((s) => s.score);
  const factures      = useDossierStore((s) => s.factures);
  const recommandations = useDossierStore((s) => s.recommandations);

  const [dossierActif, setDossierActif] = useState(DOSSIERS_MOCK[0].id);
  const [statut,       setStatut]       = useState<StatutValidation>("idle");
  const [commentaire,  setCommentaire]  = useState("");
  const [onglet,       setOnglet]       = useState<"donnees" | "mesures">("donnees");

  const valider = () => {
    if (statut !== "idle") return;
    setStatut("valide");
  };

  const rejeter = () => {
    if (!commentaire.trim()) {
      alert("Un commentaire est obligatoire pour rejeter un dossier.");
      return;
    }
    setStatut("rejete");
  };

  const resetValidation = () => {
    setStatut("idle");
    setCommentaire("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Portail Auditeur certifié
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Validation des dossiers de certification énergétique
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-stone-500">{DOSSIERS_MOCK.length} dossiers en attente</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">

        {/* ── Colonne gauche : liste dossiers ──────────────── */}
        <div className="lg:col-span-1">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Dossiers en attente
          </p>
          <div className="space-y-2">
            {DOSSIERS_MOCK.map((d) => (
              <button
                key={d.id}
                onClick={() => { setDossierActif(d.id); resetValidation(); }}
                className={`
                  w-full text-left p-3 rounded-xl border transition-all text-sm
                  ${dossierActif === d.id
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:border-stone-200"
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-stone-400">{d.id}</span>
                  {d.urgent && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="font-medium text-stone-800 dark:text-white text-xs">{d.proprietaire}</p>
                <p className="text-xs text-stone-400">{d.ville} · {d.surface} m²</p>
                <div className="flex items-center justify-between mt-1.5">
                 <span className={`text-xs font-bold px-1.5 py-0.5 rounded
  ${["A", "B"].includes(d.classe) ? "bg-green-100 text-green-800" :
    d.classe === "C" ? "bg-yellow-100 text-yellow-800" :
    "bg-red-100 text-red-800"}`}>
  Classe {d.classe}
</span>
                  <span className="text-[10px] text-stone-400">{d.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Colonne droite : vue côte à côte ─────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Onglets données / mesures */}
          <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl w-fit">
            {(["donnees", "mesures"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOnglet(o)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  onglet === o
                    ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                }`}
              >
                {o === "donnees" ? "📊 Données propriétaire" : "🔧 Mesures technicien"}
              </button>
            ))}
          </div>

          {/* Vue côte à côte */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Bloc gauche : données propriétaire */}
            <div className="bg-white dark:bg-stone-900
                            border border-stone-100 dark:border-stone-800
                            rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Données propriétaire
                </h3>
              </div>

              {batiment ? (
                <div className="space-y-2.5">
                  {[
                    ["Type",          batiment.type],
                    ["Surface",       `${batiment.surfaceM2} m²`],
                    ["Isolation",     batiment.isolation],
                    ["Vitrage",       batiment.vitrage],
                    ["Zone RTCM",     batiment.zoneClimatique],
                    ["Région",        batiment.region],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-stone-400">{k}</span>
                      <span className="font-medium text-stone-700 dark:text-stone-200 capitalize">{v}</span>
                    </div>
                  ))}

                  {score && (
                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                      <ScoreEnergetique score={score} taille="sm" barre={false} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-400 text-center py-8">
                  Aucune donnée disponible.<br />
                  <span className="text-xs">Soumettez un dossier via le portail Propriétaire.</span>
                </p>
              )}
            </div>

            {/* Bloc droit : mesures technicien */}
            <div className="bg-white dark:bg-stone-900
                            border border-stone-100 dark:border-stone-800
                            rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Mesures terrain (technicien)
                </h3>
              </div>

              {/* Données mock technicien */}
              <div className="space-y-2.5">
                {[
                  ["Épaisseur isolation",  "8 cm laine de verre"],
                  ["Type fenêtres",        "Simple vitrage alu"],
                  ["Surface vitrée",       "18 m² (15% façade)"],
                  ["Infiltrations",        "Détectées en cuisine"],
                  ["État CVC",             "Climatiseur > 10 ans"],
                  ["Certificat technicien","TEC-2024-0847"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-stone-400">{k}</span>
                    <span className="font-medium text-amber-700 dark:text-amber-300">{v}</span>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                  <p className="text-xs font-medium text-stone-500 mb-2">Photos terrain</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["🏠","🪟","🔌"].map((icon, i) => (
                      <div key={i} className="aspect-square bg-stone-100 dark:bg-stone-800
                                              rounded-lg flex items-center justify-center text-xl">
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Factures 12 mois ───────────────────────────── */}
          {factures.length === 12 && (
            <div className="bg-white dark:bg-stone-900
                            border border-stone-100 dark:border-stone-800
                            rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                12 Factures ONEE
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {factures
                  .slice()
                  .sort((a, b) => a.mois - b.mois)
                  .map((f) => (
                    <div key={f.mois}
                      className="bg-stone-50 dark:bg-stone-800 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-stone-400">{NOM_MOIS[f.mois].slice(0,3)}</p>
                      <p className="text-xs font-bold text-stone-800 dark:text-white">{f.consommationKwh}</p>
                      <p className="text-[9px] text-stone-400">kWh</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── Recommandations ────────────────────────────── */}
          {recommandations.length > 0 && (
            <div className="bg-white dark:bg-stone-900
                            border border-stone-100 dark:border-stone-800
                            rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
                Problèmes détectés ({recommandations.length})
              </h3>
              <div className="space-y-2">
                {recommandations.map((r) => (
                  <div key={r.code}
                    className="flex items-start gap-3 text-xs p-2.5 rounded-lg
                               bg-stone-50 dark:bg-stone-800">
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px]
                      ${r.priorite === 1 ? "bg-red-100 text-red-700" :
                        r.priorite === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-green-100 text-green-700"}`}>
                      {r.code}
                    </span>
                    <span className="text-stone-600 dark:text-stone-300">{r.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Zone de validation ─────────────────────────── */}
          <AnimatePresence mode="wait">
            {statut === "idle" ? (
              <motion.div
                key="validation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-stone-900
                           border border-stone-100 dark:border-stone-800
                           rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
                  Décision d'audit
                </h3>

                {/* Commentaire */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-stone-500 block mb-1.5">
                    Commentaire de l'auditeur{" "}
                    <span className="text-red-400">(obligatoire pour le rejet)</span>
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={3}
                    placeholder="Observations, corrections, remarques techniques..."
                    className="w-full text-sm border border-stone-200 dark:border-stone-700
                               bg-stone-50 dark:bg-stone-800
                               text-stone-800 dark:text-stone-200
                               rounded-xl px-3 py-2.5 resize-none
                               focus:outline-none focus:ring-2 focus:ring-green-500
                               placeholder:text-stone-300 dark:placeholder:text-stone-600"
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={valider}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold
                               bg-green-600 hover:bg-green-700 text-white
                               transition-colors flex items-center justify-center gap-2"
                  >
                    ✅ Valider le dossier
                  </button>
                  <button
                    onClick={rejeter}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold
                               bg-red-50 hover:bg-red-100 text-red-700
                               dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300
                               border border-red-200 dark:border-red-800
                               transition-colors flex items-center justify-center gap-2"
                  >
                    ❌ Rejeter le dossier
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="resultat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl p-6 text-center border-2 ${
                  statut === "valide"
                    ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700"
                    : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700"
                }`}
              >
                <div className="text-4xl mb-3">{statut === "valide" ? "✅" : "❌"}</div>
                <h3 className={`text-lg font-bold mb-1 ${
                  statut === "valide" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                }`}>
                  Dossier {statut === "valide" ? "validé" : "rejeté"}
                </h3>
                <p className="text-sm text-stone-500 mb-4">
                  {statut === "valide"
                    ? "Le dossier a été transmis à l'AMEE pour émission du certificat."
                    : `Motif : ${commentaire}`}
                </p>
                <button
                  onClick={resetValidation}
                  className="text-xs font-medium text-stone-500 hover:text-stone-700 underline"
                >
                  ← Revenir à la liste
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}