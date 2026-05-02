// ─────────────────────────────────────────────────────────────
// src/services/claudeService.ts
// GreenBuild v3.0 — Claude API Anthropic avec streaming
// Étape 10 CDC
//
// RÈGLE ABSOLUE :
//   Claude NE calcule PAS. Il reçoit les résultats JSON
//   calculés par TypeScript et rédige uniquement le texte.
//   La clé API est saisie par l'utilisateur dans l'UI,
//   jamais dans le code ou le .env commité sur GitHub.
// ─────────────────────────────────────────────────────────────

import type { Score }          from "../types/Score";
import type { Recommandation } from "../types/Recommandation";
import type { PlanBudget }     from "../types/PlanBudget";
import type { Batiment }       from "../types/Batiment";

import { resumeProblemes }     from "../services/regleService";
import { resumePlanBudget }    from "../services/budgetService";


// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export interface ParametresRapport {
  batiment:        Batiment;
  score:           Score;
  recommandations: Recommandation[];
  planBudget?:     PlanBudget;
  apiKey:          string;
}

export interface ResultatStreaming {
  success: boolean;
  error?:  string;
}

// ══════════════════════════════════════════════════════════════
// Construction du prompt
// ══════════════════════════════════════════════════════════════

/**
 * Construit le prompt structuré envoyé à Claude.
 * Contient tous les résultats calculés en JSON.
 * Claude rédige le texte — il ne recalcule rien.
 */
function construirePrompt(params: ParametresRapport): string {
  const {
    batiment, score, recommandations, planBudget,
  } = params;

  const recoResume = resumeProblemes(recommandations);
  const planResume = planBudget ? resumePlanBudget(planBudget) : "Aucun budget cible défini.";

  const economiesTotales = recommandations.reduce(
    (s, r) => s + r.economiesAnnuellesDH, 0
  );
  const co2Total = recommandations.reduce(
    (s, r) => s + r.reductionCO2KgAn, 0
  );

  return `Tu es un expert en efficacité énergétique des bâtiments au Maroc, certifié AMEE.
Tu dois rédiger un rapport professionnel, clair et bienveillant, en français.

IMPORTANT : Utilise UNIQUEMENT les données JSON ci-dessous. Ne calcule rien toi-même.
Ton rôle est exclusivement de rédiger le texte explicatif.

═══════════════════════════════════════
DONNÉES DU BÂTIMENT
═══════════════════════════════════════
Type         : ${batiment.type}
Surface      : ${batiment.surfaceM2} m²
Isolation    : ${batiment.isolation}
Vitrage      : ${batiment.vitrage}
Zone RTCM    : ${batiment.zoneClimatique}
Région       : ${batiment.region}
Ville        : ${batiment.ville}

═══════════════════════════════════════
RÉSULTATS DU SCORE (calculés sur 12 mois)
═══════════════════════════════════════
Score          : ${score.valeur} / 100
Classe         : ${score.classe} (${score.valeur >= 85 ? "Très performant" : score.valeur >= 70 ? "Performant" : score.valeur >= 55 ? "Assez performant" : score.valeur >= 40 ? "Peu performant" : "Énergivore"})
Base de calcul : ${score.baseCalcul} (toujours sur la moyenne des 12 factures ONEE)
Consom. théorique annuelle : ${score.consommationTheoriqueAnnuelle} kWh/an
Consom. réelle mensuelle   : ${score.consommationReelleMoyenne} kWh/mois
Statut comparaison         : ${score.statutComparaison}

Détail pénalités/bonus :
  - Isolation   : ${score.detail.penaliteIsolation > 0 ? "+" : ""}${score.detail.penaliteIsolation} pts
  - Vitrage      : ${score.detail.penaliteVitrage > 0 ? "+" : ""}${score.detail.penaliteVitrage} pts
  - Surconsommation : ${score.detail.penaliteSurconsommation > 0 ? "+" : ""}${score.detail.penaliteSurconsommation} pts
  - Bonus équipements : +${score.detail.bonusEquipements} pts
  - Bonus vitrage     : +${score.detail.bonusVitrage} pts
  - Bonus isolation   : +${score.detail.bonusIsolation} pts

═══════════════════════════════════════
PROBLÈMES DÉTECTÉS ET RECOMMANDATIONS
═══════════════════════════════════════
${recoResume}

Économies annuelles cumulées si tous travaux réalisés : ${economiesTotales} DH/an
Réduction CO₂ totale estimée                          : ${co2Total} kg/an

═══════════════════════════════════════
PLAN BUDGET CIBLE
═══════════════════════════════════════
${planResume}

═══════════════════════════════════════
INSTRUCTIONS DE RÉDACTION
═══════════════════════════════════════
Rédige un rapport structuré en 4 parties :

1. **Synthèse exécutive** (2-3 phrases) : résume le score, la classe et le statut général du bâtiment de façon claire et accessible.

2. **Analyse détaillée** (3-4 paragraphes) : explique les pénalités et bonus, le statut de consommation (normal/élevé/surconsommation), et ce que cela signifie concrètement pour le propriétaire.

3. **Plan d'action prioritaire** (liste structurée) : reprends les recommandations dans l'ordre de priorité, explique chaque solution en termes simples, mentionne les économies et le ROI de façon compréhensible.

4. **Conclusion et encouragements** (1-2 phrases) : termine de façon positive et motivante.

Ton ton doit être professionnel mais accessible. Pas de jargon technique inutile.
Adapte le discours à un propriétaire marocain qui veut comprendre et agir.
Utilise des chiffres concrets (DH, kWh, années) pour rendre le rapport tangible.`;
}

// ══════════════════════════════════════════════════════════════
// APPEL API AVEC STREAMING
// ══════════════════════════════════════════════════════════════

/**
 * Appelle Claude API avec streaming et appelle onChunk à chaque fragment.
 *
 * @param params    Données du dossier (bâtiment, score, recommandations…)
 * @param onChunk   Callback appelé à chaque fragment de texte reçu
 * @param onDone    Callback appelé quand le streaming est terminé
 * @returns         ResultatStreaming avec success/error
 */
export async function genererRapportStream(
  params:  ParametresRapport,
  onChunk: (chunk: string)  => void,
  onDone:  (texte: string)  => void
): Promise<ResultatStreaming> {
  const prompt = construirePrompt(params);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":            "application/json",
        "x-api-key":               params.apiKey,
        "anthropic-version":       "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1500,
        stream:     true,
        messages: [
          {
            role:    "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = (errBody as { error?: { message?: string } })
        ?.error?.message ?? `Erreur HTTP ${response.status}`;
      return { success: false, error: message };
    }

    // ── Lecture du stream SSE ─────────────────────────────────
    const reader  = response.body?.getReader();
    const decoder = new TextDecoder();
    let   texteComplet = "";

    if (!reader) {
      return { success: false, error: "Impossible de lire le flux de réponse." };
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk  = decoder.decode(value, { stream: true });
      const lignes = chunk.split("\n");

      for (const ligne of lignes) {
        if (!ligne.startsWith("data: ")) continue;
        const data = ligne.slice(6).trim();
        if (data === "[DONE]") break;

        try {
          const parsed = JSON.parse(data) as {
            type:  string;
            delta?: { type: string; text: string };
          };

          if (
            parsed.type  === "content_block_delta" &&
            parsed.delta?.type === "text_delta" &&
            parsed.delta?.text
          ) {
            const fragment = parsed.delta.text;
            texteComplet  += fragment;
            onChunk(fragment);
          }
        } catch {
          // Fragment JSON incomplet — normal en streaming, on ignore
        }
      }
    }

    onDone(texteComplet);
    return { success: true };

  } catch (err) {
    const message = err instanceof Error
      ? err.message
      : "Erreur réseau lors de l'appel à Claude API.";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════
// VERSION SANS STREAMING (fallback / tests)
// ══════════════════════════════════════════════════════════════

/**
 * Version sans streaming — retourne le texte complet d'un coup.
 * Utilisée dans les tests Vitest ou comme fallback.
 */
export async function genererRapport(
  params: ParametresRapport
): Promise<{ success: boolean; texte?: string; error?: string }> {
  const prompt = construirePrompt(params);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         params.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return {
        success: false,
        error: (errBody as { error?: { message?: string } })?.error?.message
          ?? `Erreur HTTP ${response.status}`,
      };
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const texte = data.content
      .filter((b) => b.type === "text")
      .map((b)   => b.text)
      .join("");

    return { success: true, texte };

  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erreur réseau.",
    };
  }
}