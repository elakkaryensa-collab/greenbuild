// ─────────────────────────────────────────────────────────────
// src/components/ScoreEnergetique.tsx
// GreenBuild v3.0 — Score A-G animé (Framer Motion)
// CDC : "le score compte jusqu'à la valeur finale"
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef }     from "react";
import { motion, animate,
         useInView }             from "framer-motion";
import type { Score }            from "../types/Score";
import { COULEURS_CLASSES,
         LABELS_CLASSES,
         SEUILS_CLASSES }        from "../types/Score";

// ── Props ─────────────────────────────────────────────────────

interface ScoreEnergetiqueProps {
  score:    Score;
  /** Taille du composant : "sm" | "md" | "lg" */
  taille?:  "sm" | "md" | "lg";
  /** Affiche le détail des pénalités/bonus */
  detail?:  boolean;
  /** Affiche la barre de progression par rapport aux seuils */
  barre?:   boolean;
  className?: string;
}

// ── Dimensions par taille ─────────────────────────────────────

const TAILLES = {
  sm: { cercle: "w-20 h-20",  lettre: "text-3xl",  valeur: "text-sm"  },
  md: { cercle: "w-32 h-32",  lettre: "text-5xl",  valeur: "text-base"},
  lg: { cercle: "w-44 h-44",  lettre: "text-7xl",  valeur: "text-lg"  },
};

// ── Compteur animé ────────────────────────────────────────────

function AnimatedNumber({ valeur }: { valeur: number }) {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, valeur, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return ctrl.stop;
  }, [inView, valeur]);

  return <span ref={ref}>0</span>;
}

// ── Composant principal ───────────────────────────────────────

export default function ScoreEnergetique({
  score,
  taille  = "md",
  detail  = false,
  barre   = true,
  className = "",
}: ScoreEnergetiqueProps) {
  const couleurs = COULEURS_CLASSES[score.classe];
  const label    = LABELS_CLASSES[score.classe];
  const dims     = TAILLES[taille];

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>

      {/* ── Cercle animé ──────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
        className={`
          ${dims.cercle}
          ${couleurs.bg} ${couleurs.border}
          border-4 rounded-full
          flex flex-col items-center justify-center
          shadow-lg select-none
        `}
      >
        {/* Lettre de classe */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={`${dims.lettre} font-extrabold leading-none ${couleurs.text}`}
        >
          {score.classe}
        </motion.span>

        {/* Valeur numérique animée */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`${dims.valeur} font-semibold ${couleurs.text} opacity-80 leading-none mt-1`}
        >
          <AnimatedNumber valeur={score.valeur} />/100
        </motion.span>
      </motion.div>

      {/* ── Label et statut ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className={`font-semibold text-sm ${couleurs.text}`}>{label}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          Calculé sur {score.baseCalcul} · {score.consommationReelleMoyenne} kWh/mois moy.
        </p>
      </motion.div>

      {/* ── Barre 7 classes ───────────────────────────────── */}
      {barre && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex gap-0.5 w-full max-w-xs"
        >
          {(["A","B","C","D","E","F","G"] as const).map((cls) => {
            const c   = COULEURS_CLASSES[cls];
            const act = cls === score.classe;
            return (
              <div
                key={cls}
                className={`
                  flex-1 h-2.5 rounded-sm transition-all
                  ${c.bg} ${act ? "scale-y-150 shadow" : "opacity-50"}
                `}
                title={`${cls} : ${SEUILS_CLASSES[cls].min}–${SEUILS_CLASSES[cls].max ?? 100} pts`}
              />
            );
          })}
        </motion.div>
      )}

      {/* ── Détail pénalités/bonus ────────────────────────── */}
      {detail && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs bg-stone-50 dark:bg-stone-800
                     border border-stone-100 dark:border-stone-700
                     rounded-xl p-4 space-y-1.5"
        >
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Détail du calcul
          </p>
          <DetailLigne label="Base"             valeur={100}                            positif />
          <DetailLigne label="Isolation"        valeur={score.detail.penaliteIsolation} />
          <DetailLigne label="Vitrage"          valeur={score.detail.penaliteVitrage}   />
          <DetailLigne label="Surconsommation" valeur={score.detail.penaliteSurconsommation} />
          <DetailLigne label="Bonus équipements" valeur={score.detail.bonusEquipements} positif />
          <DetailLigne label="Bonus vitrage"   valeur={score.detail.bonusVitrage}      positif />
          <DetailLigne label="Bonus isolation" valeur={score.detail.bonusIsolation}    positif />
          <div className="border-t border-stone-200 dark:border-stone-600 pt-1.5 mt-1">
            <DetailLigne label="Score final" valeur={score.valeur} positif bold />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Sous-composant ligne de détail ────────────────────────────

function DetailLigne({
  label, valeur, positif = false, bold = false,
}: {
  label:    string;
  valeur:   number;
  positif?: boolean;
  bold?:    boolean;
}) {
  const isZero = valeur === 0;
  const color  = isZero
    ? "text-stone-400"
    : positif || valeur > 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${bold ? "font-semibold text-stone-700 dark:text-stone-200" : "text-stone-500 dark:text-stone-400"}`}>
        {label}
      </span>
      <span className={`text-xs font-mono font-semibold ${color}`}>
        {valeur > 0 && !bold ? "+" : ""}{valeur}
      </span>
    </div>
  );
}