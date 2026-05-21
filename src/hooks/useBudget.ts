// ─────────────────────────────────────────────────────────────
// src/hooks/useBudget.ts
// GreenBuild v3.0 — Hook plan budget cible (Étape 10)
// ─────────────────────────────────────────────────────────────

import { useMemo }               from "react";
import { useDossierStore,
         selectHasPlanBudget }   from "../store/dossierStore";
import { trierParDifficulte }    from "../services/budgetService";
import type { ActionBudget }     from "../types/PlanBudget";

/**
 * Hook exposé au composant PlanBudget.tsx.
 * Retourne le plan budgétaire avec les actions triées
 * et des statistiques calculées.
 *
 * Usage :
 *   const { plan, actionsParDifficulte, pourcentageAtteint } = useBudget();
 */
export function useBudget() {
  const planBudget    = useDossierStore((s) => s.planBudget);
  const hasPlan       = useDossierStore(selectHasPlanBudget);
  const setBudgetCible = useDossierStore((s) => s.setBudgetCible);
  const budgetCibleDH = useDossierStore((s) => s.budgetCibleDH);

  // Actions triées par difficulté (facile → difficile)
  const actionsParDifficulte = useMemo<ActionBudget[]>(() => {
    if (!planBudget) return [];
    return trierParDifficulte(planBudget.actions);
  }, [planBudget]);

  // Pourcentage de l'écart comblé (0-100)
  const pourcentageAtteint = useMemo(() => {
    if (!planBudget || planBudget.ecartDH === 0) return 100;
    return Math.min(
      100,
      Math.round((planBudget.economiesTotalesDH / planBudget.ecartDH) * 100)
    );
  }, [planBudget]);

  // Économies classées par difficulté
  const economieFacile = useMemo(() =>
    actionsParDifficulte
      .filter((a) => a.difficulte === "facile")
      .reduce((s, a) => s + a.economieMensuelDH, 0),
    [actionsParDifficulte]
  );

  return {
    // Données mmm
    plan:               planBudget,
    hasPlan,
    budgetCibleDH,
    actionsParDifficulte,

    // Indicateurs
    pourcentageAtteint,
    economieFacile:     Math.round(economieFacile),
    nbActionsFaciles:   actionsParDifficulte.filter((a) => a.difficulte === "facile").length,
    objectifAtteint:    planBudget?.objectifAtteint ?? false,

    // Action
    setBudgetCible,
  };
}