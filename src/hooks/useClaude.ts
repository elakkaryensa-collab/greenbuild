// ─────────────────────────────────────────────────────────────
// src/hooks/useClaude.ts
// GreenBuild v3.0 — Hook Claude API + streaming (Étape 10)
//
// Utilise TanStack Query v5 pour le cache et la gestion
// des états loading/error/data.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback }       from "react";
import {  useQueryClient }    from "@tanstack/react-query";
import { useDossierStore }             from "../store/dossierStore";
import { genererRapportStream }        from "../services/claudeService";

// ── Clé de cache TanStack Query ───────────────────────────────
const QUERY_KEY = "rapport-claude";

/**
 * Hook qui gère l'appel Claude API avec streaming.
 *
 * Usage dans Dashboard.tsx :
 *   const { generer, isStreaming, isError, rapport, apiKey, setApiKey } = useClaude();
 */
export function useClaude() {
  const queryClient      = useQueryClient();
  const score            = useDossierStore((s) => s.score);
  const batiment         = useDossierStore((s) => s.batiment);
  const recommandations  = useDossierStore((s) => s.recommandations);
  const planBudget       = useDossierStore((s) => s.planBudget);
  const rapportClaude    = useDossierStore((s) => s.rapportClaude);
  const appendRapport    = useDossierStore((s) => s.appendRapportClaude);
  const setRapport       = useDossierStore((s) => s.setRapportClaude);

  // Clé API saisie par l'utilisateur dans l'UI (jamais dans le code)
  const [apiKey,      setApiKey]      = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [erreur,      setErreur]      = useState<string | null>(null);

  /**
   * Déclenche la génération du rapport avec streaming.
   * Appelle onChunk à chaque fragment → le texte s'affiche progressivement.
   */
  const generer = useCallback(async () => {
    if (!apiKey.trim()) {
      setErreur("Veuillez saisir votre clé API Claude (Anthropic).");
      return;
    }
    if (!batiment || !score) {
      setErreur("Données insuffisantes pour générer le rapport.");
      return;
    }

    setErreur(null);
    setIsStreaming(true);
    setRapport(""); // Reset avant streaming

    const resultat = await genererRapportStream(
      { batiment, score, recommandations, planBudget: planBudget ?? undefined, apiKey },
      // onChunk — chaque fragment de texte s'affiche en temps réel
      (chunk) => appendRapport(chunk),
      // onDone — rapport complet reçu
      (texteComplet) => {
        setRapport(texteComplet);
        // Mettre en cache dans TanStack Query
        queryClient.setQueryData([QUERY_KEY], texteComplet);
      }
    );

    setIsStreaming(false);

    if (!resultat.success) {
      setErreur(resultat.error ?? "Erreur lors de la génération du rapport.");
    }
  }, [apiKey, batiment, score, recommandations, planBudget,
      appendRapport, setRapport, queryClient]);

  const effacerRapport = useCallback(() => {
    setRapport("");
    queryClient.removeQueries({ queryKey: [QUERY_KEY] });
    setErreur(null);
  }, [setRapport, queryClient]);

  return {
    // Actions
    generer,
    effacerRapport,

    // État clé API
    apiKey,
    setApiKey,
    apiKeyValide: apiKey.trim().startsWith("sk-ant-"),

    // Statuts
    isStreaming,
    isError:    erreur !== null,
    erreur,
    hasRapport: rapportClaude.length > 0,

    // Résultat
    rapport: rapportClaude,

    // Prêt à générer
    peutGenerer:
      !!score && !!batiment && apiKey.trim().length > 0 && !isStreaming,
  };
}