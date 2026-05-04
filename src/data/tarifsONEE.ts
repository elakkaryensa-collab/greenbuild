// src/data/tarifsONEE.ts
// GreenBuild v3.0 — Tarifs ONEE (Office National de l'Électricité)

export const TARIFS_ONEE = {
  /** Tarif basse tranche (0–100 kWh/mois) en DH/kWh ....*/
  trancheBasse:   0.9010,
  /** Tarif tranche moyenne (101–200 kWh/mois) en DH/kWh */
  trancheMoyenne: 1.0573,
  /** Tarif haute tranche (> 200 kWh/mois) en DH/kWh */
  trancheHaute:   1.4796,
  /** Tarif moyen pondéré utilisé pour les estimations en DH/kWh */
  tarifMoyen:     1.20,
};

export const NORMES_RTCM = {
  cotiere:       80,   // kWh/m²/an max zone côtière
  continentale:  100,  // kWh/m²/an max zone continentale
  montagne:      120,  // kWh/m²/an max zone montagne
};