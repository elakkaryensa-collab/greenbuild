// ─────────────────────────────────────────────────────────────
// src/components/PlanBudget.tsx
// GreenBuild v3.0 — Jauge budget + liste actions DH
// CDC : "barre de progression factureMoyenne → budgetCible"
// ─────────────────────────────────────────────────────────────

import { motion }              from "framer-motion";
import { useBudget }           from "../hooks/useBudget";
import type { ActionBudget }   from "../types/PlanBudget";

// ── Badge difficulté ──────────────────────────────────────────

const DIFFICULTE_CONFIG = {
  facile:    { label: "Facile",     color: "bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200",  dot: "bg-green-500"  },
  moyen:     { label: "Moyen",      color: "bg-amber-100  text-amber-800  dark:bg-amber-900  dark:text-amber-200",  dot: "bg-amber-500"  },
  difficile: { label: "Difficile",  color: "bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200",    dot: "bg-red-500"    },
};

// ── Carte action ──────────────────────────────────────────────

function CarteAction({ action, index, cumulDH, ecartDH }: {
  action:  ActionBudget;
  index:   number;
  cumulDH: number;
  ecartDH: number;
}) {
  const cfg     = DIFFICULTE_CONFIG[action.difficulte];
  const couvre  = cumulDH >= ecartDH; // L'écart est déjà comblé avant cette action

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border transition-all
        ${couvre
          ? "bg-stone-50/50 dark:bg-stone-900/30 border-stone-100 dark:border-stone-800 opacity-60"
          : "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:border-green-200 dark:hover:border-green-800"
        }
      `}
    >
      {/* Numéro */}
      <div className={`
        w-7 h-7 rounded-full flex items-center justify-center
        text-xs font-bold flex-shrink-0 mt-0.5
        ${couvre
          ? "bg-stone-200 dark:bg-stone-700 text-stone-400"
          : "bg-green-600 text-white"
        }
      `}>
        {index + 1}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 dark:text-white leading-snug">
          {action.equipementNom}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
          {action.action}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <span className="text-[10px] text-stone-400">
            {action.heuresActuelles}h → {action.heuresRecommandees}h/jour
          </span>
        </div>
      </div>

      {/* Économie */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-green-600 dark:text-green-400">
          −{action.economieMensuelDH} DH
        </p>
        <p className="text-[10px] text-stone-400">par mois</p>
      </div>
    </motion.div>
  );
}

// ── Composant principal ───────────────────────────────────────

export default function PlanBudget() {
  const {
    plan, hasPlan, pourcentageAtteint,
    actionsParDifficulte, economieFacile,
    nbActionsFaciles, objectifAtteint,
  } = useBudget();

  if (!hasPlan || !plan) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-2xl mb-2">💰</p>
        <p className="text-sm">Aucun budget cible défini.</p>
        <p className="text-xs mt-1">Saisissez un objectif de facture mensuelle dans le formulaire.</p>
      </div>
    );
  }

 // Calcul du cumul pour chaque action
// Calcul du cumul pour chaque action
const actionsAvecCumul = actionsParDifficulte.map((a, i, arr) => {
  const prev = arr.slice(0, i).reduce((s, x) => s + x.economieMensuelDH, 0);
  return { action: a, cumulDH: prev + a.economieMensuelDH, couvreAvant: prev >= plan.ecartDH };
});
  return (
    <div className="space-y-6">

      {/* ── Jauge principale ──────────────────────────────── */}
      <div className="bg-white dark:bg-stone-900
                      border border-stone-100 dark:border-stone-800
                      rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
              Plan budget cible
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Sans travaux — uniquement en réduisant l'usage
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            objectifAtteint
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          }`}>
            {objectifAtteint ? "✓ Objectif atteignable" : "⚠ Objectif partiel"}
          </span>
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center">
            <p className="text-lg font-extrabold text-red-500">{plan.factureActuelleDH} DH</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Facture actuelle</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-stone-400">↓ {plan.ecartDH} DH</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Écart à combler</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-green-600">{plan.budgetCibleDH} DH</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Budget cible</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <div className="flex justify-between text-xs text-stone-400 mb-1.5">
            <span>Économies générées par le plan</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {plan.economiesTotalesDH} / {plan.ecartDH} DH
            </span>
          </div>
          <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                objectifAtteint ? "bg-green-500" : "bg-amber-400"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${pourcentageAtteint}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
            <span>Facture actuelle</span>
            <span className="font-medium">{pourcentageAtteint}% de l'objectif couvert</span>
            <span>Budget cible</span>
          </div>
        </div>

        {/* Quick stats */}
        {nbActionsFaciles > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950
                          border border-green-100 dark:border-green-900
                          rounded-xl flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <p className="text-xs text-green-800 dark:text-green-200">
              <span className="font-semibold">{nbActionsFaciles} action{nbActionsFaciles > 1 ? "s" : ""} facile{nbActionsFaciles > 1 ? "s" : ""}</span>{" "}
              peuvent vous économiser{" "}
              <span className="font-semibold">{economieFacile} DH/mois</span> immédiatement
            </p>
          </div>
        )}
      </div>

      {/* ── Liste des actions ─────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
          Actions recommandées — du plus simple au plus impactant
        </h4>
        <div className="space-y-2.5">
          {actionsAvecCumul.map(({ action, cumulDH }, i) => (
            <CarteAction
              key={action.equipementId}
              action={action}
              index={i}
              cumulDH={cumulDH}
              ecartDH={plan.ecartDH}
            />
          ))}
        </div>
      </div>

      {/* ── Total économies ───────────────────────────────── */}
      <div className="bg-green-50 dark:bg-green-950
                      border border-green-200 dark:border-green-800
                      rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              Total économies mensuelles
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              soit {plan.economiesTotalesDH * 12} DH d'économies annuelles
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
              {plan.economiesTotalesDH} DH
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">par mois</p>
          </div>
        </div>
      </div>

    </div>
  );
}