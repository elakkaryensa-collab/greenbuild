// ─────────────────────────────────────────────────────────────
// src/types/Batiment.ts
// GreenBuild v3.0 — 1er type à définir (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

/** Type de bâtiment — détermine les seuils RTCM applicables */
export type TypeBatiment = "residentiel" | "tertiaire" | "industriel";

/**
 * Niveau d'isolation thermique
 * Impact score Phase 6 : faible = −20 pts | fort = +8 pts
 */
export type TypeIsolation = "faible" | "moyen" | "fort";

/**
 * Type de vitrage
 * Impact score Phase 6 : simple = −15 pts | double = +5 pts
 */
export type TypeVitrage = "simple" | "double" | "triple";

/**
 * Zone climatique RTCM (Règlement Thermique de Construction au Maroc)
 * Seuils kWh/m²/an définis dans src/data/normesRTCM.ts
 * - cotiere      : façade atlantique/méditerranéenne (Casablanca, Agadir…)
 * - continentale : plaines intérieures (Marrakech, Fès, Meknès…)
 * - montagne     : zones d'altitude (Ifrane, Azrou, Midelt…)
 */
export type ZoneClimatique = "cotiere" | "continentale" | "montagne";

/** 12 régions administratives officielles du Maroc */
export type RegionMaroc =
  | "Tanger-Tétouan-Al Hoceïma"
  | "Oriental"
  | "Fès-Meknès"
  | "Rabat-Salé-Kénitra"
  | "Béni Mellal-Khénifra"
  | "Casablanca-Settat"
  | "Marrakech-Safi"
  | "Drâa-Tafilalet"
  | "Souss-Massa"
  | "Guelmim-Oued Noun"
  | "Laâyoune-Sakia El Hamra"
  | "Dakhla-Oued Ed-Dahab";

/**
 * Interface principale du bâtiment
 * Remplie à l'Étape 1 du formulaire SoumissionForm.tsx
 */
export interface Batiment {
  /** UUID généré automatiquement */
  id: string;

  type: TypeBatiment;

  /** Surface habitable en m² — doit être > 0 */
  surfaceM2: number;

  /** Matériaux de construction (ex: "béton armé", "brique") */
  materiaux: string;

  /** Niveau d'isolation — pénalité ou bonus dans le score A–G */
  isolation: TypeIsolation;

  /** Type de vitrage — pénalité ou bonus dans le score A–G */
  vitrage: TypeVitrage;

  /** Zone climatique RTCM — règle R05 */
  zoneClimatique: ZoneClimatique;

  /** Région marocaine — filtre les entreprises partenaires */
  region: RegionMaroc;

  ville: string;
  adresse?: string;
  anneeConstruction?: number;
  nombreOccupants?: number;
}