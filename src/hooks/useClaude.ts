// src/hooks/useClaude.ts
import { useState, useCallback }    from "react";
import { useQueryClient }           from "@tanstack/react-query";
import { useDossierStore }          from "../store/dossierStore";

const QUERY_KEY = "rapport-claude";

export function useClaude() {
  const queryClient     = useQueryClient();
  const score           = useDossierStore((s) => s.score);
  const batiment        = useDossierStore((s) => s.batiment);
  // cSpell:ignore recommandations
  const recommandations = useDossierStore((s) => s.recommandations);
  const planBudget      = useDossierStore((s) => s.planBudget);
  const rapportClaude   = useDossierStore((s) => s.rapportClaude);
  const appendRapport   = useDossierStore((s) => s.appendRapportClaude);
  const setRapport      = useDossierStore((s) => s.setRapportClaude);

  const [isStreaming, setIsStreaming] = useState(false);
  const [erreur,      setErreur]      = useState<string | null>(null);

  const generer = useCallback(async () => {
    if (!batiment || !score) {
      setErreur("Données insuffisantes pour générer le rapport.");
      return;
    }

    setErreur(null);
    setIsStreaming(true);
    setRapport("");

    try {
      const prompt = `
Tu es un expert en efficacité énergétique au Maroc (norme RTCM).
Génère un rapport professionnel pour ce bâtiment :

- Type : ${batiment.type}
- Surface : ${batiment.surfaceM2} m²
- Ville : ${batiment.ville}
- Isolation : ${batiment.isolation}
- Vitrage : ${batiment.vitrage}
- Classe énergétique : ${score.classe}
- Score : ${score.valeur}/100
- Consommation théorique : ${score.consommationTheoriqueAnnuelle} kWh/an
- Statut : ${score.statutComparaison}
- Problèmes détectés : ${recommandations.length}

Rédige un rapport structuré avec :
1. Résumé de la situation
2. Analyse des points critiques
3. Recommandations prioritaires
4. Estimation des économies potentielles
Sois précis et professionnel, en français.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
          "HTTP-Referer":  "http://localhost:5181/",
          "X-Title":       "GreenBuild",
        },
        body: JSON.stringify({
          model:      "anthropic/claude-sonnet-4-5",
          max_tokens: 800,
          messages:   [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(err?.error?.message ?? `Erreur HTTP ${response.status}`);
      }

      const data = await response.json() as {
        choices?: { message: { content: string } }[];
      };

      const texteComplet = data.choices?.[0]?.message?.content ?? "";
      if (!texteComplet) throw new Error("Réponse vide de l'API");

      // Simulation streaming mot par mot
      // APRÈS — affiche directement sans boucle
setRapport(texteComplet);
queryClient.setQueryData([QUERY_KEY], texteComplet);

    } catch (err: unknown) {
      setErreur(err instanceof Error ? err.message : "Erreur réseau inconnue");
    } finally {
      setIsStreaming(false);
    }
    // cSpell:ignore recommandations
  }, [batiment, score, recommandations, planBudget,
      appendRapport, setRapport, queryClient]);

  const effacerRapport = useCallback(() => {
    setRapport("");
    queryClient.removeQueries({ queryKey: [QUERY_KEY] });
    setErreur(null);
  }, [setRapport, queryClient]);

  return {
    generer,
    effacerRapport,

    // On garde apiKey/setApiKey vides pour ne pas casser Dashboard.tsx
    apiKey:      "",
    setApiKey:   () => {},
    apiKeyValide: true,

    isStreaming,
    isError:    erreur !== null,
    erreur,
    hasRapport: rapportClaude.length > 0,
    rapport:    rapportClaude,

    peutGenerer: !!score && !!batiment && !isStreaming,
  };
}