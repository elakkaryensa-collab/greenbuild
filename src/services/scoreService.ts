// ─────────────────────────────────────────────────────────────
// src/services/scoreService.ts
// GreenBuild v3.0 — Pipeline de calcul Phases 1 à 6
// Étape 7 CDC
//
// RÈGLE ABSOLUE : baseCalcul est TOUJOURS "12mois"
// Le score est calculé sur la MOYENNE des 12 factures ONEE,
// jamais sur un seul mois isolé...
// ─────────────────────────────────────────────────────────────

import type { Batiment }                        from "../types/Batiment";
import type { Equipement }                      from "../types/Equipement";
import type { Facture, AnalyseFactures, NumeroMois } from "../types/Facture";
import type { Score, StatutComparaison, DetailScore, ClasseEnergetique } from "../types/Score";
import { TARIFS_ONEE }                          from "../data/tarifsONEE";

// ══════════════════════════════════════════════════════════════
// PHASE 1 — Pré-traitement : validation des données
// ══════════════════════════════════════════════════════════════

/**
 * Vérifie que les 12 mois sont tous présents et valides.
 * Lance une erreur si une facture est manquante ou invalide.
 */
export function validerFactures(factures: Facture[]): void {
  if (factures.length !== 12) {
    throw new Error(
      `12 factures requises — ${factures.length} reçues. Tous les mois doivent être renseignés.`
    );
  }

  const moisPresents = new Set(factures.map((f) => f.mois));
  for (let m = 1; m <= 12; m++) {
    if (!moisPresents.has(m as NumeroMois)) {
      throw new Error(`Facture manquante pour le mois ${m}`);
    }
  }

  for (const f of factures) {
    if (f.consommationKwh < 0)
      throw new Error(`Consommation négative pour le mois ${f.mois}`);
    if (f.montantDH < 0)
      throw new Error(`Montant négatif pour le mois ${f.mois}`);
  }
}

/**
 * Vérifie la cohérence des données d'un équipement.
 */
export function validerEquipement(eq: Equipement): void {
  if (eq.puissanceWatts <= 0)
    throw new Error(`Puissance invalide pour l'équipement "${eq.nom}"`);
  if (eq.heuresParJour < 0 || eq.heuresParJour > 24)
    throw new Error(`Heures/jour invalides pour "${eq.nom}" (0-24)`);
  if (eq.joursParAn < 0 || eq.joursParAn > 365)
    throw new Error(`Jours/an invalides pour "${eq.nom}" (0-365)`);
}

// ══════════════════════════════════════════════════════════════
// PHASE 2 — Consommation théorique par équipement
// ══════════════════════════════════════════════════════════════

/**
 * Formule CDC Phase 2 :
 *   kWh = (puissanceWatts × heuresParJour × joursParAn) / 1000
 *
 * Exemple : climatiseur 1500W × 8h × 120j / 1000 = 1440 kWh/an
 */
export function calcConsommationEquipement(eq: Equipement): number {
  return (eq.puissanceWatts * eq.heuresParJour * eq.joursParAn) / 1000;
}

/**
 * Coût mensuel d'un équipement en DH.
 * Formule CDC Phase 8 :
 *   coutDH = (puissanceWatts × heuresParJour × 30) / 1000 × tarifONEE
 */
export function calcCoutMensuelEquipement(eq: Equipement): number {
  const tarif = TARIFS_ONEE.tarifMoyen;
  return (eq.puissanceWatts * eq.heuresParJour * 30) / 1000 * tarif;
}

/**
 * Somme la consommation théorique annuelle de tous les équipements.
 * Retourne aussi les équipements enrichis avec leur consommation calculée.
 */
export function calcConsommationTheoriqueAnnuelle(equipements: Equipement[]): {
  totalKwhAn: number;
  equipementsEnrichis: Equipement[];
} {
  let totalKwhAn = 0;
  const equipementsEnrichis: Equipement[] = [];

  for (const eq of equipements) {
    validerEquipement(eq);
    const kwhAnnuelle = calcConsommationEquipement(eq);
    const coutMensuel = calcCoutMensuelEquipement(eq);
    totalKwhAn += kwhAnnuelle;
    equipementsEnrichis.push({
      ...eq,
      consommationKwhAnnuelle: Math.round(kwhAnnuelle * 10) / 10,
      coutMensuelDH: Math.round(coutMensuel * 10) / 10,
    });
  }

  return { totalKwhAn: Math.round(totalKwhAn * 10) / 10, equipementsEnrichis };
}

// ══════════════════════════════════════════════════════════════
// PHASE 3 — Analyse des 12 factures réelles
// ══════════════════════════════════════════════════════════════

/**
 * Analyse complète des 12 factures ONEE.
 * Calcule la moyenne, la variation, les mois pic.
 * C'est cette MOYENNE qui sert de base au score A–G.
 */
export function analyserFactures(factures: Facture[]): AnalyseFactures {
  validerFactures(factures);

  const sorted = [...factures].sort((a, b) => a.mois - b.mois);
  const consommations = sorted.map((f) => f.consommationKwh);
  const montants      = sorted.map((f) => f.montantDH);

  const totalAnnuelKwh     = consommations.reduce((s, v) => s + v, 0);
  const moyenneMensuelleKwh = totalAnnuelKwh / 12;
  const montantMoyenDH     = montants.reduce((s, v) => s + v, 0) / 12;

  const minKwh = Math.min(...consommations);
  const maxKwh = Math.max(...consommations);

  const moisMinKwh = sorted[consommations.indexOf(minKwh)].mois;
  const moisMaxKwh = sorted[consommations.indexOf(maxKwh)].mois;

  // Variation % entre le mois le plus bas et le plus haut (règle R04 si > 30%)
  const variationPourcentage = minKwh > 0
    ? Math.round(((maxKwh - minKwh) / minKwh) * 100)
    : 0;

  // Mois pic = consommation > moyenne × 1.2
  const seuilPic = moyenneMensuelleKwh * 1.2;
  const moisPic = sorted
    .filter((f) => f.consommationKwh > seuilPic)
    .map((f) => f.mois);

  return {
    moyenneMensuelleKwh:  Math.round(moyenneMensuelleKwh * 10) / 10,
    totalAnnuelKwh:       Math.round(totalAnnuelKwh * 10) / 10,
    montantMoyenDH:       Math.round(montantMoyenDH * 10) / 10,
    moisMinKwh,
    moisMaxKwh,
    variationPourcentage,
    moisPic,
  };
}

// ══════════════════════════════════════════════════════════════
// PHASE 4 — Comparaison théorique vs réel
// ══════════════════════════════════════════════════════════════

/**
 * Compare la consommation réelle à la consommation théorique.
 *
 * Statuts CDC :
 *   normal          : réel ≤ théorique/12         → 0 pénalité
 *   eleve           : 1.0× < ratio ≤ 1.2×         → −15 pts
 *   surconsommation : ratio > 1.2×                 → −25 pts
 */
export function comparerTheoriqueReel(
  consommationTheoriqueAnnuelle: number,
  moyenneMensuelleKwh: number
): StatutComparaison {
  const theoriqueMensuel = consommationTheoriqueAnnuelle / 12;

  if (theoriqueMensuel === 0) return "normal";

  const ratio = moyenneMensuelleKwh / theoriqueMensuel;

  if (ratio > 1.2) return "surconsommation";
  if (ratio > 1.0) return "eleve";
  return "normal";
}

// ══════════════════════════════════════════════════════════════
// PHASE 5 — Calcul du score A–G
// ══════════════════════════════════════════════════════════════

/**
 * Détermine la classe A–G à partir de la valeur numérique.
 * Barème CDC :
 *   A : ≥ 85 | B : 70-84 | C : 55-69 | D : 40-54
 *   E : 25-39 | F : 10-24 | G : < 10
 */
export function determinerClasse(valeur: number): ClasseEnergetique {
  if (valeur >= 85) return "A";
  if (valeur >= 70) return "B";
  if (valeur >= 55) return "C";
  if (valeur >= 40) return "D";
  if (valeur >= 25) return "E";
  if (valeur >= 10) return "F";
  return "G";
}

/**
 * Vérifie si TOUS les équipements sont de classe A+.
 * Déclenche le bonus +10 pts si vrai.
 */
function tousEquipementsAPlus(equipements: Equipement[]): boolean {
  if (equipements.length === 0) return false;
  return equipements.every((eq) => eq.classeEnergie === "A+");
}

// ══════════════════════════════════════════════════════════════
// PHASE 6 — Score énergétique annuel (fonction principale)
// ══════════════════════════════════════════════════════════════

/**
 * Calcule le score énergétique annuel A–G.
 *
 * Formule CDC complète :
 *   base = 100
 *   − 20 si isolation = "faible"
 *   − 15 si vitrage = "simple"
 *   − 25 si statut = "surconsommation"
 *   − 15 si statut = "élevé"
 *   + 10 si tous les appareils sont classe A+
 *   +  5 si vitrage = "double"
 *   +  8 si isolation = "fort"
 *   score final = clamp(résultat, 0, 100)
 *
 * @returns Score avec baseCalcul: "12mois" OBLIGATOIRE
 */
export function calculerScore(
  batiment: Batiment,
  equipements: Equipement[],
  factures: Facture[]
): Score {
  // Phase 1 — validation
  validerFactures(factures);

  // Phase 2 — théorique
  const { totalKwhAn } = calcConsommationTheoriqueAnnuelle(equipements);

  // Phase 3 — analyse factures réelles
  const analyse = analyserFactures(factures);

  // Phase 4 — comparaison
  const statutComparaison = comparerTheoriqueReel(
    totalKwhAn,
    analyse.moyenneMensuelleKwh
  );

  // Phase 5 — pénalités et bonus
  const penaliteIsolation: DetailScore["penaliteIsolation"] =
    batiment.isolation === "faible" ? -20 : 0;

  const penaliteVitrage: DetailScore["penaliteVitrage"] =
    batiment.vitrage === "simple" ? -15 : 0;

  const penaliteSurconsommation: DetailScore["penaliteSurconsommation"] =
    statutComparaison === "surconsommation" ? -25
    : statutComparaison === "eleve"         ? -15
    : 0;

  const bonusEquipements: DetailScore["bonusEquipements"] =
    tousEquipementsAPlus(equipements) ? 10 : 0;

  const bonusVitrage: DetailScore["bonusVitrage"] =
    batiment.vitrage === "double" ? 5 : 0;

  const bonusIsolation: DetailScore["bonusIsolation"] =
    batiment.isolation === "fort" ? 8 : 0;

  // Phase 6 — score final (clampé 0-100)
  const scoreRaw =
    100
    + penaliteIsolation
    + penaliteVitrage
    + penaliteSurconsommation
    + bonusEquipements
    + bonusVitrage
    + bonusIsolation;

  const valeur = Math.max(0, Math.min(100, scoreRaw));
  const classe  = determinerClasse(valeur);

  return {
    valeur,
    classe,
    consommationTheoriqueAnnuelle: totalKwhAn,
    consommationReelleMoyenne:     analyse.moyenneMensuelleKwh,
    statutComparaison,
    baseCalcul: "12mois",   // ← TOUJOURS "12mois" — jamais modifiable
    detail: {
      scoreBase:               100,
      penaliteIsolation,
      penaliteVitrage,
      penaliteSurconsommation,
      bonusEquipements,
      bonusVitrage,
      bonusIsolation,
    },
  };
}