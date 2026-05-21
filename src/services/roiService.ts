// ─────────────────────────────────────────────────────────────
// src/services/roiService.ts
// GreenBuild v3.0 — Calcul ROI et économies financières
// Étape 8 CDC
//
// Formules CDC :
//   ROI (années) = coûtTravaux / économiesAnnuellesDH
//   économiesDH  = (consomAvant - consomAprès) × tarifONEE × 12
// ─────────────────────────────────────────────────────────────

import { TARIFS_ONEE } from "../data/tarifsONEE";

// ══════════════════════════════════════════════════════════════
// Types internes
// ══════════════════════════════════════════════════════════════

export interface ResultatROI {
  /** Coût des travaux en MAD */
  coutTravauxMAD: number;
  /** Économies annuelles estimées en DH */
  economiesAnnuellesDH: number;
  /** Retour sur investissement en années */
  roiAnnees: number;
  /** Économies cumulées sur 10 ans en DH */
  economiesCumulees10AnsDAH: number;
  /** Réduction de la facture mensuelle en DH */
  reductionFactureMensuelDH: number;
  /** Rentable dès la première année */
  rentableAnnee1: boolean;
}

// ══════════════════════════════════════════════════════════════
// Fonctions de calcul
// ══════════════════════════════════════════════════════════════


/**
 * Calcule le ROI en années.
 * Formule CDC : ROI = coûtTravaux / économiesAnnuellesDH
 * Retourne Infinity si économies = 0 (aucun gain possible).
 */
export function calcROI(
  coutTravauxMAD: number,
  economiesAnnuellesDH: number
): number {
  if (economiesAnnuellesDH <= 0) return Infinity;
  const roi = coutTravauxMAD / economiesAnnuellesDH;
  return Math.round(roi * 10) / 10;
}

/**
 * Calcule les économies annuelles en DH à partir
 * de la réduction de consommation électrique.
 *
 * Formule CDC :
 *   économiesDH = (consomAvant - consomAprès) × tarifONEE × 12
 */
export function calcEconomiesAnnuelles(
  consommationAvantKwhMois: number,
  consommationApresKwhMois: number
): number {
  const reductionMensuelle = consommationAvantKwhMois - consommationApresKwhMois;
  if (reductionMensuelle <= 0) return 0;
  const economies = reductionMensuelle * TARIFS_ONEE.tarifMoyen * 12;
  return Math.round(economies * 10) / 10;
}

/**
 * Calcule la réduction de CO₂ en kg/an.
 * Facteur d'émission moyen réseau électrique marocain : 0.74 kgCO₂/kWh
 */
export function calcReductionCO2(reductionKwhAn: number): number {
  const FACTEUR_CO2_MAROC = 0.74; // kgCO₂/kWh — réseau marocain
  return Math.round(reductionKwhAn * FACTEUR_CO2_MAROC);
}

/**
 * Analyse ROI complète pour un projet de travaux.
 * Retourne tous les indicateurs financiers et environnementaux.
 */
export function analyserROI(
  coutTravauxMAD: number,
  consommationAvantKwhMois: number,
  consommationApresKwhMois: number
): ResultatROI {
  const economiesAnnuellesDH = calcEconomiesAnnuelles(
    consommationAvantKwhMois,
    consommationApresKwhMois
  );

  const roiAnnees = calcROI(coutTravauxMAD, economiesAnnuellesDH);

  const economiesCumulees10AnsDAH = Math.round(economiesAnnuellesDH * 10);

  const reductionFactureMensuelDH = Math.round(
    (consommationAvantKwhMois - consommationApresKwhMois) * TARIFS_ONEE.tarifMoyen
  );

  return {
    coutTravauxMAD,
    economiesAnnuellesDH,
    roiAnnees,
    economiesCumulees10AnsDAH,
    reductionFactureMensuelDH,
    rentableAnnee1: roiAnnees <= 1,
  };
}

/**
 * Formate le ROI pour l'affichage.
 * Ex : 4.5 → "4 ans 6 mois" | Infinity → "Non rentable"
 */
export function formatROI(roiAnnees: number): string {
  if (!isFinite(roiAnnees)) return "Non rentable";
  const annees = Math.floor(roiAnnees);
  const mois   = Math.round((roiAnnees - annees) * 12);
  if (mois === 0) return `${annees} an${annees > 1 ? "s" : ""}`;
  if (annees === 0) return `${mois} mois`;
  return `${annees} an${annees > 1 ? "s" : ""} ${mois} mois`;
}