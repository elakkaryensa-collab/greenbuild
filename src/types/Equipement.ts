// ─────────────────────────────────────────────────────────────
// src/types/Equipement.ts
// GreenBuild v3.0 — 2e type (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

/**
 * Classe énergétique d'un appareil électrique
 * null = classe inconnue → déclenche la règle R06
 * A+ → bonus collectif +10 pts si TOUS les appareils sont A+
 */
export type ClasseEnergie = "A+" | "A" | "B" | "C" | "D" | "E" | "G" | null;

/**
 * Interface d'un équipement électrique
 * Remplie à l'Étape 2 du formulaire SoumissionForm.tsx
 *
 * Formule consommation annuelle (Phase 3 scoreService.ts) :
 *   kWh = (puissanceWatts × heuresParJour × joursParAn) / 1000
 *
 * Formule coût mensuel (Phase 8 budgetService.ts) :
 *   coutDH = (puissanceWatts × heuresParJour × 30) / 1000 × tarifONEE
 */
export interface Equipement {
  /** UUID généré automatiquement */
  id: string;

  /** Nom descriptif (ex: "Climatiseur salon", "Chauffe-eau") */
  nom: string;

  /** Puissance en watts (ex: 1500 pour un climatiseur standard) */
  puissanceWatts: number;

  /** Heures d'utilisation par jour en moyenne (ex: 8) */
  heuresParJour: number;

  /** Nombre de jours d'utilisation par an (ex: 365 pour réfrigérateur, 120 pour climatiseur) */
  joursParAn: number;

  /**
   * Classe énergie de l'appareil
   * null déclenche la règle R06 du moteur de règles
   */
  classeEnergie: ClasseEnergie;

  // ── Champs calculés par scoreService.ts ──────────────────────────────────

  /**
   * Consommation annuelle calculée en kWh
   * Calculé par scoreService.ts — ne pas remplir manuellement
   */
  consommationKwhAnnuelle?: number;

  /**
   * Coût mensuel calculé en DH
   * Calculé par budgetService.ts — ne pas remplir manuellement
   */
  coutMensuelDH?: number;
}

/** Équipements présélectionnés dans le formulaire (aide l'utilisateur) */
export const EQUIPEMENTS_PRESELECTIONNES: Omit<
  Equipement,
  "id" | "consommationKwhAnnuelle" | "coutMensuelDH"
>[] = [
  { nom: "Climatiseur",        puissanceWatts: 1500, heuresParJour: 8,  joursParAn: 120, classeEnergie: "A"  },
  { nom: "Chauffe-eau",        puissanceWatts: 2000, heuresParJour: 2,  joursParAn: 365, classeEnergie: "B"  },
  { nom: "Réfrigérateur",      puissanceWatts: 150,  heuresParJour: 24, joursParAn: 365, classeEnergie: "A+" },
  { nom: "Machine à laver",    puissanceWatts: 1200, heuresParJour: 1,  joursParAn: 180, classeEnergie: "A"  },
  { nom: "Télévision",         puissanceWatts: 100,  heuresParJour: 5,  joursParAn: 365, classeEnergie: "B"  },
  { nom: "Éclairage (total)",  puissanceWatts: 300,  heuresParJour: 6,  joursParAn: 365, classeEnergie: null },
];