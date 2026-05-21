// ─────────────────────────────────────────────────────────────
// src/types/Score.ts
// GreenBuild v3.0 — 4e type (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

/**
 * Classe énergétique officielle A–G
 * Barème CDC Phase 6 :
 *   A : score ≥ 85   (Très performant)
 *   B : 70 ≤ score < 85
 *   C : 55 ≤ score < 70
 *   D : 40 ≤ score < 55
 *   E : 25 ≤ score < 40
 *   F : 10 ≤ score < 25
 *   G : score < 10   (Extrêmement énergivore)
 */
export type ClasseEnergetique = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/**
 * Statut de comparaison théorique vs réel (Phase 5 scoreService.ts)
 *   normal          : réel ≤ théorique
 *   eleve           : 1.0× < réel ≤ 1.2× du théorique → pénalité −15 pts
 *   surconsommation : réel > 1.2× du théorique         → pénalité −25 pts
 */
export type StatutComparaison = "normal" | "eleve" | "surconsommation";

/**
 * Détail transparent du calcul du score
 * Permet d'expliquer le résultat à l'utilisateur
 */
export interface DetailScore {
  /** Base de départ (toujours 100) */
  scoreBase: 100;

  /** Pénalité isolation : 0 (moyen/fort) ou −20 (faible) */
  penaliteIsolation: 0 | -20;

  /** Pénalité vitrage : 0 (double/triple) ou −15 (simple) */
  penaliteVitrage: 0 | -15;

  /**
   * Pénalité surconsommation :
   *   0   → statut "normal"
   *   −15 → statut "élevé"
   *   −25 → statut "surconsommation"
   */
  penaliteSurconsommation: 0 | -15 | -25;

  /** Bonus équipements : +10 si TOUS les appareils sont classe A+ */
  bonusEquipements: 0 | 10;

  /** Bonus vitrage : +5 si double vitrage */
  bonusVitrage: 0 | 5;

  /** Bonus isolation : +8 si isolation forte */
  bonusIsolation: 0 | 8;
}

/**
 * Interface du score énergétique annuel
 *
 * ⚠️  RÈGLE ABSOLUE CDC :
 * Le champ `baseCalcul` doit toujours valoir "12mois".
 * Le score est calculé sur la MOYENNE des 12 factures ONEE,
 * jamais sur un seul mois isolé.
 * scoreService.ts doit retourner cet objet avec baseCalcul: "12mois"
 * sinon les tests Vitest échoueront.
 */
export interface Score {
  /** Valeur numérique du score, clampée entre 0 et 100 */
  valeur: number;

  /** Classe énergétique A–G déduite de la valeur */
  classe: ClasseEnergetique;

  /** Consommation théorique annuelle totale (somme des équipements) en kWh/an */
  consommationTheoriqueAnnuelle: number;

  /** Consommation réelle moyenne mensuelle sur 12 factures en kWh/mois */
  consommationReelleMoyenne: number;

  /** Statut issu de la comparaison théorique vs réel (Phase 5) */
  statutComparaison: StatutComparaison;

  /**
   * Base du calcul — TOUJOURS "12mois"
   * Garantit que le score n'a jamais été calculé sur 1 seul mois
   */
  baseCalcul: "12mois";

  /** Détail transparent des pénalités et bonus appliqués */
  detail: DetailScore;
}

// ── Helpers constants ───────────────────────────────────────────────────────

/** Seuils de score pour chaque classe */
export const SEUILS_CLASSES: Record<ClasseEnergetique, { min: number; max: number }> = {
  A: { min: 85, max: 100 },
  B: { min: 70, max: 84  },
  C: { min: 55, max: 69  },
  D: { min: 40, max: 54  },
  E: { min: 25, max: 39  },
  F: { min: 10, max: 24  },
  G: { min: 0,  max: 9   },
};

/** Couleurs Tailwind associées à chaque classe (pour ScoreEnergetique.tsx) */
export const COULEURS_CLASSES: Record<ClasseEnergetique, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-green-100",  text: "text-green-900",  border: "border-green-400"  },
  B: { bg: "bg-lime-100",   text: "text-lime-900",   border: "border-lime-400"   },
  C: { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-400" },
  D: { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-400" },
  E: { bg: "bg-red-100",    text: "text-red-900",    border: "border-red-400"    },
  F: { bg: "bg-pink-100",   text: "text-pink-900",   border: "border-pink-400"   },
  G: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-400" },
};

/** Labels français pour les classes  */
export const LABELS_CLASSES: Record<ClasseEnergetique, string> = {
  A: "Très performant",
  B: "Performant",
  C: "Assez performant",
  D: "Peu performant",
  E: "Énergivore",
  F: "Très énergivore",
  G: "Extrêmement énergivore",
};