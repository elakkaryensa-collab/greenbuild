// ─────────────────────────────────────────────────────────────
// src/services/regleService.ts
// GreenBuild v3.0 — Moteur de règles R01–R07
// Étape 8 CDC
// ─────────────────────────────────────────────────────────────

import type { Batiment }       from "../types/Batiment";
import type { Equipement }     from "../types/Equipement";
import type { Facture }        from "../types/Facture";
import type { Score }          from "../types/Score";
import type { Recommandation } from "../types/Recommandation";
import { REGLES_DESCRIPTIONS, PRIORITE_CONFIG } from "../types/Recommandation";
import { NORMES_RTCM }         from "../data/tarifsONEE";
import { analyserFactures }    from "./scoreService";
import { calcROI }             from "./roiService";

type CodeRegle = keyof typeof REGLES_DESCRIPTIONS;

const COUTS: Record<string, {
  coutMinMAD: number; coutMaxMAD: number;
  economiesAnnuellesDH: number; reductionCO2KgAn: number;
}> = {
  R01: { coutMinMAD:  8_000, coutMaxMAD: 20_000, economiesAnnuellesDH: 2_400, reductionCO2KgAn: 320 },
  R02: { coutMinMAD: 12_000, coutMaxMAD: 35_000, economiesAnnuellesDH: 3_200, reductionCO2KgAn: 480 },
  R03: { coutMinMAD:  2_000, coutMaxMAD:  8_000, economiesAnnuellesDH: 1_800, reductionCO2KgAn: 240 },
  R04: { coutMinMAD:    500, coutMaxMAD:  2_000, economiesAnnuellesDH:   900, reductionCO2KgAn: 120 },
  R05: { coutMinMAD: 15_000, coutMaxMAD: 50_000, economiesAnnuellesDH: 4_500, reductionCO2KgAn: 600 },
  R06: { coutMinMAD:  3_000, coutMaxMAD: 15_000, economiesAnnuellesDH: 1_500, reductionCO2KgAn: 200 },
  R07: { coutMinMAD:      0, coutMaxMAD:    500, economiesAnnuellesDH:   600, reductionCO2KgAn:  80 },
};

function buildReco(code: CodeRegle): Recommandation {
  const desc   = REGLES_DESCRIPTIONS[code];
  const couts  = COUTS[code];
  const coutMoyen = (couts.coutMinMAD + couts.coutMaxMAD) / 2;
  return {
    code,
    description:          desc.description,
    solution:             desc.solution,
    priorite:             desc.priorite,
    coutMinMAD:           couts.coutMinMAD,
    coutMaxMAD:           couts.coutMaxMAD,
    economiesAnnuellesDH: couts.economiesAnnuellesDH,
    roiAnnees:            calcROI(coutMoyen, couts.economiesAnnuellesDH),
    reductionCO2KgAn:     couts.reductionCO2KgAn,
    specialiteEntreprise: desc.specialite,
  };
}

/**
 * Analyse le dossier complet et retourne les recommandations
 * triées par priorité (1=urgent en premier).
 *
 * R01 : vitrage simple       → pertes thermiques fenêtres     (vitrage)
 * R02 : isolation faible     → pertes thermiques murs/toit    (isolation)
 * R03 : surconsommation>20%  → audit électrique               (electricite)
 * R04 : variation mois>30%   → comportement anormal           (electricite)
 * R05 : kWh/m²>seuil RTCM   → non-conformité Loi 47-09      (thermique)
 * R06 : appareils sans classe → équipements énergivores       (electricite)
 * R07 : facture>budgetCible  → objectif non atteint           (electricite)
 */
export function detecterProblemes(
  batiment:      Batiment,
  score:         Score,
  factures:      Facture[],
  equipements:   Equipement[],
  budgetCibleDH?: number
): Recommandation[] {
  const recos: Recommandation[] = [];
  const analyse = analyserFactures(factures);

  // R01 — vitrage simple
  if (batiment.vitrage === "simple") recos.push(buildReco("R01"));

  // R02 — isolation faible
  if (batiment.isolation === "faible") recos.push(buildReco("R02"));

  // R03 — surconsommation électrique
  if (score.statutComparaison === "surconsommation") recos.push(buildReco("R03"));

  // R04 — variation mensuelle anormale (>30%)
  if (analyse.variationPourcentage > 30) recos.push(buildReco("R04"));

  // R05 — non-conformité RTCM
  const kwhParM2An = analyse.totalAnnuelKwh / batiment.surfaceM2;
  if (kwhParM2An > NORMES_RTCM[batiment.zoneClimatique]) recos.push(buildReco("R05"));

  // R06 — équipements sans classe énergie
  if (equipements.some((eq) => eq.classeEnergie === null)) recos.push(buildReco("R06"));

  // R07 — facture > budget cible
  if (budgetCibleDH && budgetCibleDH > 0 && analyse.montantMoyenDH > budgetCibleDH) {
    recos.push(buildReco("R07"));
  }

  return recos.sort((a, b) => a.priorite - b.priorite);
}

export { PRIORITE_CONFIG };
export const NB_REGLES_TOTAL = 7;

export function resumeProblemes(recos: Recommandation[]): string {
  if (recos.length === 0) return "Aucun problème détecté.";
  return recos
    .map((r, i) => `${i + 1}. [${r.code}] ${r.description} — Solution : ${r.solution}`)
    .join("\n");
}