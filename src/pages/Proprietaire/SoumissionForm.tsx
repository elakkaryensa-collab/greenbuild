// src/pages/Proprietaire/SoumissionForm.tsx
// GreenBuild v3.0 — Palette alignée Landing + AnalystePage

import { useNavigate }                         from "react-router-dom";
import { useState }                            from "react";
import { useForm, useFieldArray, useWatch }    from "react-hook-form";
import { zodResolver }                         from "@hookform/resolvers/zod";
import { z }                                   from "zod";
import { motion, AnimatePresence }             from "framer-motion";
import { v4 as uuid }                          from "uuid";
import { useDossierStore }                     from "../../store/dossierStore";
import { useScore }                            from "../../hooks/useScore";
import { EQUIPEMENTS_PRESELECTIONNES }         from "../../types/Equipement";
import { NOM_MOIS }                            from "../../types/Facture";
import type { RegionMaroc }                    from "../../types/Batiment";
import type { ClasseEnergie }                  from "../../types/Equipement";
import type { NumeroMois }                     from "../../types/Facture";

// ── Icônes SVG pro (Lucide-style stroke-1.75) ─────────────────
const S = {
  width: "18", height: "18", viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: "1.75", strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};
const Sm = { ...S, width: "14", height: "14" };
const Xs = { ...S, width: "12", height: "12", strokeWidth: "2.2" };

const IcoHome      = () => <svg {...S}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoBuilding  = () => <svg {...S}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M12 8h6"/><path d="M12 12h6"/><path d="M12 16h6"/></svg>;
const IcoFactory   = () => <svg {...S}><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16z"/></svg>;
const IcoZap       = () => <svg {...S}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoClipboard = () => <svg {...S}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const IcoPlus      = () => <svg {...Sm} strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoX         = () => <svg {...Xs}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoCheck     = () => <svg {...Sm} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoArrowR    = () => <svg {...Sm}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoArrowL    = () => <svg {...Sm}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IcoSpin      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IcoWarn      = () => <svg {...Sm}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoShield    = () => <svg {...Sm}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoTrending  = () => <svg {...Sm}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

// ── Schémas Zod ───────────────────────────────────────────────
const schemaBatiment = z.object({
  type:           z.enum(["residentiel","tertiaire","industriel"]),
  surfaceM2:      z.number().positive("Surface doit être > 0"),
  materiaux:      z.string().min(2,"Matériaux requis"),
  isolation:      z.enum(["faible","moyen","fort"]),
  vitrage:        z.enum(["simple","double","triple"]),
  zoneClimatique: z.enum(["cotiere","continentale","montagne"]),
  region:         z.string().min(2,"Région requise"),
  ville:          z.string().min(2,"Ville requise"),
});

const schemaEquipements = z.object({
  equipements: z.array(z.object({
    nom:            z.string().min(2,"Nom requis"),
    puissanceWatts: z.number().positive("Puissance > 0"),
    heuresParJour:  z.number().min(0).max(24),
    joursParAn:     z.number().min(1).max(365),
    classeEnergie:  z.string().optional(),
  })).min(1,"Au moins un équipement requis"),
});

const schemaFactures = z.object({
  factures: z.array(z.object({
    consommationKwh: z.number().min(0),
    montantDH:       z.number().min(0),
  })).length(12),
  budgetCibleDH: z.number().positive().optional(),
});

type BatimentForm    = z.infer<typeof schemaBatiment>;
type EquipementsForm = z.infer<typeof schemaEquipements>;
type FacturesForm    = z.infer<typeof schemaFactures>;

// ── Régions ───────────────────────────────────────────────────
const REGIONS_MAROC: RegionMaroc[] = [
  "Tanger-Tétouan-Al Hoceïma","Oriental","Fès-Meknès",
  "Rabat-Salé-Kénitra","Béni Mellal-Khénifra","Casablanca-Settat",
  "Marrakech-Safi","Drâa-Tafilalet","Souss-Massa",
  "Guelmim-Oued Noun","Laâyoune-Sakia El Hamra","Dakhla-Oued Ed-Dahab",
];

const ETAPES = [
  { num: 1, label: "Bâtiment",    desc: "Type et caractéristiques", Icon: IcoHome      },
  { num: 2, label: "Équipements", desc: "Appareils et consommation", Icon: IcoZap      },
  { num: 3, label: "Factures",    desc: "12 mois de consommation",   Icon: IcoClipboard },
];

// ── Composants de base ────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5 tracking-wide uppercase">
      {children}
      {required && <span className="ml-1" style={{ color: "#15803d" }}>*</span>}
    </label>
  );
}

function Input({ label, error, required, ...props }: {
  label: string; error?: string; required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <Label required={required}>{label}</Label>
      <input
        {...props}
        className={[
          "w-full text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150",
          "bg-stone-50 dark:bg-stone-800/60",
          "text-stone-900 dark:text-stone-100",
          "placeholder:text-stone-300 dark:placeholder:text-stone-600",
          "focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:bg-white dark:focus:bg-stone-800",
          error
            ? "border border-red-300 dark:border-red-700"
            : "border border-stone-200 dark:border-stone-700 focus:border-green-600",
        ].join(" ")}
      />
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <span className="text-red-400"><IcoWarn /></span> {error}
        </p>
      )}
    </div>
  );
}

function Select({ label, error, required, children, ...props }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1">
      <Label required={required}>{label}</Label>
      <select
        {...props}
        className={[
          "w-full text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 cursor-pointer",
          "bg-stone-50 dark:bg-stone-800/60",
          "text-stone-900 dark:text-stone-100",
          "focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:bg-white dark:focus:bg-stone-800",
          error
            ? "border border-red-300 dark:border-red-700"
            : "border border-stone-200 dark:border-stone-700 focus:border-green-600",
        ].join(" ")}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <span className="text-red-400"><IcoWarn /></span> {error}
        </p>
      )}
    </div>
  );
}

// ── Étape 1 — Bâtiment ───────────────────────────────────────
function EtapeBatiment({ onNext }: { onNext: (d: BatimentForm) => void }) {
  const { register, handleSubmit, control, formState: { errors } } =
    useForm<BatimentForm>({
      resolver: zodResolver(schemaBatiment),
      defaultValues: {
        type: "residentiel", isolation: "moyen",
        vitrage: "simple", zoneClimatique: "cotiere",
      },
    });

  const typeWatch = useWatch({ control, name: "type" });

  const TYPES = [
    { v: "residentiel", l: "Résidentiel", Icon: IcoHome,     desc: "Villa, appartement, maison" },
    { v: "tertiaire",   l: "Tertiaire",   Icon: IcoBuilding, desc: "Bureau, commerce, hôtel"    },
    { v: "industriel",  l: "Industriel",  Icon: IcoFactory,  desc: "Usine, entrepôt, atelier"   },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">

      <div>
        <Label required>Type de bâtiment</Label>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {TYPES.map((t) => (
            <label
              key={t.v}
              className={[
                "flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 cursor-pointer",
                "transition-all duration-200 select-none",
              ].join(" ")}
              style={typeWatch === t.v ? {
                borderColor: "#15803d",
                background: "#F2F2F2",
              } : {
                borderColor: "#E8E8E8",
                background: "white",
              }}
            >
              <input type="radio" value={t.v} {...register("type")} className="sr-only" />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                   style={{
                     background: typeWatch === t.v ? "#E8E8E8" : "#F7F7F7",
                     color: typeWatch === t.v ? "#15803d" : "#9ca3af",
                   }}>
                <t.Icon />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold" style={{ color: typeWatch === t.v ? "#1A4A2E" : "#6b7280" }}>
                  {t.l}
                </p>
                <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#9ca3af" }}>{t.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Surface (m²)" type="number" placeholder="120" required
          {...register("surfaceM2", { valueAsNumber: true })} error={errors.surfaceM2?.message} />
        <Input label="Matériaux" placeholder="Béton, brique…" required
          {...register("materiaux")} error={errors.materiaux?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Isolation thermique" required
          {...register("isolation")} error={errors.isolation?.message}>
          <option value="faible">Faible (−20 pts)</option>
          <option value="moyen">Moyen</option>
          <option value="fort">Fort (+8 pts)</option>
        </Select>
        <Select label="Type de vitrage" required
          {...register("vitrage")} error={errors.vitrage?.message}>
          <option value="simple">Simple (−15 pts)</option>
          <option value="double">Double (+5 pts)</option>
          <option value="triple">Triple (+5 pts)</option>
        </Select>
      </div>

      <Select label="Zone climatique RTCM" required
        {...register("zoneClimatique")} error={errors.zoneClimatique?.message}>
        <option value="cotiere">Côtière — seuil 80 kWh/m²/an</option>
        <option value="continentale">Continentale — seuil 100 kWh/m²/an</option>
        <option value="montagne">Montagne — seuil 120 kWh/m²/an</option>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Région" required {...register("region")} error={errors.region?.message}>
          <option value="">Choisir une région…</option>
          {REGIONS_MAROC.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
        <Input label="Ville" placeholder="Casablanca" required
          {...register("ville")} error={errors.ville?.message} />
      </div>

      <BtnSuivant label="Équipements" />
    </form>
  );
}

// ── Étape 2 — Équipements ─────────────────────────────────────
function EtapeEquipements({ onNext, onBack }: {
  onNext: (d: EquipementsForm) => void; onBack: () => void;
}) {
  const { register, handleSubmit, control, formState: { errors } } =
    useForm<EquipementsForm>({
      resolver: zodResolver(schemaEquipements),
      defaultValues: {
        equipements: EQUIPEMENTS_PRESELECTIONNES.map((e) => ({
          nom: e.nom, puissanceWatts: e.puissanceWatts,
          heuresParJour: e.heuresParJour, joursParAn: e.joursParAn,
          classeEnergie: e.classeEnergie ?? "",
        })),
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "equipements" });

  const cellCls = [
    "w-full text-xs rounded-lg px-2 py-1.5 transition-all",
    "bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700",
    "text-stone-800 dark:text-stone-200",
    "focus:outline-none focus:ring-1 focus:ring-green-700/40 focus:border-green-600",
  ].join(" ");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {fields.length} équipement{fields.length > 1 ? "s" : ""}
          </span>
          <span className="text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full font-mono">
            kWh = P × h × j ÷ 1000
          </span>
        </div>
        <button
          type="button"
          onClick={() => append({ nom: "", puissanceWatts: 0, heuresParJour: 0, joursParAn: 365, classeEnergie: "" })}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors"
          style={{ color: "#15803d", background: "#F2F2F2", borderColor: "#E8E8E8" }}
        >
          <IcoPlus /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-12 gap-1.5 px-3">
        {[
          { l: "Équipement", span: "col-span-4" },
          { l: "Watts",      span: "col-span-2" },
          { l: "h/jour",     span: "col-span-2" },
          { l: "j/an",       span: "col-span-2" },
          { l: "Cl.",        span: "col-span-1" },
          { l: "",           span: "col-span-1" },
        ].map((h, i) => (
          <span key={i} className={`text-[10px] font-semibold text-stone-400 uppercase tracking-wider ${h.span}`}>
            {h.l}
          </span>
        ))}
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {fields.map((field, i) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="grid grid-cols-12 gap-1.5 items-center bg-white dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 rounded-xl p-2.5"
          >
            <div className="col-span-4">
              <input {...register(`equipements.${i}.nom`)} placeholder="Climatiseur…" className={cellCls} />
            </div>
            <div className="col-span-2">
              <input {...register(`equipements.${i}.puissanceWatts`, { valueAsNumber: true })} type="number" placeholder="W" className={cellCls} />
            </div>
            <div className="col-span-2">
              <input {...register(`equipements.${i}.heuresParJour`, { valueAsNumber: true })} type="number" min="0" max="24" placeholder="h" className={cellCls} />
            </div>
            <div className="col-span-2">
              <input {...register(`equipements.${i}.joursParAn`, { valueAsNumber: true })} type="number" min="1" max="365" placeholder="j" className={cellCls} />
            </div>
            <div className="col-span-1">
              <select {...register(`equipements.${i}.classeEnergie`)} className={cellCls}>
                {["", "A+", "A", "B", "C", "D", "E", "G"].map((c) => (
                  <option key={c} value={c}>{c || "—"}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                type="button" onClick={() => remove(i)}
                disabled={fields.length === 1}
                className="w-6 h-6 flex items-center justify-center rounded-md text-stone-300 hover:text-rose-400 hover:bg-rose-50 border border-transparent transition-all disabled:opacity-20"
              >
                <IcoX />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {errors.equipements?.root && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <span className="text-red-400"><IcoWarn /></span>
          {errors.equipements.root.message}
        </p>
      )}

      <BtnNavigation onBack={onBack} labelSuivant="Factures" />
    </form>
  );
}

// ── Étape 3 — Factures ────────────────────────────────────────
function EtapeFactures({ onSubmit, onBack, isCalculating }: {
  onSubmit: (d: FacturesForm) => void; onBack: () => void; isCalculating: boolean;
}) {
  const { register, handleSubmit, control } =
    useForm<FacturesForm>({
      resolver: zodResolver(schemaFactures),
      defaultValues: {
        factures: Array.from({ length: 12 }, () => ({ consommationKwh: 0, montantDH: 0 })),
      },
    });

  const vals   = useWatch({ control, name: "factures" });
  const moyKwh = vals ? Math.round(vals.reduce((s, f) => s + (Number(f.consommationKwh) || 0), 0) / 12) : 0;
  const moyDH  = vals ? Math.round(vals.reduce((s, f) => s + (Number(f.montantDH) || 0), 0) / 12) : 0;

  const inputCls = [
    "w-full text-xs rounded-lg px-2 py-1.5 transition-all",
    "bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700",
    "text-stone-800 dark:text-stone-200",
    "focus:outline-none focus:ring-1 focus:ring-green-700/40 focus:border-green-600",
  ].join(" ");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3.5 border" style={{ background: "#F2F2F2", borderColor: "#E8E8E8" }}>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: "#15803d" }}><IcoZap /></span>
            <p className="text-xs font-medium" style={{ color: "#15803d" }}>Moyenne mensuelle</p>
          </div>
          <p className="text-xl font-extrabold tabular-nums" style={{ color: "#1A4A2E" }}>
            {moyKwh.toLocaleString()} <span className="text-sm font-semibold">kWh</span>
          </p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-stone-400"><IcoTrending /></span>
            <p className="text-xs text-stone-400 font-medium">Facture moyenne</p>
          </div>
          <p className="text-xl font-extrabold text-stone-700 dark:text-stone-300 tabular-nums">
            {moyDH.toLocaleString()} <span className="text-sm font-semibold">DH</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 px-1">
        <span className="col-span-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Mois</span>
        <span className="col-span-5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">kWh</span>
        <span className="col-span-5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Montant DH</span>
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 rounded-xl px-3 py-2"
          >
            <span className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
              {Object.values(NOM_MOIS)[i].slice(0, 3)}
            </span>
            <div className="col-span-5">
              <input type="number" placeholder="0"
                {...register(`factures.${i}.consommationKwh`, { valueAsNumber: true })}
                className={inputCls} />
            </div>
            <div className="col-span-5">
              <input type="number" placeholder="0"
                {...register(`factures.${i}.montantDH`, { valueAsNumber: true })}
                className={inputCls} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-100 dark:border-stone-800 pt-4">
        <Label>Budget mensuel cible (DH) — optionnel</Label>
        <input
          type="number" placeholder="Ex : 800 DH/mois"
          {...register("budgetCibleDH", { valueAsNumber: true })}
          className={[
            "w-full text-sm rounded-xl px-3.5 py-2.5 transition-all",
            "bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700",
            "text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600",
            "focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:border-green-600",
          ].join(" ")}
        />
        <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
          Un plan de réduction personnalisé sera généré pour atteindre cet objectif.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
          <IcoArrowL /> Retour
        </button>
        <button type="submit" disabled={isCalculating}
          className="flex-1 py-3 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          style={{ background: "#15803d" }}
          onMouseEnter={e => !isCalculating && (e.currentTarget.style.background = "#166534")}
          onMouseLeave={e => !isCalculating && (e.currentTarget.style.background = "#15803d")}
        >
          {isCalculating ? (
            <>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block">
                <IcoSpin />
              </motion.span>
              Calcul en cours…
            </>
          ) : (
            <>Calculer mon score A–G <IcoArrowR /></>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Boutons navigation réutilisables ──────────────────────────
function BtnSuivant({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="w-full py-3 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      style={{ background: "#15803d" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#166534")}
      onMouseLeave={e => (e.currentTarget.style.background = "#15803d")}
    >
      Suivant — {label} <IcoArrowR />
    </button>
  );
}

function BtnNavigation({ onBack, labelSuivant }: { onBack: () => void; labelSuivant: string }) {
  return (
    <div className="flex gap-3 pt-1">
      <button type="button" onClick={onBack}
        className="flex-1 py-3 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
        <IcoArrowL /> Retour
      </button>
      <button type="submit"
        className="flex-1 py-3 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
        style={{ background: "#15803d" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#166534")}
        onMouseLeave={e => (e.currentTarget.style.background = "#15803d")}
      >
        Suivant — {labelSuivant} <IcoArrowR />
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function SoumissionForm() {
  const navigate          = useNavigate();
  const [etape, setEtape] = useState<1 | 2 | 3>(1);

  const setBatiment    = useDossierStore((s) => s.setBatiment);
  const setEquipements = useDossierStore((s) => s.setEquipements);
  const setFactures    = useDossierStore((s) => s.setFactures);
  const setBudgetCible = useDossierStore((s) => s.setBudgetCible);
  const { soumettre, isCalculating, isError, erreurCalcul } = useScore();

  const handleBatiment = (data: BatimentForm) => {
    setBatiment({ ...data, id: uuid(), region: data.region as RegionMaroc });
    setEtape(2);
    window.scrollTo(0, 0);
  };

  const handleEquipements = (data: EquipementsForm) => {
    setEquipements(data.equipements.map((e) => ({
      ...e, id: uuid(),
      classeEnergie: (e.classeEnergie || null) as ClasseEnergie | null,
    })));
    setEtape(3);
    window.scrollTo(0, 0);
  };

  const handleFactures = async (data: FacturesForm) => {
    setFactures(data.factures.map((f, i) => ({
      mois: (i + 1) as NumeroMois,
      annee: new Date().getFullYear(),
      consommationKwh: Number(f.consommationKwh),
      montantDH: Number(f.montantDH),
    })));
    if (data.budgetCibleDH && Number(data.budgetCibleDH) > 0) {
      setBudgetCible(Number(data.budgetCibleDH));
    }
    await soumettre();
    navigate("/verifier");
  };

  const progression = ((etape - 1) / (ETAPES.length - 1)) * 100;
  const EtapeIcon = ETAPES[etape - 1].Icon;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-10 px-4">
      <div className="max-w-xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "#1A4A2E" }}>
            Certifier mon bâtiment
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1.5">
            3 étapes pour obtenir votre score énergétique A–G officiel
          </p>
          <div className="inline-flex items-center gap-2 mt-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs font-medium px-3 py-1.5 rounded-full">
            <span style={{ color: "#15803d" }}><IcoShield /></span>
            Conforme Loi 47-09 · AMEE · RTCM
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="mb-8">
          <div className="relative mb-5">
            <div className="h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#15803d" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progression}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="flex items-start justify-between">
            {ETAPES.map((e) => {
              const isDone   = etape > e.num;
              const isActive = etape === e.num;
              return (
                <div key={e.num} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isDone || isActive ? "#15803d" : "#E8E8E8",
                      color: isDone || isActive ? "#fff" : "#9ca3af",
                      boxShadow: isActive ? "0 0 0 4px #E8E8E8" : "none",
                    }}
                  >
                    {isDone ? (
                      <IcoCheck />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {e.num === 1 && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                        {e.num === 2 && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                        {e.num === 3 && <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>}
                      </svg>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold" style={{ color: isActive ? "#15803d" : "#9ca3af" }}>
                      {e.label}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:block">{e.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Carte formulaire ── */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: "#F2F2F2", border: "1px solid #E8E8E8", color: "#15803d" }}>
              <EtapeIcon />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#1A4A2E" }}>
                Étape {etape} — {ETAPES[etape - 1].label}
              </h2>
              <p className="text-xs text-stone-400">{ETAPES[etape - 1].desc}</p>
            </div>
            <span className="ml-auto text-xs font-mono text-stone-300 dark:text-stone-600">
              {etape}/3
            </span>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={etape}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {etape === 1 && <EtapeBatiment onNext={handleBatiment} />}
                {etape === 2 && <EtapeEquipements onNext={handleEquipements} onBack={() => setEtape(1)} />}
                {etape === 3 && <EtapeFactures onSubmit={handleFactures} onBack={() => setEtape(2)} isCalculating={isCalculating} />}
              </motion.div>
            </AnimatePresence>

            {isError && erreurCalcul && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl"
              >
                <span className="text-rose-400 flex-shrink-0 mt-0.5"><IcoWarn /></span>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{erreurCalcul}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-stone-400 dark:text-stone-600">
          <span style={{ color: "#E8E8E8" }}><IcoShield /></span>
          Score basé sur la moyenne 12 mois · Conforme RTCM · Certifié AMEE
        </div>

      </div>
    </div>
  );
}