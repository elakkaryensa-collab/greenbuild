// ─────────────────────────────────────────────────────────────
// src/services/entrepriseService.ts
// GreenBuild v3.0 — Filtre top-3 entreprises par problème
// Étape 8 CDC
//
// Logique CDC :
//   getEntreprisesParProbleme(specialite, region)
//   → filtre par specialiteEntreprise === specialite
//   → trie par noteClients décroissant
//   → retourne les 3 premières certifiées...
// ─────────────────────────────────────────────────────────────

import type { Entreprise }           from "../types/Entreprise";
import type { Recommandation,
              SpecialiteEntreprise } from "../types/Recommandation";
import type { RegionMaroc }          from "../types/Batiment";
import { ENTREPRISES_PARTENAIRES }   from "../data/entreprisesPartenaires";

// ── Constante ────────────────────────────────────────────────
const NB_ENTREPRISES_PAR_RECO = 3;

// ══════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE
// ══════════════════════════════════════════════════════════════

/**
 * Retourne les 3 meilleures entreprises certifiées pour
 * un problème donné, filtrées par spécialité et région.
 *
 * Si moins de 3 entreprises dans la région, complète avec
 * des entreprises d'autres régions (fallback national).
 *
 * @param specialite  Spécialité requise (isolation, vitrage, electricite…)
 * @param region      Région du bâtiment audité
 * @returns           Top 3 entreprises triées par noteClients DESC
 */
export function getEntreprisesParProbleme(
  specialite: SpecialiteEntreprise,
  region:     RegionMaroc
): Entreprise[] {
  // Toutes les entreprises certifiées de la bonne spécialité
  const pool = ENTREPRISES_PARTENAIRES.filter(
    (e) => e.specialite === specialite && e.certifiee
  );

  // Tri par note décroissante
  const triees = [...pool].sort((a, b) => b.noteClients - a.noteClients);

  // Priorité 1 : entreprises de la même région
  const memeRegion = triees.filter((e) => e.region === region);

  // Priorité 2 : autres régions (fallback)
  const autresRegions = triees.filter((e) => e.region !== region);

  // Fusion : région d'abord, puis autres
  const finale = [...memeRegion, ...autresRegions];

  return finale.slice(0, NB_ENTREPRISES_PAR_RECO);
}

// ══════════════════════════════════════════════════════════════
// CARTE COMPLÈTE : recommandation → entreprises
// ══════════════════════════════════════════════════════════════

/**
 * Pour une liste de recommandations, retourne une Map
 * associant chaque code de règle à ses 3 entreprises.
 *
 * Ex : { "R01" → [EntrepriseA, EntrepriseB, EntrepriseC], "R02" → [...] }
 *
 * Utilisée par dossierStore.calculerTout() et EntreprisesPartenaires.tsx
 */
export function getEntreprisesParRecommandations(
  recommandations: Recommandation[],
  region:          RegionMaroc
): Record<string, Entreprise[]> {
  const carte: Record<string, Entreprise[]> = {};

  for (const reco of recommandations) {
    carte[reco.code] = getEntreprisesParProbleme(
      reco.specialiteEntreprise,
      region
    );
  }

  return carte;
}

// ══════════════════════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════════════════════

/**
 * Formate la note d'une entreprise avec les étoiles.
 * Ex : 4.8 → "★★★★★ 4.8 (214 avis)"
 */
export function formatNoteEntreprise(entreprise: Entreprise): string {
  const etoilesPlein = Math.floor(entreprise.noteClients);
  const etoiles = "★".repeat(etoilesPlein) + "☆".repeat(5 - etoilesPlein);
  return `${etoiles} ${entreprise.noteClients} (${entreprise.nbAvis} avis)`;
}

/**
 * Retourne toutes les entreprises d'une spécialité donnée.
 * Utile pour la page Analyste et les statistiques Admin AMEE.
 */
export function getEntreprisesParSpecialite(
  specialite: SpecialiteEntreprise
): Entreprise[] {
  return ENTREPRISES_PARTENAIRES.filter(
    (e) => e.specialite === specialite && e.certifiee
  ).sort((a, b) => b.noteClients - a.noteClients);
}

/**
 * Retourne le nombre total d'entreprises par spécialité.
 * Utile pour les statistiques du dashboard Admin AMEE.
 */
export function compterParSpecialite(): Record<SpecialiteEntreprise, number> {
  return ENTREPRISES_PARTENAIRES.reduce(
    (acc, e) => {
      if (e.certifiee) acc[e.specialite] = (acc[e.specialite] ?? 0) + 1;
      return acc;
    },
    {} as Record<SpecialiteEntreprise, number>
  );
}