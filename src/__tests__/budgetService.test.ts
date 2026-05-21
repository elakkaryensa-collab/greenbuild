// src/__tests__/budgetService.test.ts
import { describe, it, expect } from "vitest";
import {
  genererPlanBudget,
  trierParDifficulte,
  resumePlanBudget,
} from "../services/budgetService";
import type { Equipement }   from "../types/Equipement";
import type { Facture, NumeroMois } from "../types/Facture";
import type { ActionBudget } from "../types/PlanBudget";

// ── Mocks ────────────────────────────────────────────────────

const EQUIPEMENTS_MOCK: Equipement[] = [
  {
    id:             "eq-1",
    nom:            "Climatiseur",
    puissanceWatts: 1500,
    heuresParJour:  8,
    joursParAn:     120,       // ✅ champ obligatoire ajouté
    classeEnergie:  "B",       // ✅ classeEnergie (pas classeEnergetique)
  },
  {
    id:             "eq-2",
    nom:            "Chauffe-eau",
    puissanceWatts: 2000,
    heuresParJour:  3,
    joursParAn:     365,
    classeEnergie:  "C",
  },
  {
    id:             "eq-3",
    nom:            "Éclairage",
    puissanceWatts: 200,
    heuresParJour:  6,
    joursParAn:     365,
    classeEnergie:  null,      // ✅ null autorisé par ClasseEnergie
  },
];

// ✅ mois typé comme NumeroMois (1–12), pas number
const FACTURES_MOCK: Facture[] = Array.from({ length: 12 }, (_, i) => ({
  mois:            (i + 1) as NumeroMois,
  annee:           2024,
  montantDH:       800,
  consommationKwh: 571,
}));

// ── Tests genererPlanBudget ───────────────────────────────────

describe("genererPlanBudget", () => {
  it("objectifAtteint = true si budget > facture actuelle", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 1200);
    expect(plan.objectifAtteint).toBe(true);
    expect(plan.actions).toHaveLength(0);
    expect(plan.ecartDH).toBe(0);
  });

  it("génère des actions si budget < facture actuelle", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    expect(plan.actions.length).toBeGreaterThan(0);
  });

  it("factureActuelleDH = moyenne des 12 factures", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    expect(plan.factureActuelleDH).toBe(800);
  });

  it("ecartDH = factureActuelle - budgetCible", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 500);
    expect(plan.ecartDH).toBe(300);
  });

  it("chaque action a les propriétés requises", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    plan.actions.forEach((action: ActionBudget) => {
      expect(action).toHaveProperty("equipementId");
      expect(action).toHaveProperty("equipementNom");
      expect(action).toHaveProperty("action");
      expect(action).toHaveProperty("heuresActuelles");
      expect(action).toHaveProperty("heuresRecommandees");
      expect(action).toHaveProperty("economieMensuelDH");
      expect(action).toHaveProperty("difficulte");
    });
  });

  it("heuresRecommandees < heuresActuelles", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    plan.actions.forEach((action: ActionBudget) => {
      expect(action.heuresRecommandees).toBeLessThan(action.heuresActuelles);
    });
  });

  it("economieMensuelDH ≥ 5 pour chaque action", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    plan.actions.forEach((action: ActionBudget) => {
      expect(action.economieMensuelDH).toBeGreaterThanOrEqual(5);
    });
  });

  it("economiesTotalesDH ≈ somme des économies des actions", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    const somme = plan.actions.reduce(
      (acc: number, a: ActionBudget) => acc + a.economieMensuelDH,
      0
    );
    expect(plan.economiesTotalesDH).toBeCloseTo(somme, 0);
  });
});

// ── Tests trierParDifficulte ──────────────────────────────────

describe("trierParDifficulte", () => {
  it("trie : facile → moyen → difficile", () => {
    const actions: ActionBudget[] = [
      { equipementId: "1", equipementNom: "A", action: "", heuresActuelles: 4, heuresRecommandees: 2, economieMensuelDH: 50, difficulte: "difficile" },
      { equipementId: "2", equipementNom: "B", action: "", heuresActuelles: 4, heuresRecommandees: 2, economieMensuelDH: 30, difficulte: "facile"    },
      { equipementId: "3", equipementNom: "C", action: "", heuresActuelles: 4, heuresRecommandees: 2, economieMensuelDH: 20, difficulte: "moyen"     },
    ];
    const triees = trierParDifficulte(actions);
    expect(triees[0].difficulte).toBe("facile");
    expect(triees[1].difficulte).toBe("moyen");
    expect(triees[2].difficulte).toBe("difficile");
  });

  it("ne modifie pas le tableau original", () => {
    const actions: ActionBudget[] = [
      { equipementId: "1", equipementNom: "A", action: "", heuresActuelles: 4, heuresRecommandees: 2, economieMensuelDH: 50, difficulte: "difficile" },
    ];
    const original = [...actions];
    trierParDifficulte(actions);
    expect(actions).toEqual(original);
  });
});

// ── Tests resumePlanBudget ────────────────────────────────────

describe("resumePlanBudget", () => {
  it("retourne message spécial si objectif déjà atteint sans actions", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 1200);
    const resume = resumePlanBudget(plan);
    expect(resume).toContain("déjà atteint");
  });

  it("contient les infos clés du plan", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    const resume = resumePlanBudget(plan);
    expect(resume).toContain("Facture actuelle");
    expect(resume).toContain("Budget cible");
    expect(resume).toContain("Écart");
    expect(resume).toContain("Économies totales");
    expect(resume).toContain("Objectif atteint");
  });

  it("contient les actions dans le résumé", () => {
    const plan = genererPlanBudget(EQUIPEMENTS_MOCK, FACTURES_MOCK, 400);
    const resume = resumePlanBudget(plan);
    plan.actions.forEach((action: ActionBudget) => {
      expect(resume).toContain(action.difficulte);
    });
  });

  
});