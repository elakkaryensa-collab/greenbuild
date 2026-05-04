// ─────────────────────────────────────────────────────────────
// src/types/PlanBudget.ts
// GreenBuild v3.0 — 7e type (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

/**
 * Une action concrète de réduction d'usage pour un équipement
 * Générée par budgetService.ts (Phase 8)
 *
 * Exemple :
 *   "Réduire le climatiseur de 8h à 5h/jour → économie 168 DH/mois"
 */
export interface ActionBudget {
  /** UUID de l'équipement concerné */
  equipementId: string;

  /** Nom de l'équipement (ex: "Climatiseur salon") */
  equipementNom: string;

  /** Description de l'action à effectuer */
  action: string;

  /** Heures d'utilisation actuelles par jour */
  heuresActuelles: number;

  /** Heures recommandées après réduction (−30%) */
  heuresRecommandees: number;

  /** Économie mensuelle générée par cette action en DH */
  economieMensuelDH: number;

  /** Niveau de difficulté de mise en œuvre */
  difficulte: "facile" | "moyen" | "difficile";
}

/**
 * Plan complet de réduction d'usage selon un budget cible mensuel
 * Généré par budgetService.ts (Phase 8) si l'utilisateur a saisi un budget
 * Affiché dans PlanBudget.tsx
 *
 * Fonctionnement :
 *   1. Calcule l'écart = factureMoyenne - budgetCible
 *   2. Trie les équipements par coût mensuel décroissant
 *   3. Pour chaque équipement, génère une action de −30% d'usage
 *   4. Accumule jusqu'à couvrir l'écart
 */
export interface PlanBudget {
  /** Budget mensuel cible saisi par l'utilisateur en DH */
  budgetCibleDH: number;

  /** Facture mensuelle actuelle (moyenne des 12 mois) en DH */
  factureActuelleDH: number;

  /** Écart à combler = factureActuelle − budgetCible (en DH) */
  ecartDH: number;

  /** Liste  des actions recommandées, ordonnées du plus impactant au moins */
  actions: ActionBudget[];

  /** Somme totale des économies générées par toutes les actions en DH/mois */
  economiesTotalesDH: number;

  /**
   * true si economiesTotalesDH ≥ ecartDH
   * Indique si l'objectif est atteignable sans faire de travaux
   */
  objectifAtteint: boolean;
}