// ─────────────────────────────────────────────────────────────
// src/data/normesRTCM.ts
// GreenBuild v3.0 — Normes RTCM et données régions Maroc
// ─────────────────────────────────────────────────────────────

import type { RegionMaroc } from "../types/Batiment";
import type { ClasseEnergetique } from "../types/Score";

// ── Seuils RTCM par zone climatique (kWh/m²/an) ──────────────

export const SEUILS_RTCM = {
  cotiere:       80,   // Zone côtière : Casablanca, Rabat, Tanger, Agadir
  continentale:  100,  // Zone continentale : Marrakech, Fès, Meknès, Oujda
  montagne:      120,  // Zone montagne : Ifrane, Azrou, Midelt, Ouarzazate
} as const;

// ── Zone climatique par région ────────────────────────────────

export const ZONE_PAR_REGION: Record<
  RegionMaroc,
  "cotiere" | "continentale" | "montagne"
> = {
  "Tanger-Tétouan-Al Hoceïma":  "cotiere",
  "Oriental":                    "continentale",
  "Fès-Meknès":                  "continentale",
  "Rabat-Salé-Kénitra":          "cotiere",
  "Béni Mellal-Khénifra":        "montagne",
  "Casablanca-Settat":           "cotiere",
  "Marrakech-Safi":              "continentale",
  "Drâa-Tafilalet":              "continentale",
  "Souss-Massa":                 "cotiere",
  "Guelmim-Oued Noun":           "cotiere",
  "Laâyoune-Sakia El Hamra":     "cotiere",
  "Dakhla-Oued Ed-Dahab":        "cotiere",
};

// ─────────────────────────────────────────────────────────────
// src/data/mockRegions.ts
// GreenBuild v3.0 — 12 régions Maroc avec données mock
// Utilisées par CarteMaroc.tsx (Leaflet Admin AMEE)
// ─────────────────────────────────────────────────────────────

export interface RegionData {
  id:             string;
  nom:            RegionMaroc;
  classemoyenne:  ClasseEnergetique;
  scoreMoyen:     number;
  nbDossiers:     number;
  nbCertifies:    number;
  // Coordonnées approximatives du centroïde pour Leaflet
  lat:            number;
  lng:            number;
}

export const MOCK_REGIONS: RegionData[] = [
  {
    id: "tanger",       nom: "Tanger-Tétouan-Al Hoceïma",  classemoyenne: "C", scoreMoyen: 62, nbDossiers: 148, nbCertifies: 89,  lat: 35.77, lng: -5.80 },
  {
    id: "oriental",     nom: "Oriental",                    classemoyenne: "D", scoreMoyen: 48, nbDossiers:  96, nbCertifies: 52,  lat: 34.68, lng: -1.91 },
  {
    id: "fes",          nom: "Fès-Meknès",                  classemoyenne: "C", scoreMoyen: 58, nbDossiers: 203, nbCertifies: 121, lat: 34.03, lng: -5.00 },
  {
    id: "rabat",        nom: "Rabat-Salé-Kénitra",          classemoyenne: "B", scoreMoyen: 74, nbDossiers: 312, nbCertifies: 201, lat: 34.01, lng: -6.83 },
  {
    id: "beni-mellal",  nom: "Béni Mellal-Khénifra",        classemoyenne: "E", scoreMoyen: 35, nbDossiers:  74, nbCertifies: 31,  lat: 32.37, lng: -6.35 },
  {
    id: "casablanca",   nom: "Casablanca-Settat",            classemoyenne: "B", scoreMoyen: 71, nbDossiers: 487, nbCertifies: 334, lat: 33.57, lng: -7.59 },
  {
    id: "marrakech",    nom: "Marrakech-Safi",              classemoyenne: "C", scoreMoyen: 61, nbDossiers: 267, nbCertifies: 158, lat: 31.63, lng: -8.00 },
  {
    id: "draa",         nom: "Drâa-Tafilalet",              classemoyenne: "E", scoreMoyen: 38, nbDossiers:  43, nbCertifies: 18,  lat: 31.92, lng: -4.43 },
  {
    id: "souss",        nom: "Souss-Massa",                 classemoyenne: "B", scoreMoyen: 76, nbDossiers: 198, nbCertifies: 142, lat: 30.42, lng: -9.60 },
  {
    
    id: "guelmim",      nom: "Guelmim-Oued Noun",           classemoyenne: "D", scoreMoyen: 44, nbDossiers:  31, nbCertifies: 14,  lat: 29.00, lng: -10.05 },
  {
    id: "laayoune",     nom: "Laâyoune-Sakia El Hamra",     classemoyenne: "D", scoreMoyen: 47, nbDossiers:  27, nbCertifies: 11,  lat: 27.15, lng: -13.20 },
  {
    id: "dakhla",       nom: "Dakhla-Oued Ed-Dahab",        classemoyenne: "C", scoreMoyen: 56, nbDossiers:  19, nbCertifies:  8,  lat: 23.68, lng: -15.93 },
];