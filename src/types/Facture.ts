// ─────────────────────────────────────────────────────────────
// src/types/Facture.ts
// GreenBuild v3.0 — 3e type (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

/** Numéro de mois (1 = Janvier … 12 = Décembre) */
export type NumeroMois = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Noms des mois pour l'affichage dans le formulaire et les graphiques */
export const NOM_MOIS: Record<NumeroMois, string> = {
  1:  "Janvier",
  2:  "Février",
  3:  "Mars",
  4:  "Avril",
  5:  "Mai",
  6:  "Juin",
  7:  "Juillet",
  8:  "Août",
  9:  "Septembre",
  10: "Octobre",
  11: "Novembre",
  12: "Décembre",
};

/** Noms courts pour les graphiques Recharts */
export const NOM_MOIS_COURT: Record<NumeroMois, string> = {
  1:"Jan", 2:"Fév", 3:"Mar", 4:"Avr", 5:"Mai", 6:"Jun",
  7:"Jul", 8:"Aoû", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Déc",
};

/**
 * Interface d'une facture ONEE mensuelle
 * Remplie à l'Étape 3 du formulaire SoumissionForm.tsx
 *
 * RÈGLE ABSOLUE CDC :
 * Les 12 mois doivent TOUS être renseignés.
 * Le score A–G est calculé sur la MOYENNE de ces 12 factures,
 * jamais sur un seul mois isolé. (baseCalcul: "12mois")
 */
export interface Facture {
  /** Numéro du mois (1–12) */
  mois: NumeroMois;

  /** Année de la facture (ex: 2024) */
  annee: number;

  /** Consommation électrique en kWh ce mois-ci */
  consommationKwh: number;

  /** Montant total de la facture en DH (dirhams marocains) */
  montantDH: number;

  /** URL du fichier PDF/image uploadé (optionnel) */
  fichierUrl?: string;
}

/**
 * Résultat  de l'analyse des 12 factures (Phase 4 scoreService.ts)
 */
export interface AnalyseFactures {
  /** Moyenne mensuelle de consommation sur 12 mois (kWh/mois) */
  moyenneMensuelleKwh: number;

  /** Consommation réelle totale sur l'année (kWh/an) */
  totalAnnuelKwh: number;

  /** Montant moyen mensuel en DH */
  montantMoyenDH: number;

  /** Mois avec la consommation la plus basse */
  moisMinKwh: NumeroMois;

  /** Mois avec la consommation la plus haute */
  moisMaxKwh: NumeroMois;

  /** Variation en % entre le mois min et max — règle R04 si > 30% */
  variationPourcentage: number;

  /** Liste des mois de pic (consommation > moyenne × 1.2) */
  moisPic: NumeroMois[];
}