// ─────────────────────────────────────────────────────────────
// src/store/dossierStore.ts
// GreenBuild  v3.0 — Store Zustand central (Étape 9 CDC)
//
// C'est le cerveau de l'application.
// Il contient TOUT l'état du dossier et la fonction
// calculerTout() qui orchestre le pipeline complet dans l'ordre.
//
// Flux :
//   SoumissionForm → setBatiment / setEquipements / setFactures
//   → calculerTout() → Dashboard lit le store
// ─────────────────────────────────────────────────────────────

import { create }                          from "zustand";
import { devtools, persist }               from "zustand/middleware";
import { v4 as uuid }                      from "uuid";

import type { Batiment }                   from "../types/Batiment";
import type { Equipement }                 from "../types/Equipement";
import type { Facture }                    from "../types/Facture";
import type { Score }                      from "../types/Score";
import type { Recommandation }             from "../types/Recommandation";
import type { Entreprise }                 from "../types/Entreprise";
import type { PlanBudget }                 from "../types/PlanBudget";
import type { DossierAudit }               from "../types/DossierAudit";

import { calculerScore }                   from "../services/scoreService";
import { detecterProblemes }               from "../services/regleService";
import { genererPlanBudget }               from "../services/budgetService";
import { getEntreprisesParRecommandations } from "../services/entrepriseService";

// ══════════════════════════════════════════════════════════════
// Types du store
// ══════════════════════════════════════════════════════════════

/** Statut du pipeline de calcul */
export type StatutCalcul =
  | "idle"        // Pas encore lancé
  | "calculating" // En cours
  | "done"        // Terminé avec succès
  | "error";      // Erreur durant le calcul

/** État complet du store */
interface DossierState {
  // ── Données formulaire (Étapes 1-2-3) ──────────────────────
  batiment:     Batiment     | null;
  equipements:  Equipement[];
  factures:     Facture[];
  budgetCibleDH?: number;

  // ── Résultats pipeline ──────────────────────────────────────
  score:                Score          | null;
  recommandations:      Recommandation[];
  entreprisesParRegle:  Record<string, Entreprise[]>;
  planBudget:           PlanBudget     | null;
  rapportClaude:        string;

  // ── Statut pipeline ─────────────────────────────────────────
  statutCalcul: StatutCalcul;
  erreurCalcul: string | null;

  // ── Étape active du formulaire multi-étapes ─────────────────
  etapeFormulaire: 1 | 2 | 3;

  // ── Actions setters ─────────────────────────────────────────
  setBatiment:      (b: Batiment)     => void;
  setEquipements:   (e: Equipement[]) => void;
  setFactures:      (f: Facture[])    => void;
  setBudgetCible:   (montant: number | undefined) => void;
  setEtape:         (n: 1 | 2 | 3)   => void;
  setRapportClaude: (texte: string)   => void;
  appendRapportClaude: (chunk: string) => void;

  // ── Action principale ───────────────────────────────────────
  calculerTout: () => Promise<void>;

  // ── Reset ───────────────────────────────────────────────────
  resetDossier: () => void;

  // ── Selector utilitaire ─────────────────────────────────────
  getDossierComplet: () => DossierAudit | null;
}

// ══════════════════════════════════════════════════════════════
// État initial
// ══════════════════════════════════════════════════════════════

const ETAT_INITIAL = {
  batiment:            null,
  equipements:         [],
  factures:            [],
  budgetCibleDH:       undefined,
  score:               null,
  recommandations:     [],
  entreprisesParRegle: {},
  planBudget:          null,
  rapportClaude:       "",
  statutCalcul:        "idle" as StatutCalcul,
  erreurCalcul:        null,
  etapeFormulaire:     1 as const,
};

// ══════════════════════════════════════════════════════════════
// STORE ZUSTAND
// ══════════════════════════════════════════════════════════════

export const useDossierStore = create<DossierState>()(
  devtools(
    persist(
      (set, get) => ({
        ...ETAT_INITIAL,

        // ── Setters formulaire ────────────────────────────────

        setBatiment: (batiment) => set({ batiment }, false, "setBatiment"),

        setEquipements: (equipements) =>
          set({ equipements }, false, "setEquipements"),

        setFactures: (factures) =>
          set({ factures }, false, "setFactures"),

        setBudgetCible: (budgetCibleDH) =>
          set({ budgetCibleDH }, false, "setBudgetCible"),

        setEtape: (etapeFormulaire) =>
          set({ etapeFormulaire }, false, "setEtape"),

        setRapportClaude: (rapportClaude) =>
          set({ rapportClaude }, false, "setRapportClaude"),

        // Streaming : ajoute un chunk au rapport existant
        appendRapportClaude: (chunk) =>
          set(
            (s) => ({ rapportClaude: s.rapportClaude + chunk }),
            false,
            "appendRapportClaude"
          ),

        // ── PIPELINE PRINCIPAL calculerTout() ─────────────────

        /**
         * Orchestre tout le pipeline de calcul dans l'ordre CDC :
         *
         *   Phase 1-6 : scoreService.calculerScore()
         *   Phase 7   : regleService.detecterProblemes()
         *   Phase 8   : budgetService.genererPlanBudget()
         *   Phase 8b  : entrepriseService.getEntreprisesParRecommandations()
         *
         * Note : Phase 9 (Claude API) est déclenchée séparément
         * par useClaude.ts après la redirection vers le Dashboard.
         */
        calculerTout: async () => {
          const { batiment, equipements, factures, budgetCibleDH } = get();

          // Vérification des prérequis
          if (!batiment) {
            set({
              statutCalcul: "error",
              erreurCalcul: "Données du bâtiment manquantes.",
            });
            return;
          }
          if (equipements.length === 0) {
            set({
              statutCalcul: "error",
              erreurCalcul: "Aucun équipement renseigné.",
            });
            return;
          }
          if (factures.length !== 12) {
            set({
              statutCalcul: "error",
              erreurCalcul: `Les 12 factures sont requises (${factures.length}/12 saisies).`,
            });
            return;
          }

          // Démarrage du pipeline
          set({ statutCalcul: "calculating", erreurCalcul: null });

          try {
            // ── Phase 1-6 : Score A-G sur 12 mois ────────────
            const score = calculerScore(batiment, equipements, factures);

            // ── Phase 7 : Moteur de règles R01-R07 ────────────
            const recommandations = detecterProblemes(
              batiment,
              score,
              factures,
              equipements,
              budgetCibleDH
            );

            // ── Phase 8 : Plan budget cible ────────────────────
            const planBudget =
              budgetCibleDH && budgetCibleDH > 0
                ? genererPlanBudget(equipements, factures, budgetCibleDH)
                : null;

            // ── Phase 8b : Entreprises partenaires ─────────────
            const entreprisesParRegle = getEntreprisesParRecommandations(
              recommandations,
              batiment.region
            );

            // Sauvegarde dans le store
            set({
              score,
              recommandations,
              planBudget,
              entreprisesParRegle,
              rapportClaude:  "",  // sera rempli par useClaude.ts
              statutCalcul:   "done",
              erreurCalcul:   null,
            });

          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Erreur inconnue durant le calcul.";
            set({
              statutCalcul: "error",
              erreurCalcul: message,
            });
          }
        },

        // ── Reset complet du dossier ──────────────────────────

        resetDossier: () =>
          set({ ...ETAT_INITIAL }, false, "resetDossier"),

        // ── Selector : dossier complet pour l'API / l'export ──

        getDossierComplet: (): DossierAudit | null => {
          const {
            batiment, equipements, factures,
            budgetCibleDH, score, recommandations,
            entreprisesParRegle, planBudget, rapportClaude,
          } = get();

          if (!batiment) return null;

          return {
            id:                  uuid(),
            batiment,
            equipements,
            factures,
            budgetCibleDH,
            score:               score ?? undefined,
            recommandations:     recommandations.length > 0 ? recommandations : undefined,
            entreprisesParRegle: Object.keys(entreprisesParRegle).length > 0
              ? entreprisesParRegle : undefined,
            planBudget:          planBudget ?? undefined,
            rapportClaude:       rapportClaude || undefined,
            statut:              score ? "soumis" : "brouillon",
            createdAt:           new Date(),
            updatedAt:           new Date(),
          };
        },
      }),

      // ── Configuration persist ─────────────────────────────
      {
        name:    "greenbuild-dossier",
        version: 1,
        // Ne persiste que les données de formulaire (pas les résultats)
        // Les résultats sont recalculés à chaque soumission
        partialize: (state) => ({
          batiment:      state.batiment,
          equipements:   state.equipements,
          factures:      state.factures,
          budgetCibleDH: state.budgetCibleDH,
          etapeFormulaire: state.etapeFormulaire,
        }),
      }
    ),
    { name: "DossierStore" }
  )
);

// ══════════════════════════════════════════════════════════════
// Selectors mémorisés (évitent les re-renders inutiles)
// ══════════════════════════════════════════════════════════════

/** Retourne true si le pipeline a terminé avec succès */
export const selectPipelineDone = (s: DossierState) =>
  s.statutCalcul === "done";

/** Retourne true si le bâtiment ET les 12 factures sont renseignés */
export const selectFormulaireComplet = (s: DossierState) =>
  s.batiment !== null &&
  s.equipements.length > 0 &&
  s.factures.length === 12;

/** Retourne le nombre de problèmes urgents (priorité 1) */
export const selectNbProblèmesUrgents = (s: DossierState) =>
  s.recommandations.filter((r) => r.priorite === 1).length;

/** Retourne true si un plan budget est disponible */
export const selectHasPlanBudget = (s: DossierState) =>
  s.planBudget !== null && s.planBudget.actions.length > 0;