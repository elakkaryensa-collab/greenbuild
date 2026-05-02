// ─────────────────────────────────────────────────────────────
// src/hooks/useScore.ts
// GreenBuild v3.0 — Hook déclencheur du pipeline (Étape 10)
// ─────────────────────────────────────────────────────────────

import { useCallback }         from "react";
import { useNavigate }         from "react-router-dom";
import {
  useDossierStore,
  selectPipelineDone,
  selectFormulaireComplet,
  selectNbProblèmesUrgents,
} from "../store/dossierStore";

/**
 * Hook exposé aux composants qui ont besoin de déclencher
 * le pipeline de calcul et lire les résultats.
 *
 * Usage dans SoumissionForm.tsx (étape finale) :
 *   const { soumettre, isCalculating } = useScore();
 *   await soumettre(); // déclenche calculerTout() + navigate dashboard
 */
export function useScore() {
  const navigate        = useNavigate();
  const calculerTout    = useDossierStore((s) => s.calculerTout);
  const statutCalcul    = useDossierStore((s) => s.statutCalcul);
  const erreurCalcul    = useDossierStore((s) => s.erreurCalcul);
  const score           = useDossierStore((s) => s.score);
  const recommandations = useDossierStore((s) => s.recommandations);
  const pipelineDone    = useDossierStore(selectPipelineDone);
  const formulaireOk    = useDossierStore(selectFormulaireComplet);
  const nbUrgents       = useDossierStore(selectNbProblèmesUrgents);

  /**
   * Lance le pipeline complet et redirige vers le dashboard.
   * À appeler au submit de SoumissionForm (étape 3).
   */
  const soumettre = useCallback(async () => {
    await calculerTout();

    // Rediriger vers le dashboard uniquement si le calcul a réussi
    const state = useDossierStore.getState();
    if (state.statutCalcul === "done") {
      navigate("/proprietaire/dashboard");
    }
  }, [calculerTout, navigate]);

  return {
    // Actions
    soumettre,

    // Statuts
    isCalculating: statutCalcul === "calculating",
    isError:       statutCalcul === "error",
    isDone:        pipelineDone,
    formulaireOk,
    erreurCalcul,

    // Résultats
    score,
    recommandations,
    nbProblèmesUrgents: nbUrgents,
  };
}