// ─────────────────────────────────────────────────────────────
// src/components/RecommandationCard.tsx
// GreenBuild v3.0 — Carte recommandation + entreprises
// ─────────────────────────────────────────────────────────────

import { useState }                   from "react";
import { motion, AnimatePresence }    from "framer-motion";
import type { Recommandation }        from "../types/Recommandation";
import type { Entreprise }            from "../types/Entreprise";
import { PRIORITE_CONFIG }            from "../types/Recommandation";
import { formatROI }                  from "../services/roiService";
import EntreprisesPartenaires         from "./EntreprisesPartenaires";

interface RecommandationCardProps {
  recommandation: Recommandation;
  entreprises:    Entreprise[];
  index:          number;
}



export default function RecommandationCard({
  recommandation: r,
  entreprises,
  index,
}: RecommandationCardProps) {
  const [ouvert, setOuvert] = useState(false);
  const prio = PRIORITE_CONFIG[r.priorite];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white dark:bg-stone-900
                 border border-stone-100 dark:border-stone-800
                 rounded-2xl overflow-hidden
                 hover:border-stone-200 dark:hover:border-stone-700
                 transition-all duration-200 shadow-sm"
    >
      {/* ── Bande priorité ──────────────────────────────────── */}
      <div className={`h-1 w-full ${
        r.priorite === 1 ? "bg-red-500" :
        r.priorite === 2 ? "bg-orange-400" : "bg-green-400"
      }`} />

      <div className="p-5">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Code règle */}
            <span className="text-xs font-mono font-bold
                             bg-stone-100 dark:bg-stone-800
                             text-stone-500 dark:text-stone-400
                             px-2 py-1 rounded-lg flex-shrink-0 mt-0.5">
              {r.code}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white leading-snug">
                {r.description}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                💡 {r.solution}
              </p>
            </div>
          </div>
          {/* Badge priorité */}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                            flex-shrink-0 border ${prio.bg} ${prio.text} ${prio.border}`}>
            {prio.label}
          </span>
        </div>

        {/* ── Métriques financières ───────────────────────── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <MetriqueBox
            label="Coût estimé"
            valeur={`${(r.coutMinMAD / 1000).toFixed(0)}k–${(r.coutMaxMAD / 1000).toFixed(0)}k MAD`}
            icon="💰"
          />
          <MetriqueBox
            label="Économies/an"
            valeur={`${r.economiesAnnuellesDH.toLocaleString("fr-MA")} DH`}
            icon="📈"
            positif
          />
          <MetriqueBox
            label="ROI estimé"
            valeur={formatROI(r.roiAnnees)}
            icon="⏱️"
          />
        </div>

        {/* Réduction CO₂ */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-stone-400">🌿</span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Réduction CO₂ estimée :{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {r.reductionCO2KgAn} kg/an
            </span>
          </span>
        </div>

        {/* ── Toggle entreprises ───────────────────────────── */}
        <button
          onClick={() => setOuvert((v) => !v)}
          className="w-full flex items-center justify-between
                     py-2.5 px-3 rounded-xl text-xs font-medium
                     bg-stone-50 dark:bg-stone-800
                     hover:bg-stone-100 dark:hover:bg-stone-700
                     text-stone-600 dark:text-stone-300
                     border border-stone-100 dark:border-stone-700
                     transition-all duration-150"
        >
          <span className="flex items-center gap-2">
            <span>🏢</span>
            {entreprises.length} entreprise{entreprises.length > 1 ? "s" : ""} certifiée{entreprises.length > 1 ? "s" : ""} disponible{entreprises.length > 1 ? "s" : ""}
          </span>
          <motion.span
            animate={{ rotate: ouvert ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-stone-400 text-sm"
          >
            ▼
          </motion.span>
        </button>

        {/* ── Entreprises partenaires (collapsible) ────────── */}
        <AnimatePresence>
          {ouvert && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <EntreprisesPartenaires
                  entreprises={entreprises}
                  titre="Entreprises certifiées pour ce type de travaux"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Sous-composant métrique ───────────────────────────────────

function MetriqueBox({
  label, valeur, icon, positif = false,
}: {
  label:    string;
  valeur:   string;
  icon:     string;
  positif?: boolean;
}) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800
                    border border-stone-100 dark:border-stone-700
                    rounded-xl p-2.5 text-center">
      <span className="text-base block mb-1">{icon}</span>
      <p className={`text-xs font-bold leading-tight ${
        positif ? "text-green-600 dark:text-green-400" : "text-stone-700 dark:text-stone-200"
      }`}>
        {valeur}
      </p>
      <p className="text-[10px] text-stone-400 mt-0.5">{label}</p>
    </div>
  );
}