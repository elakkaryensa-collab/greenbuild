// ─────────────────────────────────────────────────────────────
// src/services/budgetService.ts
// GreenBuild v3.0 — Plan d'usage selon budget cible (Phase 8 CDC)
// Étape 8 CDC
//
// Fonctionnement :
//   1. Calcule l'écart : factureMoyenne − budgetCible
//   2. Classe les équipements par coût mensuel décroissant
//   3. Pour chaque équipement : génère une action de −30% d'usage
//   4. Accumule jusqu'à couvrir l'écart
//   5. Retourne le plan complet avec économiesTotalesDH + objectifAtteint
// ─────────────────────────────────────────────────────────────

import type { Equipement }           from "../types/Equipement";
import type { Facture }              from "../types/Facture";
import type { PlanBudget, ActionBudget } from "../types/PlanBudget";
import { analyserFactures }          from "./scoreService";
import { calcCoutMensuelEquipement } from "./scoreService";
import { TARIFS_ONEE }               from "../data/tarifsONEE";

// ══════════════════════════════════════════════════════════════
// Constantes
// ══════════════════════════════════════════════════════════════

/** Réduction d'usage recommandée par action : 30% */
const REDUCTION_USAGE = 0.30;

/** Seuil minimum de coût mensuel pour générer une action (en DH) */
const SEUIL_MIN_COUT_DH = 10;

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

/**
 * Détermine le niveau de difficulté d'une réduction d'usage.
 * Basé sur le type d'équipement et les heures de réduction.
 */
function evaluerDifficulte(
  nomEquipement: string,
  heuresReduction: number
): ActionBudget["difficulte"] {
  const nom = nomEquipement.toLowerCase();

  // Équipements dont la réduction est naturellement simple
  if (nom.includes("éclairage") || nom.includes("veille") || nom.includes("chargeur")) {
    return "facile";
  }
  // Équipements saisonniers — facile de réduire hors saison
  if (nom.includes("climatiseur") || nom.includes("chauffage")) {
    return heuresReduction <= 2 ? "facile" : "moyen";
  }
  // Équipements essentiels — réduction difficile
  if (nom.includes("chauffe-eau") || nom.includes("réfrigérateur") || nom.includes("frigo")) {
    return "difficile";
  }

  // Défaut selon l'amplitude de la réduction
  if (heuresReduction <= 1) return "facile";
  if (heuresReduction <= 3) return "moyen";
  return "difficile";
}

/**
 * Génère le texte de l'action recommandée.
 */
function genererTexteAction(
  nom: string,
  heuresActuelles: number,
  heuresRecommandees: number,
  economieDH: number
): string {
  const reduction = heuresActuelles - heuresRecommandees;

  return `Réduire ${nom} de ${heuresActuelles}h à ${heuresRecommandees.toFixed(1)}h/jour (−${reduction.toFixed(1)}h) → économie estimée : ${Math.round(economieDH)} DH/mois`;
}

// ══════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE
// ══════════════════════════════════════════════════════════════

/**
 * Génère le plan de réduction d'usage pour atteindre un budget cible.
 *
 * @param equipements  Liste des équipements électriques du bâtiment
 * @param factures     Les 12 factures ONEE (pour calculer la moyenne actuelle)
 * @param budgetCibleDH Budget mensuel cible en DH saisi par l'utilisateur
 * @returns PlanBudget complet avec actions, économies et statut objectif
 */
export function genererPlanBudget(
  equipements:   Equipement[],
  factures:      Facture[],
  budgetCibleDH: number
): PlanBudget {
  // Calcul de la facture actuelle (moyenne des 12 mois)
  const analyse         = analyserFactures(factures);
  const factureActuelleDH = analyse.montantMoyenDH;
  const ecartDH         = factureActuelleDH - budgetCibleDH;

  // Si déjà sous le budget → plan vide, objectif atteint
  if (ecartDH <= 0) {
    return {
      budgetCibleDH,
      factureActuelleDH: Math.round(factureActuelleDH),
      ecartDH: 0,
      actions: [],
      economiesTotalesDH: 0,
      objectifAtteint: true,
    };
  }

  // ── Étape 1 : calculer le coût mensuel de chaque équipement ──

  const equipementsAvecCout = equipements
    .map((eq) => ({
      ...eq,
      coutMensuelDH: calcCoutMensuelEquipement(eq),
    }))
    .filter((eq) => eq.coutMensuelDH >= SEUIL_MIN_COUT_DH)
    .sort((a, b) => b.coutMensuelDH - a.coutMensuelDH); // décroissant

  // ── Étape 2 : générer les actions de réduction ────────────────

  const actions: ActionBudget[] = [];
  let economiesTotalesDH = 0;

  for (const eq of equipementsAvecCout) {
    // Arrêt dès que l'écart est comblé
    if (economiesTotalesDH >= ecartDH) break;

    const heuresActuelles     = eq.heuresParJour;
    const heuresRecommandees  = Math.max(
      0.5,
      heuresActuelles * (1 - REDUCTION_USAGE)
    );
    const heuresReduction     = heuresActuelles - heuresRecommandees;

    // Économie mensuelle de cette action en DH
    // Formule : réduction kWh × tarifONEE
    const reductionKwhMois =
      (eq.puissanceWatts * heuresReduction * 30) / 1000;
    const economieMensuelDH = Math.round(
      reductionKwhMois * TARIFS_ONEE.tarifMoyen * 10
    ) / 10;

    if (economieMensuelDH < 5) continue; // Skip les gains négligeables

    const difficulte = evaluerDifficulte(eq.nom, heuresReduction);

    actions.push({
      equipementId:       eq.id,
      equipementNom:      eq.nom,
      action:             genererTexteAction(
        eq.nom,
        heuresActuelles,
        heuresRecommandees,
        economieMensuelDH
      ),
      heuresActuelles,
      heuresRecommandees: Math.round(heuresRecommandees * 10) / 10,
      economieMensuelDH,
      difficulte,
    });

    economiesTotalesDH += economieMensuelDH;
  }

  return {
    budgetCibleDH,
    factureActuelleDH: Math.round(factureActuelleDH),
    ecartDH:           Math.round(ecartDH),
    actions,
    economiesTotalesDH: Math.round(economiesTotalesDH),
    objectifAtteint:    economiesTotalesDH >= ecartDH,
  };
}

// ══════════════════════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════════════════════

/**
 * Trie les actions du plan par difficulté (facile en premier).
 * Utile pour afficher les quick wins en premier dans le dashboard.
 */
export function trierParDifficulte(actions: ActionBudget[]): ActionBudget[] {
  const ordre: Record<ActionBudget["difficulte"], number> = {
    facile:   1,
    moyen:    2,
    difficile: 3,
  };
  return [...actions].sort((a, b) => ordre[a.difficulte] - ordre[b.difficulte]);
}

/**
 * Retourne le résumé du plan pour le prompt Claude API.
 */
export function resumePlanBudget(plan: PlanBudget): string {
  if (plan.objectifAtteint && plan.actions.length === 0) {
    return `Budget cible de ${plan.budgetCibleDH} DH/mois déjà atteint (facture actuelle : ${plan.factureActuelleDH} DH).`;
  }
  const lignes = [
    `Facture actuelle : ${plan.factureActuelleDH} DH/mois`,
    `Budget cible : ${plan.budgetCibleDH} DH/mois`,
    `Écart à combler : ${plan.ecartDH} DH/mois`,
    `Actions recommandées :`,
    ...plan.actions.map((a) => `  - ${a.action} (${a.difficulte})`),
    `Économies totales : ${plan.economiesTotalesDH} DH/mois`,
    `Objectif atteint : ${plan.objectifAtteint ? "OUI" : "NON"}`,
  ];
  return lignes.join("\n");
}