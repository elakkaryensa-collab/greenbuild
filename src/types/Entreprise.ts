// ─────────────────────────────────────────────────────────────
// src/types/Entreprise.ts
// GreenBuild v3.0 — 6e type (Étape 5 CDC)
// ─────────────────────────────────────────────────────────────

import type { SpecialiteEntreprise } from "./Recommandation";
import type { RegionMaroc } from "./Batiment";

/**
 * Interface d'une entreprise partenaire certifiée
 * Données mockées dans src/data/entreprisesPartenaires.ts (20 entreprises)
 *
 * Utilisée par :
 *   - entrepriseService.getEntreprisesParProbleme()
 *   - EntreprisesPartenaires.tsx (affichage des 3 meilleures)
 */
export interface Entreprise {
  /** Identifiant unique */
  id: string;

  /** Raison sociale de l'entreprise */
  nom: string;

  /**
   * Spécialité principale
   * Utilisée comme critère de filtrage dans entrepriseService.ts
   */
  specialite: SpecialiteEntreprise;

  /** Région marocaine où l'entreprise intervient */
  region: RegionMaroc;

  /**
   * Numéro de téléphone au format marocain
   * Affiché avec href="tel:+212..." dans EntreprisesPartenaires.tsx
   */
  telephone: string;

  /**
   * Adresse email professionnelle
   * Affichée avec href="mailto:..." dans EntreprisesPartenaires.tsx
   */
  email: string;

  /** Adresse physique complète */
  adresse: string;

  /**
   * Note clients sur 5
   * Utilisée pour le tri décroissant dans entrepriseService.ts
   * Plage : 3.5 – 5.0
   */
  noteClients: number;

  /** Nombre d'avis clients (donne de la crédibilité à la note) */
  nbAvis: number;

  /**
   * Certification AMEE (Agence Marocaine pour l'Efficacité Énergétique)
   * Seules les entreprises certifiées sont retournées
   */
  certifiee: boolean;

  /** Description courte des services proposés (optionnel) */
  description?: string;

  /** URL du site web (optionnel) */
  siteWeb?: string;
}