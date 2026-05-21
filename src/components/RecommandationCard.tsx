// ─────────────────────────────────────────────────────────────
// src/components/EntreprisesPartenaires.tsx
// GreenBuild v3.0 — 3 cartes entreprises certifiées AMEE
// ─────────────────────────────────────────────────────────────

import { motion }            from "framer-motion";
import type { Entreprise }  from "../types/Entreprise";

interface EntreprisesPartenairesProps {
  entreprises: Entreprise[];
  titre?:      string;
}

function Etoiles({ note }: { note: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={`text-sm leading-none ${
          i <= Math.floor(note) ? "text-amber-400" :
          i - note < 1         ? "text-amber-300" : "text-stone-200 dark:text-stone-600"
        }`}>★</span>
      ))}
      <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 ml-1">
        {note.toFixed(1)}
      </span>
    </div>
  );
}

const SPECIALITE_CONFIG: Record<string, { label: string; color: string }> = {
  isolation:   { label: "Isolation",   color: "bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200"   },
  vitrage:     { label: "Vitrage",     color: "bg-cyan-100   text-cyan-800   dark:bg-cyan-900   dark:text-cyan-200"   },
  electricite: { label: "Électricité", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  thermique:   { label: "Thermique",   color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  solaire:     { label: "Solaire",     color: "bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200"  },
};

function CarteEntreprise({ entreprise, index }: { entreprise: Entreprise; index: number }) {
  const spec = SPECIALITE_CONFIG[entreprise.specialite] ?? SPECIALITE_CONFIG.electricite;

  const mailtoHref = [
    `mailto:${entreprise.email}`,
    `?subject=Demande%20de%20devis%20GreenBuild`,
    `&body=Bonjour%2C%0A%0AJe%20souhaite%20obtenir%20un%20devis%20pour%20des%20travaux%20de%20`,
    encodeURIComponent(entreprise.specialite),
    `.%0A%0ACordialement`,
  ].join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {index + 1}
            </span>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
              {entreprise.nom}
            </h3>
          </div>
          <Etoiles note={entreprise.noteClients} />
          <p className="text-[10px] text-stone-400 mt-0.5">{entreprise.nbAvis} avis clients</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {entreprise.certifiee && (
            <span className="text-[10px] font-semibold bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">
              ✓ Certifié AMEE
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${spec.color}`}>
            {spec.label}
          </span>
        </div>
      </div>

      {/* Description */}
      {entreprise.description && (
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          {entreprise.description}
        </p>
      )}

      {/* Coordonnées */}
      <div className="space-y-2 border-t border-stone-50 dark:border-stone-800 pt-3">
        <a href={`tel:${entreprise.telephone.replace(/\s/g, "")}`}
          className="flex items-center gap-2.5 text-xs text-stone-600 dark:text-stone-300 hover:text-green-600 dark:hover:text-green-400 transition-colors no-underline group">
          <span className="w-6 h-6 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-center text-sm flex-shrink-0 group-hover:bg-green-100 dark:group-hover:bg-green-900 transition-colors">📞</span>
          <span className="font-medium">{entreprise.telephone}</span>
        </a>
        <a href={mailtoHref}
          className="flex items-center gap-2.5 text-xs text-stone-600 dark:text-stone-300 hover:text-green-600 dark:hover:text-green-400 transition-colors no-underline group">
          <span className="w-6 h-6 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-center text-sm flex-shrink-0 group-hover:bg-green-100 dark:group-hover:bg-green-900 transition-colors">✉️</span>
          <span className="truncate">{entreprise.email}</span>
        </a>
        <div className="flex items-start gap-2.5 text-xs text-stone-500 dark:text-stone-400">
          <span className="w-6 h-6 bg-stone-50 dark:bg-stone-800 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5">📍</span>
          <span className="leading-relaxed">{entreprise.adresse}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-stone-400 dark:text-stone-500">
          <span className="w-6 h-6 bg-stone-50 dark:bg-stone-800 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🗺️</span>
          <span>{entreprise.region}</span>
        </div>
      </div>

      {/* Boutons */}
      <div className="mt-1 flex gap-2">
        <a href={`tel:${entreprise.telephone.replace(/\s/g, "")}`}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-center bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors no-underline block">
          📞 Appeler
        </a>
        <a href={mailtoHref} target="_blank" rel="noreferrer"
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-center bg-green-600 hover:bg-green-700 text-white transition-colors no-underline block">
          Devis par mail
        </a>
      </div>
    </motion.div>
  );
}

export default function EntreprisesPartenaires({ entreprises, titre }: EntreprisesPartenairesProps) {
  if (entreprises.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400 text-sm">
        Aucune entreprise disponible pour cette spécialité.
      </div>
    );
  }

  return (
    <div>
      {titre && (
        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
          {titre}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entreprises.slice(0, 3).map((e, i) => (
          <CarteEntreprise key={e.id} entreprise={e} index={i} />
        ))}
      </div>
    </div>
  );
}