// ─────────────────────────────────────────────────────────────
// src/hooks/useEntreprises.ts
// GreenBuild v3.0 — Hook entreprises partenaires (CDC Étape 10)
// ─────────────────────────────────────────────────────────────

import { useMemo }                        from "react";
import { useDossierStore }                from "../store/dossierStore";
import { getEntreprisesParProbleme,
         formatNoteEntreprise }           from "../services/entrepriseService";
import type { Entreprise }                from "../types/Entreprise";
import type { Recommandation,
              SpecialiteEntreprise }      from "../types/Recommandation";
import type { RegionMaroc }              from "../types/Batiment";

// ── Types exposés ─────────────────────────────────────────────

export interface EntreprisesParReco {
  recommandation: Recommandation;
  entreprises:    Entreprise[];
}

/**
 * Hook exposé à EntreprisesPartenaires.tsx et RecommandationCard.tsx.
 *
 * Retourne pour chaque recommandation détectée les 3 meilleures
 * entreprises certifiées filtrées par spécialité + région.
 *
 * Usage :
 *   const { entreprisesParReco, getEntreprisesPour } = useEntreprises();
 */
export function useEntreprises() {
  const entreprisesParRegle = useDossierStore((s) => s.entreprisesParRegle);
  const recommandations     = useDossierStore((s) => s.recommandations);
  const batiment            = useDossierStore((s) => s.batiment);

  // Map complète code → entreprises (depuis le store calculé)
  const entreprisesParReco = useMemo<EntreprisesParReco[]>(() => {
    return recommandations.map((reco) => ({
      recommandation: reco,
      entreprises:    entreprisesParRegle[reco.code] ?? [],
    }));
  }, [recommandations, entreprisesParRegle]);

  /**
   * Recherche à la demande pour une spécialité et région données.
   * Utile quand on veut des entreprises sans recommandation associée.
   */
  const getEntreprisesPour = (
    specialite: SpecialiteEntreprise,
    region?: RegionMaroc
  ): Entreprise[] => {
    const r = region ?? batiment?.region;
    if (!r) return [];
    return getEntreprisesParProbleme(specialite, r);
  };

  /** Nommmmbre total d'entreprises suggérées (toutes recos confondues) */
  const nbTotal = useMemo(
    () => entreprisesParReco.reduce((s, e) => s + e.entreprises.length, 0),
    [entreprisesParReco]
  );

  return {
    entreprisesParReco,
    getEntreprisesPour,
    formatNote: formatNoteEntreprise,
    nbTotal,
    hasEntreprises: nbTotal > 0,
    region: batiment?.region,
  };
}