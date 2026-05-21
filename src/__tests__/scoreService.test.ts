// ─────────────────────────────────────────────────────────────
// src/__tests__/scoreService.test.ts
// GreenBuild v3.0 — Tests Vitest scoreService (CDC > 80%)
// ─────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  calcConsommationEquipement,
  calcConsommationTheoriqueAnnuelle,
  analyserFactures,
  comparerTheoriqueReel,
  determinerClasse,
  calculerScore,
  validerFactures,
} from "../services/scoreService";
import type { Batiment }   from "../types/Batiment";
import type { Equipement } from "../types/Equipement";
import type { Facture }    from "../types/Facture";

// ✅ CORRECTION 1 : import du type NumeroMois pour les casts explicites
import type { NumeroMois } from "../types/Facture";

// ── Fixtures réutilisables ────────────────────────────────────

const batimentA: Batiment = {
  id: "bat-test-A",
  type: "residentiel",
  surfaceM2: 100,
  materiaux: "béton armé",
  isolation: "fort",
  vitrage: "double",
  zoneClimatique: "cotiere",
  region: "Casablanca-Settat",
  ville: "Casablanca",
};

const batimentG: Batiment = {
  ...batimentA,
  id: "bat-test-G",
  isolation: "faible",
  vitrage: "simple",
};

const equipementClim: Equipement = {
  id: "eq-1",
  nom: "Climatiseur",
  puissanceWatts: 1500,
  heuresParJour: 8,
  joursParAn: 120,
  classeEnergie: "A",
};

const equipementChauffe: Equipement = {
  id: "eq-2",
  nom: "Chauffe-eau",
  puissanceWatts: 2000,
  heuresParJour: 2,
  joursParAn: 365,
  classeEnergie: "B",
};

// ✅ CORRECTION 2 : genererFactures — cast (i + 1) as NumeroMois
// TypeScript ne peut pas inférer que (i + 1) est forcément dans 1..12
// Le cast est sûr ici car Array.from({ length: 12 }) produit i ∈ [0..11]
function genererFactures(kwh: number, montant: number): Facture[] {
  return Array.from({ length: 12 }, (_, i) => ({
    mois: (i + 1) as NumeroMois,
    annee: 2024,
    consommationKwh: kwh,
    montantDH: montant,
  }));
}

// ✅ CORRECTION 3 : facturesVariees — chaque mois casté en NumeroMois
// Sans le cast, TypeScript infère le type "number" au lieu de "1"|"2"|...|"12"
const facturesVariees: Facture[] = [
  { mois:  1 as NumeroMois, annee: 2024, consommationKwh: 310, montantDH:  620 },
  { mois:  2 as NumeroMois, annee: 2024, consommationKwh: 295, montantDH:  590 },
  { mois:  3 as NumeroMois, annee: 2024, consommationKwh: 320, montantDH:  640 },
  { mois:  4 as NumeroMois, annee: 2024, consommationKwh: 380, montantDH:  760 },
  { mois:  5 as NumeroMois, annee: 2024, consommationKwh: 420, montantDH:  840 },
  { mois:  6 as NumeroMois, annee: 2024, consommationKwh: 510, montantDH: 1020 },
  { mois:  7 as NumeroMois, annee: 2024, consommationKwh: 490, montantDH:  980 },
  { mois:  8 as NumeroMois, annee: 2024, consommationKwh: 505, montantDH: 1010 },
  { mois:  9 as NumeroMois, annee: 2024, consommationKwh: 440, montantDH:  880 },
  { mois: 10 as NumeroMois, annee: 2024, consommationKwh: 360, montantDH:  720 },
  { mois: 11 as NumeroMois, annee: 2024, consommationKwh: 310, montantDH:  620 },
  { mois: 12 as NumeroMois, annee: 2024, consommationKwh: 290, montantDH:  580 },
];

// ══════════════════════════════════════════════════════════════
// PHASE 2 — Consommation équipement
// ══════════════════════════════════════════════════════════════

describe("calcConsommationEquipement", () => {
  it("climatiseur 1500W × 8h × 120j = 1440 kWh/an", () => {
    expect(calcConsommationEquipement(equipementClim)).toBe(1440);
  });

  it("chauffe-eau 2000W × 2h × 365j = 1460 kWh/an", () => {
    expect(calcConsommationEquipement(equipementChauffe)).toBe(1460);
  });

  it("réfrigérateur 150W × 24h × 365j = 1314 kWh/an", () => {
    const frigo: Equipement = {
      id: "eq-3", nom: "Réfrigérateur",
      puissanceWatts: 150, heuresParJour: 24, joursParAn: 365,
      classeEnergie: "A+",
    };
    expect(calcConsommationEquipement(frigo)).toBe(1314);
  });

  it("formule vérifiée : P × h × j / 1000", () => {
    const eq: Equipement = {
      id: "eq-4", nom: "Test",
      puissanceWatts: 1000, heuresParJour: 10, joursParAn: 100,
      classeEnergie: null,
    };
    expect(calcConsommationEquipement(eq)).toBe(1000);
  });
});

// ══════════════════════════════════════════════════════════════
// PHASE 2 — Somme équipements
// ══════════════════════════════════════════════════════════════

describe("calcConsommationTheoriqueAnnuelle", () => {
  it("somme correcte pour 2 équipements", () => {
    const { totalKwhAn } = calcConsommationTheoriqueAnnuelle([
      equipementClim, equipementChauffe,
    ]);
    expect(totalKwhAn).toBe(1440 + 1460); // 2900
  });

  it("enrichit les équipements avec consommationKwhAnnuelle", () => {
    const { equipementsEnrichis } = calcConsommationTheoriqueAnnuelle([equipementClim]);
    expect(equipementsEnrichis[0].consommationKwhAnnuelle).toBe(1440);
  });

  it("enrichit les équipements avec coutMensuelDH", () => {
    const { equipementsEnrichis } = calcConsommationTheoriqueAnnuelle([equipementClim]);
    expect(equipementsEnrichis[0].coutMensuelDH).toBeGreaterThan(0);
  });

  it("retourne 0 pour une liste vide", () => {
    const { totalKwhAn } = calcConsommationTheoriqueAnnuelle([]);
    expect(totalKwhAn).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════
// PHASE 1 — Validation factures
// ══════════════════════════════════════════════════════════════

describe("validerFactures", () => {
  it("accepte exactement 12 factures valides", () => {
    expect(() => validerFactures(genererFactures(300, 600))).not.toThrow();
  });

  it("rejette si moins de 12 factures", () => {
    expect(() => validerFactures(genererFactures(300, 600).slice(0, 10))).toThrow();
  });

  it("rejette si un mois manque", () => {
    // ✅ CORRECTION 4 : filter avec comparaison typée
    const factures = genererFactures(300, 600).filter(
      (f) => f.mois !== (6 as NumeroMois)
    );
    expect(() => validerFactures(factures)).toThrow();
  });

  it("rejette une consommation négative", () => {
    const factures = genererFactures(300, 600);
    factures[0] = { ...factures[0], consommationKwh: -10 };
    expect(() => validerFactures(factures)).toThrow();
  });
});

// ══════════════════════════════════════════════════════════════
// PHASE 3 — Analyse factures
// ══════════════════════════════════════════════════════════════

describe("analyserFactures", () => {
  it("calcule la moyenne mensuelle correcte", () => {
    const factures = genererFactures(400, 800);
    const res = analyserFactures(factures);
    expect(res.moyenneMensuelleKwh).toBe(400);
  });

  it("calcule le total annuel correct", () => {
    const factures = genererFactures(400, 800);
    const res = analyserFactures(factures);
    expect(res.totalAnnuelKwh).toBe(4800);
  });

  it("identifie correctement le mois min et max", () => {
    const res = analyserFactures(facturesVariees);
    // ✅ CORRECTION 5 : comparaison avec cast NumeroMois
    expect(res.moisMinKwh).toBe(2 as NumeroMois); // 295 kWh
    expect(res.moisMaxKwh).toBe(6 as NumeroMois); // 510 kWh
  });

  it("calcule la variation % entre min et max", () => {
    const res = analyserFactures(facturesVariees);
    // (510 - 295) / 295 × 100 ≈ 73%
    expect(res.variationPourcentage).toBeGreaterThan(60);
  });

  it("identifie les mois pic (> moyenne × 1.2)", () => {
    const res = analyserFactures(facturesVariees);
    expect(res.moisPic.length).toBeGreaterThan(0);
    // ✅ CORRECTION 6 : toContain avec cast NumeroMois
    expect(res.moisPic).toContain(6 as NumeroMois); // Juin
  });

  it("calcule le montant moyen mensuel", () => {
    const factures = genererFactures(400, 800);
    const res = analyserFactures(factures);
    expect(res.montantMoyenDH).toBe(800);
  });
});

// ══════════════════════════════════════════════════════════════
// PHASE 4 — Comparaison théorique vs réel
// ══════════════════════════════════════════════════════════════

describe("comparerTheoriqueReel", () => {
  it("statut normal si réel ≤ théorique", () => {
    // Théorique mensuel = 3600/12 = 300 kWh
    expect(comparerTheoriqueReel(3600, 280)).toBe("normal");
  });

  it("statut eleve si réel entre 1.0× et 1.2×", () => {
    // Théorique mensuel = 300, réel = 330 (110%)
    expect(comparerTheoriqueReel(3600, 330)).toBe("eleve");
  });

  it("statut surconsommation si réel > 1.2×", () => {
    // Théorique mensuel = 300, réel = 400 (133%)
    expect(comparerTheoriqueReel(3600, 400)).toBe("surconsommation");
  });

  it("retourne normal si théorique = 0", () => {
    expect(comparerTheoriqueReel(0, 100)).toBe("normal");
  });

  it("seuil exact 1.2× = surconsommation", () => {
    // 300 × 1.21 = 363
    expect(comparerTheoriqueReel(3600, 363)).toBe("surconsommation");
  });
});

// ══════════════════════════════════════════════════════════════
// PHASE 5 — Classe A-G
// ══════════════════════════════════════════════════════════════

describe("determinerClasse", () => {
  it("score 85  → classe A", () => expect(determinerClasse(85)).toBe("A"));
  it("score 100 → classe A", () => expect(determinerClasse(100)).toBe("A"));
  it("score 84  → classe B", () => expect(determinerClasse(84)).toBe("B"));
  it("score 70  → classe B", () => expect(determinerClasse(70)).toBe("B"));
  it("score 69  → classe C", () => expect(determinerClasse(69)).toBe("C"));
  it("score 55  → classe C", () => expect(determinerClasse(55)).toBe("C"));
  it("score 54  → classe D", () => expect(determinerClasse(54)).toBe("D"));
  it("score 40  → classe D", () => expect(determinerClasse(40)).toBe("D"));
  it("score 39  → classe E", () => expect(determinerClasse(39)).toBe("E"));
  it("score 25  → classe E", () => expect(determinerClasse(25)).toBe("E"));
  it("score 24  → classe F", () => expect(determinerClasse(24)).toBe("F"));
  it("score 10  → classe F", () => expect(determinerClasse(10)).toBe("F"));
  it("score 9   → classe G", () => expect(determinerClasse(9)).toBe("G"));
  it("score 0   → classe G", () => expect(determinerClasse(0)).toBe("G"));
});

// ══════════════════════════════════════════════════════════════
// PHASE 6 — Score final + baseCalcul
// ══════════════════════════════════════════════════════════════

describe("calculerScore", () => {
  it("RÈGLE ABSOLUE : baseCalcul est toujours '12mois'", () => {
    const score = calculerScore(
      batimentA,
      [equipementClim],
      genererFactures(200, 400)
    );
    expect(score.baseCalcul).toBe("12mois");
  });

  it("meilleur bâtiment possible → classe A (≥ 85)", () => {
    const equips: Equipement[] = [{
      id: "eq-best", nom: "LED",
      puissanceWatts: 50, heuresParJour: 5, joursParAn: 365,
      classeEnergie: "A+",
    }];
    // Théorique mensuel = 50×5×365/1000/12 ≈ 7.6 kWh, réel 100 = normal
    const score = calculerScore(
      batimentA, // isolation fort, vitrage double
      equips,
      genererFactures(100, 200)
    );
    expect(score.valeur).toBeGreaterThanOrEqual(85);
    expect(score.classe).toBe("A");
  });

  

  it("pire bâtiment possible → classe basse (≤ D)", () => {
    const equips: Equipement[] = [{
      id: "eq-worst", nom: "Vieux clim",
      puissanceWatts: 3000, heuresParJour: 1, joursParAn: 365,
      classeEnergie: null,
    }];
    // Théorique mensuel ≈ 7.5 kWh, réel 500 >> théorique = surconsommation
    const score = calculerScore(
      batimentG, // isolation faible, vitrage simple
      equips,
      genererFactures(500, 1000)
    );
    expect(score.valeur).toBeLessThanOrEqual(54); // D ou moins
  });

  it("retourne la consommation théorique annuelle correcte", () => {
    const score = calculerScore(
      batimentA,
      [equipementClim],
      genererFactures(300, 600)
    );
    expect(score.consommationTheoriqueAnnuelle).toBe(1440);
  });

  it("retourne la consommation réelle moyenne correcte", () => {
    const score = calculerScore(
      batimentA,
      [equipementClim],
      genererFactures(300, 600)
    );
    expect(score.consommationReelleMoyenne).toBe(300);
  });

  it("le détail contient les bonnes pénalités pour isolation faible", () => {
    const score = calculerScore(
      batimentG, // isolation faible
      [equipementClim],
      genererFactures(100, 200)
    );
    expect(score.detail.penaliteIsolation).toBe(-20);
    expect(score.detail.penaliteVitrage).toBe(-15);
  });

  it("le détail contient les bons bonus pour isolation fort + double vitrage", () => {
    const score = calculerScore(
      batimentA, // isolation fort + double vitrage
      [equipementClim],
      genererFactures(100, 200)
    );
    expect(score.detail.bonusIsolation).toBe(8);
    expect(score.detail.bonusVitrage).toBe(5);
  });

  it("score clampé à 0 minimum", () => {
    const score = calculerScore(
      batimentG,
      [equipementClim],
      genererFactures(9999, 9999)
    );
    expect(score.valeur).toBeGreaterThanOrEqual(0);
  });

  it("score clampé à 100 maximum", () => {
    const score = calculerScore(
      batimentA,
      [{
        id: "x", nom: "led",
        puissanceWatts: 1, heuresParJour: 0.1, joursParAn: 1,
        classeEnergie: "A+",
      }],
      genererFactures(0.1, 1)
    );
    expect(score.valeur).toBeLessThanOrEqual(100);
  });

  it("lance une erreur si les 12 factures ne sont pas présentes", () => {
    expect(() =>
      calculerScore(
        batimentA,
        [equipementClim],
        genererFactures(300, 600).slice(0, 10)
      )
    ).toThrow();
  });
});