// ─────────────────────────────────────────────────────────────
// src/types/DossierAudit.ts
// GreenBuild v3.0 — 8e type (Étape 5 CDC) — type racine
// ─────────────────────────────────────────────────────────────

import type { Batiment }        from "./Batiment";
import type { Equipement }      from "./Equipement";
import type { Facture }         from "./Facture";
import type { Score }           from "./Score";
import type { Recommandation }  from "./Recommandation";
import type { Entreprise }      from "./Entreprise";
import type { PlanBudget }      from "./PlanBudget";

/**
 * Statut du dossier dans le workflow de validation
 *   brouillon    : en cours de saisie par le propriétaire
 *   soumis       : formulaire complété, calculs effectués
 *   en_audit     : assigné à un auditeur certifié
 *   valide       : approuvé par l'auditeur et transmis à l'AMEE
 *   rejete       : refusé par l'auditeur (motif requis)
 *   certifie     : certificat officiel émis par l'AMEE
 */
export type StatutDossier =
  | "brouillon"
  | "soumis"
  | "en_audit"
  | "valide"
  | "rejete"
  | "certifie";

/**
 * Interface principale du dossier  d'audit énergétique
 * C'est l'objet central stocké dans dossierStore.ts (Zustand)
 * Il regroupe tous les types définis dans les étapes précédentes
 *
 * Flux de données :
 *   SoumissionForm → dossierStore.calculerTout() → Dashboard
 *
 * Cycle de vie :
 *   Propriétaire (soumis) → Technicien (mesures) → Auditeur (validé) → AMEE (certifié)
 */
export interface DossierAudit {
  // ── Identifiant ────────────────────────────────────────────────────────────

  /** UUID unique du dossier */
  id: string;

  /** Numéro de certificat (ex: "GB-2024-001234") — généré à la certification */
  numeroCertificat?: string;

  // ── Données du formulaire (Étapes 1–3) ─────────────────────────────────────

  /** Données du bâtiment (Étape 1 SoumissionForm) */
  batiment: Batiment;

  /** Liste des équipements électriques (Étape 2 SoumissionForm) */
  equipements: Equipement[];

  /**
   * Les 12 factures ONEE obligatoires (Étape 3 SoumissionForm)
   * RÈGLE : doit toujours contenir exactement 12 entrées (mois 1–12)
   */
  factures: Facture[];

  /**
   * Budget mensuel cible saisi par l'utilisateur en DH (optionnel)
   * Si renseigné, déclenche le calcul du PlanBudget (Phase 8)
   */
  budgetCibleDH?: number;

  // ── Résultats calculés par le pipeline (Phases 1–9) ───────────────────────

  /**
   * Score A–G calculé par scoreService.ts
   * Toujours baseCalcul: "12mois"
   */
  score?: Score;

  /** Problèmes détectés par regleService.ts (règles R01–R07) */
  recommandations?: Recommandation[];

  /**
   * Carte des entreprises par code de règle
   * Clé = code règle (ex: "R01"), Valeur = top 3 entreprises certifiées
   */
  entreprisesParRegle?: Record<string, Entreprise[]>;

  /** Plan de réduction d'usage selon le budget cible */
  planBudget?: PlanBudget;

  /** Rapport professionnel rédigé par Claude API (streaming) */
  rapportClaude?: string;

  // ── Workflow de validation ─────────────────────────────────────────────────

  statut: StatutDossier;

  /** ID de l'auditeur assigné */
  auditeurId?: string;

  /** Commentaire de l'auditeur lors de la validation/rejet */
  commentaireAuditeur?: string;

  /** Mesures physiques saisies par le technicien terrain */
  mesuresTechnicien?: Record<string, unknown>;

  // ── Timestamps ─────────────────────────────────────────────────────────────

  createdAt: Date;
  updatedAt: Date;
  soumisAt?: Date;
  valideAt?: Date;
  certifieAt?: Date;
}