// ─────────────────────────────────────────────────────────────
// src/__tests__/regleService.test.ts
// GreenBuild v3.0 — Tests Vitest regleService (CDC > 80%)
// Pour chaque règle : test déclenchement + test non-déclenchement
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { detecterProblemes }    from "../services/regleService";

import type { Batiment }   from "../types/Batiment";
import type { Equipement } from "../types/Equipement";
import type { Facture }    from "../types/Facture";
import type { Score }      from "../types/Score";

// ✅ CORRECTION 1 : import NumeroMois pour remplacer tous les "as any"
import type { NumeroMois } from "../types/Facture";

// ── Fixtures ──────────────────────────────────────────────────

// ✅ CORRECTION 2 : (i + 1) as NumeroMois au lieu de (i + 1) as any
function genFactures(kwh: number, montant: number): Facture[] {
  return Array.from({ length: 12 }, (_, i) => ({
    mois: (i + 1) as NumeroMois,
    annee: 2024,
    consommationKwh: kwh,
    montantDH: montant,
  }));
}

const batimentBase: Batiment = {
  id: "bat-rgl", type: "residentiel", surfaceM2: 100, materiaux: "béton",
  isolation: "moyen", vitrage: "double",
  zoneClimatique: "cotiere", region: "Casablanca-Settat", ville: "Casablanca",
};

const equipBase: Equipement = {
  id: "eq-1", nom: "LED", puissanceWatts: 100,
  heuresParJour: 5, joursParAn: 365, classeEnergie: "A",
};

// Score standard (consommation normale)
const scoreNormal: Score = {
  valeur: 58, classe: "C",
  consommationTheoriqueAnnuelle: 438,
  consommationReelleMoyenne: 100,
  statutComparaison: "normal",
  baseCalcul: "12mois",
  detail: {
    scoreBase: 100, penaliteIsolation: 0, penaliteVitrage: 0,
    penaliteSurconsommation: 0, bonusEquipements: 0, bonusVitrage: 5, bonusIsolation: 0,
  },
};

const scoreSurconso: Score = {
  ...scoreNormal,
  statutComparaison: "surconsommation",
  detail: { ...scoreNormal.detail, penaliteSurconsommation: -25 },
};

// ══════════════════════════════════════════════════════════════
// R01 — Vitrage simple
// ══════════════════════════════════════════════════════════════

describe("R01 — vitrage simple", () => {
  it("déclenche R01 si vitrage = 'simple'", () => {
    const bat = { ...batimentBase, vitrage: "simple" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R01")).toBe(true);
  });

  it("ne déclenche PAS R01 si vitrage = 'double'", () => {
    const recos = detecterProblemes(batimentBase, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R01")).toBe(false);
  });

  it("R01 a la spécialité 'vitrage'", () => {
    const bat = { ...batimentBase, vitrage: "simple" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(100, 200), [equipBase]);
    const r01 = recos.find((r) => r.code === "R01")!;
    expect(r01.specialiteEntreprise).toBe("vitrage");
  });
});

// ══════════════════════════════════════════════════════════════
// R02 — Isolation faible
// ══════════════════════════════════════════════════════════════

describe("R02 — isolation faible", () => {
  it("déclenche R02 si isolation = 'faible'", () => {
    const bat = { ...batimentBase, isolation: "faible" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R02")).toBe(true);
  });

  it("ne déclenche PAS R02 si isolation = 'moyen'", () => {
    const recos = detecterProblemes(batimentBase, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R02")).toBe(false);
  });

  it("ne déclenche PAS R02 si isolation = 'fort'", () => {
    const bat = { ...batimentBase, isolation: "fort" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R02")).toBe(false);
  });

  it("R02 a la spécialité 'isolation'", () => {
    const bat = { ...batimentBase, isolation: "faible" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.find((r) => r.code === "R02")?.specialiteEntreprise).toBe("isolation");
  });
});

// ══════════════════════════════════════════════════════════════
// R03 — Surconsommation
// ══════════════════════════════════════════════════════════════

describe("R03 — surconsommation électrique", () => {
  it("déclenche R03 si statut = 'surconsommation'", () => {
    const recos = detecterProblemes(batimentBase, scoreSurconso, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R03")).toBe(true);
  });

  it("ne déclenche PAS R03 si statut = 'normal'", () => {
    const recos = detecterProblemes(batimentBase, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R03")).toBe(false);
  });

  it("R03 a la priorité 1 (urgent)", () => {
    const recos = detecterProblemes(batimentBase, scoreSurconso, genFactures(100, 200), [equipBase]);
    expect(recos.find((r) => r.code === "R03")?.priorite).toBe(1);
  });
});

// ══════════════════════════════════════════════════════════════
// R04 — Variation mensuelle anormale
// ══════════════════════════════════════════════════════════════

describe("R04 — variation mensuelle > 30%", () => {
  it("déclenche R04 si variation > 30%", () => {
    // ✅ CORRECTION 3 : (i + 1) as NumeroMois au lieu de as any
    const factures: Facture[] = Array.from({ length: 12 }, (_, i) => ({
      mois: (i + 1) as NumeroMois,
      annee: 2024,
      consommationKwh: i < 6 ? 100 : 500,
      montantDH: 200,
    }));
    const recos = detecterProblemes(batimentBase, scoreNormal, factures, [equipBase]);
    expect(recos.some((r) => r.code === "R04")).toBe(true);
  });

  it("ne déclenche PAS R04 si variation ≤ 30%", () => {
    // Tous les mois identiques → variation 0%
    const recos = detecterProblemes(batimentBase, scoreNormal, genFactures(300, 600), [equipBase]);
    expect(recos.some((r) => r.code === "R04")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// R05 — Non-conformité RTCM
// ══════════════════════════════════════════════════════════════

describe("R05 — non-conformité RTCM kWh/m²", () => {
  it("déclenche R05 si kWh/m²/an > seuil zone côtière (80)", () => {
    // Surface 100m², réel = 1000 kWh/mois × 12 = 12000 kWh/an = 120 kWh/m²
    const bat = { ...batimentBase, surfaceM2: 100, zoneClimatique: "cotiere" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(1000, 2000), [equipBase]);
    expect(recos.some((r) => r.code === "R05")).toBe(true);
  });

  it("ne déclenche PAS R05 si kWh/m²/an ≤ seuil", () => {
    // Surface 1000m², réel = 50 kWh/mois × 12 = 600 kWh/an = 0.6 kWh/m²
    const bat = { ...batimentBase, surfaceM2: 1000 };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(50, 100), [equipBase]);
    expect(recos.some((r) => r.code === "R05")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// R06 — Équipements sans classe énergie
// ══════════════════════════════════════════════════════════════

describe("R06 — équipements sans classe énergie", () => {
  it("déclenche R06 si un équipement a classeEnergie = null", () => {
    const equip: Equipement = { ...equipBase, classeEnergie: null };
    const recos = detecterProblemes(batimentBase, scoreNormal, genFactures(100, 200), [equip]);
    expect(recos.some((r) => r.code === "R06")).toBe(true);
  });

  it("ne déclenche PAS R06 si tous les équipements ont une classe", () => {
    const recos = detecterProblemes(batimentBase, scoreNormal, genFactures(100, 200), [equipBase]);
    expect(recos.some((r) => r.code === "R06")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// R07 — Budget cible non atteint
// ══════════════════════════════════════════════════════════════

describe("R07 — facture > budget cible", () => {
  it("déclenche R07 si factureMoyenne > budgetCible", () => {
    // factureMoyenne = 600 DH, budgetCible = 400 DH
    const recos = detecterProblemes(
      batimentBase, scoreNormal,
      genFactures(300, 600), [equipBase],
      400, // budgetCible
    );
    expect(recos.some((r) => r.code === "R07")).toBe(true);
  });

  it("ne déclenche PAS R07 si factureMoyenne ≤ budgetCible", () => {
    // factureMoyenne = 600 DH, budgetCible = 800 DH
    const recos = detecterProblemes(
      batimentBase, scoreNormal,
      genFactures(300, 600), [equipBase],
      800,
    );
    expect(recos.some((r) => r.code === "R07")).toBe(false);
  });

  it("ne déclenche PAS R07 si budgetCible non fourni", () => {
    const recos = detecterProblemes(
      batimentBase, scoreNormal,
      genFactures(300, 600), [equipBase],
      // pas de budgetCible
    );
    expect(recos.some((r) => r.code === "R07")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// Tri par priorité
// ══════════════════════════════════════════════════════════════

describe("Tri des recommandations", () => {
  it("les recommandations sont triées par priorité croissante", () => {
    const bat = {
      ...batimentBase,
      isolation: "faible" as const,
      vitrage: "simple" as const,
    };
    const recos = detecterProblemes(bat, scoreSurconso, genFactures(100, 200), [equipBase]);
    for (let i = 1; i < recos.length; i++) {
      expect(recos[i].priorite).toBeGreaterThanOrEqual(recos[i - 1].priorite);
    }
  });

  it("toutes les recommandations ont un ROI calculé", () => {
    const bat = { ...batimentBase, isolation: "faible" as const };
    const recos = detecterProblemes(bat, scoreNormal, genFactures(100, 200), [equipBase]);
    recos.forEach((r) => {
      expect(r.roiAnnees).toBeGreaterThan(0);
    });
  });
});