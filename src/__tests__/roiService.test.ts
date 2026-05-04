// src/__tests__/roiService.test.ts
import { describe, it, expect } from "vitest";
import {
  calcROI,
  calcEconomiesAnnuelles,
  calcReductionCO2,
  analyserROI,
  formatROI,
} from "../services/roiService";

describe("calcROI", () => {
  it("retourne Infinity si économies = 0", () => {
    expect(calcROI(50000, 0)).toBe(Infinity);
  });

  it("retourne Infinity si économies négatives", () => {
    expect(calcROI(50000, -100)).toBe(Infinity);
  });

  it("calcule correctement le ROI", () => {
    // 10000 / 2000 = 5 ans
    expect(calcROI(10000, 2000)).toBe(5);
  });

  it("arrondit à 1 décimale", () => {
    // 10000 / 3000 = 3.333... → 3.3
    expect(calcROI(10000, 3000)).toBe(3.3);
  });

  it("ROI = 1 si coût = économies annuelles", () => {
    expect(calcROI(5000, 5000)).toBe(1);
  });
});

describe("calcEconomiesAnnuelles", () => {
  it("retourne 0 si pas de réduction", () => {
    expect(calcEconomiesAnnuelles(500, 500)).toBe(0);
  });

  it("retourne 0 si consommation après > avant", () => {
    expect(calcEconomiesAnnuelles(300, 500)).toBe(0);
  });

  it("calcule les économies annuelles correctement", () => {
    // réduction = 200 kWh/mois × tarifMoyen × 12
    const resultat = calcEconomiesAnnuelles(700, 500);
    expect(resultat).toBeGreaterThan(0);
    expect(typeof resultat).toBe("number");
  });

  it("les économies augmentent avec la réduction de conso", () => {
    const eco1 = calcEconomiesAnnuelles(600, 500); // réduction 100
    const eco2 = calcEconomiesAnnuelles(700, 500); // réduction 200
    expect(eco2).toBeGreaterThan(eco1);
  });
});

describe("calcReductionCO2", () => {
  it("retourne 0 pour une réduction nulle", () => {
    expect(calcReductionCO2(0)).toBe(0);
  });

  it("utilise le facteur 0.74 kgCO2/kWh", () => {
    // 1000 kWh × 0.74 = 740 kg
    expect(calcReductionCO2(1000)).toBe(740);
  });

  it("arrondit au kg entier", () => {
    const resultat = calcReductionCO2(100);
    expect(Number.isInteger(resultat)).toBe(true);
  });
});

describe("analyserROI", () => {
  it("retourne un objet ResultatROI complet", () => {
    const roi = analyserROI(30000, 800, 500);
    expect(roi).toHaveProperty("coutTravauxMAD");
    expect(roi).toHaveProperty("economiesAnnuellesDH");
    expect(roi).toHaveProperty("roiAnnees");
    expect(roi).toHaveProperty("economiesCumulees10AnsDAH");
    expect(roi).toHaveProperty("reductionFactureMensuelDH");
    expect(roi).toHaveProperty("rentableAnnee1");
  });

  it("économies cumulées 10 ans = économies annuelles × 10", () => {
    const roi = analyserROI(20000, 600, 400);
    expect(roi.economiesCumulees10AnsDAH).toBe(
      Math.round(roi.economiesAnnuellesDH * 10)
    );
  });

  it("rentableAnnee1 = true si ROI ≤ 1 an", () => {
    // coût très faible vs économies élevées
    const roi = analyserROI(100, 1000, 0);
    expect(roi.rentableAnnee1).toBe(true);
  });

  it("rentableAnnee1 = false si ROI > 1 an", () => {
    const roi = analyserROI(100000, 600, 500);
    expect(roi.rentableAnnee1).toBe(false);
  });

  it("reductionFactureMensuelDH ≥ 0", () => {
    const roi = analyserROI(15000, 700, 500);
    expect(roi.reductionFactureMensuelDH).toBeGreaterThanOrEqual(0);
  });
});

describe("formatROI", () => {
  it("retourne 'Non rentable' si Infinity", () => {
    expect(formatROI(Infinity)).toBe("Non rentable");
  });

  it("formate les années entières sans mois", () => {
    expect(formatROI(5)).toBe("5 ans");
  });

  it("formate 1 an au singulier", () => {
    expect(formatROI(1)).toBe("1 an");
  });

  it("formate les mois seuls si < 1 an", () => {
    expect(formatROI(0.5)).toBe("6 mois");
  });

  it("formate années + mois", () => {
    expect(formatROI(4.5)).toBe("4 ans 6 mois");
  });
});