// ─────────────────────────────────────────────────────────────
// src/types/Recommandation.ts
// GreenBuild v3.0 — 5e type (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

/**
 * Priorité d'une recommandation
 *   1 = Urgent   (rouge)   — agir dans le mois
 *   2 = Important (orange) — agir dans les 6 mois
 *   3 = Conseillé (vert)   — amélioration souhaitée
 */
export type Priorite = 1 | 2 | 3;

/**
 * Spécialité de l'entreprise requise pour résoudre le problème
 * Utilisée par entrepriseService.ts pour filtrer les partenaires
 */
export type SpecialiteEntreprise =
  | "isolation"
  | "vitrage"
  | "electricite"
  | "thermique"
  | "solaire";

/**
 * Codes des règles du moteur (regleService.ts)
 * R01–R06 correspondent aux problèmes détectables
 */
export type CodeRegle = "R01" | "R02" | "R03" | "R04" | "R05" | "R06" | "R07";

/**
 * Interface d'une recommandation de travaux
 * Générée par regleService.ts pour chaque règle déclenchée
 * Affichée dans RecommandationCard.tsx avec les entreprises partenaires
 */
export interface Recommandation {
  /** Code de la règle déclenchée (R01–R07) */
  code: CodeRegle;

  /** Description du problème détecté (ex: "Vitrage simple détecté") */
  description: string;

  /** Action recommandée (ex: "Remplacer par du double vitrage") */
  solution: string;

  /** Priorité d'intervention (1=urgent, 2=important, 3=conseillé) */
  priorite: Priorite;

  /** Coût minimum estimé des travaux en MAD (dirhams) */
  coutMinMAD: number;

  /** Coût maximum estimé des travaux en MAD */
  coutMaxMAD: number;

  /** Économies annuelles estimées après travaux en DH */
  economiesAnnuellesDH: number;

  /** Retour sur investissement calculé par roiService.ts */
  roiAnnees: number;

  /** Réduction d'émissions CO₂ estimée en kg/an */
  reductionCO2KgAn: number;

  /**
   * Spécialité de l'entreprise qui peut réaliser ces travaux
   * Utilisée par entrepriseService.getEntreprisesParProbleme()
   */
  specialiteEntreprise: SpecialiteEntreprise;
}

// ── Données statiques des règles ────────────────────────────────────────────

/** Descriptions et solutions par code de règle (base pour regleService.ts) */
export const REGLES_DESCRIPTIONS: Record<
  CodeRegle,
  { description: string; solution: string; specialite: SpecialiteEntreprise; priorite: Priorite }
> = {
  R01: {
    description: "Vitrage simple détecté — pertes thermiques élevées par les fenêtres",
    solution:    "Remplacer par du double vitrage à faible émissivité",
    specialite:  "vitrage",
    priorite:    2,
  },
  R02: {
    description: "Isolation faible — pertes thermiques par murs et toiture",
    solution:    "Renforcer l'isolation par laine de verre ou polystyrène extrudé",
    specialite:  "isolation",
    priorite:    1,
  },
  R03: {
    description: "Surconsommation électrique — consommation réelle > 120% du théorique",
    solution:    "Audit complet des équipements électriques et détection de fuites",
    specialite:  "electricite",
    priorite:    1,
  },
  R04: {
    description: "Variation de consommation anormale entre mois (> 30%)",
    solution:    "Analyser les équipements saisonniers et optimiser l'usage",
    specialite:  "electricite",
    priorite:    3,
  },
  R05: {
    description: "Non-conformité RTCM — consommation kWh/m² dépasse le seuil de la zone",
    solution:    "Audit énergétique complet pour mise en conformité Loi 47-09",
    specialite:  "thermique",
    priorite:    1,
  },
  R06: {
    description: "Équipements sans classe énergie identifiée",
    solution:    "Remplacer par des appareils certifiés classe A ou A+",
    specialite:  "electricite",
    priorite:    2,
  },
  R07: {
    description: "Budget mensuel cible non atteint — facture supérieure à l'objectif",
    solution:    "Appliquer le plan de réduction d'usage par équipement",
    specialite:  "electricite",
    priorite:    2,
  },
};

/** Labelss et couleurs Tailwind par niveau de priorité */
export const PRIORITE_CONFIG: Record<Priorite, { label: string; bg: string; text: string; border: string }> = {
  1: { label: "Urgent",    bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300"    },
  2: { label: "Important", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  3: { label: "Conseillé", bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300"  },
};