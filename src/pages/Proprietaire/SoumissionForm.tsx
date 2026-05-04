// ─────────────────────────────────────────────────────────────
// src/pages/Proprietaire/SoumissionForm.tsx
// GreenBuild v3.0 — Formulaire 3 étapes (CDC)
// React Hook Form + Zod + Zustand store
// ─────────────────────────────────────────────────────────────

import { useState }                    from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver }                 from "@hookform/resolvers/zod";
import { z }                           from "zod";
import { motion, AnimatePresence }     from "framer-motion";
import { v4 as uuid }                  from "uuid";
import { useDossierStore }             from "../../store/dossierStore";
import { useScore }                    from "../../hooks/useScore";
import { EQUIPEMENTS_PRESELECTIONNES } from "../../types/Equipement";
import { NOM_MOIS }                    from "../../types/Facture";
import type { RegionMaroc }            from "../../types/Batiment";
import type { ClasseEnergie }          from "../../types/Equipement";
import type { NumeroMois }             from "../../types/Facture";

// ── Schémas Zod (compatibles Zod v4) ─────────────────────────

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

// ── Constantes ────────────────────────────────────────────────

const REGIONS_MAROC: RegionMaroc[] = [
  "Tanger-Tétouan-Al Hoceïma","Oriental","Fès-Meknès",
  "Rabat-Salé-Kénitra","Béni Mellal-Khénifra","Casablanca-Settat",
  "Marrakech-Safi","Drâa-Tafilalet","Souss-Massa",
  "Guelmim-Oued Noun","Laâyoune-Sakia El Hamra","Dakhla-Oued Ed-Dahab",
];

const ETAPES = [
  { num:1, label:"Bâtiment",    icon:"🏠" },
  { num:2, label:"Équipements", icon:"⚡" },
  { num:3, label:"Factures",    icon:"📋" },
];

// ── Composants champs ─────────────────────────────────────────

function FieldInput({ label, error, required, ...props }: {
  label: string; error?: string; required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input {...props}
        className={`w-full text-sm border rounded-xl px-3 py-2.5
          bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100
          placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500
          ${error ? "border-red-300" : "border-stone-200 dark:border-stone-700"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FieldSelect({ label, error, required, children, ...props }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select {...props}
        className={`w-full text-sm border rounded-xl px-3 py-2.5
          bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100
          focus:outline-none focus:ring-2 focus:ring-green-500
          ${error ? "border-red-300" : "border-stone-200 dark:border-stone-700"}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ÉTAPE 1 — BÂTIMENT
// ══════════════════════════════════════════════════════════════

function EtapeBatiment({ onNext }: { onNext:(d:BatimentForm)=>void }) {
  const { register, handleSubmit, control, formState:{errors} } =
    useForm<BatimentForm>({
      resolver: zodResolver(schemaBatiment),
      defaultValues: { type:"residentiel", isolation:"moyen", vitrage:"simple", zoneClimatique:"cotiere" },
    });

  const typeWatch = useWatch({ control, name: "type" });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      {/* Type bâtiment — cartes cliquables */}
      <div>
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
          Type de bâtiment <span className="text-red-400">*</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { v:"residentiel", l:"Résidentiel", i:"🏠" },
            { v:"tertiaire",   l:"Tertiaire",   i:"🏢" },
            { v:"industriel",  l:"Industriel",  i:"🏭" },
          ] as const).map((t) => (
            <label key={t.v} className={`
              flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer
              transition-all duration-150
              ${typeWatch === t.v
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-stone-200 dark:border-stone-700 hover:border-stone-300"
              }
            `}>
              <input type="radio" value={t.v} {...register("type")} className="sr-only" />
              <span className="text-2xl">{t.i}</span>
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldInput label="Surface (m²)" type="number" placeholder="120" required
          {...register("surfaceM2",{valueAsNumber:true})} error={errors.surfaceM2?.message} />
        <FieldInput label="Matériaux" placeholder="Béton armé, brique…" required
          {...register("materiaux")} error={errors.materiaux?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldSelect label="Isolation thermique" required
          {...register("isolation")} error={errors.isolation?.message}>
          <option value="faible">Faible  (−20 pts score)</option>
          <option value="moyen">Moyen</option>
          <option value="fort">Fort  (+8 pts score)</option>
        </FieldSelect>
        <FieldSelect label="Type de vitrage" required
          {...register("vitrage")} error={errors.vitrage?.message}>
          <option value="simple">Simple  (−15 pts score)</option>
          <option value="double">Double  (+5 pts score)</option>
          <option value="triple">Triple  (+5 pts score)</option>
        </FieldSelect>
      </div>

      <FieldSelect label="Zone climatique RTCM" required
        {...register("zoneClimatique")} error={errors.zoneClimatique?.message}>
        <option value="cotiere">Côtière — seuil 80 kWh/m²/an</option>
        <option value="continentale">Continentale — seuil 100 kWh/m²/an</option>
        <option value="montagne">Montagne — seuil 120 kWh/m²/an</option>
      </FieldSelect>

      <div className="grid grid-cols-2 gap-4">
        <FieldSelect label="Région" required
          {...register("region")} error={errors.region?.message}>
          <option value="">Choisir…</option>
          {REGIONS_MAROC.map((r) => <option key={r} value={r}>{r}</option>)}
        </FieldSelect>
        <FieldInput label="Ville" placeholder="Casablanca" required
          {...register("ville")} error={errors.ville?.message} />
      </div>

      <button type="submit"
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white
                   font-semibold text-sm rounded-xl transition-colors">
        Suivant — Équipements →
      </button>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════
// ÉTAPE 2 — ÉQUIPEMENTS
// ══════════════════════════════════════════════════════════════

function EtapeEquipements({ onNext, onBack }: {
  onNext:(d:EquipementsForm)=>void; onBack:()=>void;
}) {
  const { register, handleSubmit, control, formState:{errors} } =
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

  const { fields, append, remove } = useFieldArray({ control, name:"equipements" });

  const colClass = "text-xs border border-stone-200 dark:border-stone-700 bg-transparent text-stone-800 dark:text-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 w-full";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400">
          {fields.length} équipement{fields.length>1?"s":""} — kWh = P×h×j÷1000
        </p>
        <button type="button"
          onClick={() => append({ nom:"", puissanceWatts:0, heuresParJour:0, joursParAn:365, classeEnergie:"" })}
          className="text-xs font-medium text-green-600 hover:text-green-700">
          + Ajouter équipement
        </button>
      </div>

      {/* En-têtes */}
      <div className="grid grid-cols-12 gap-1.5 px-1">
        {["Équipement","W","h/j","j/an","Cl.",""].map((h,i) => (
          <span key={i} className={`text-[10px] font-medium text-stone-400 uppercase
            ${i===0?"col-span-4":i===4?"col-span-2":i===5?"col-span-1":"col-span-2"}`}>
            {h}
          </span>
        ))}
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {fields.map((field, i) => (
          <div key={field.id}
            className="grid grid-cols-12 gap-1.5 items-center
                       bg-white dark:bg-stone-800
                       border border-stone-100 dark:border-stone-700
                       rounded-xl p-2.5">
            <div className="col-span-4">
              <input {...register(`equipements.${i}.nom`)} placeholder="Climatiseur…" className={colClass} />
            </div>
            <div className="col-span-2">
              <input {...register(`equipements.${i}.puissanceWatts`,{valueAsNumber:true})} type="number" placeholder="W" className={colClass} />
            </div>
            <div className="col-span-2">
              <input {...register(`equipements.${i}.heuresParJour`,{valueAsNumber:true})} type="number" placeholder="h" min="0" max="24" className={colClass} />
            </div>
            <div className="col-span-2">
              <input {...register(`equipements.${i}.joursParAn`,{valueAsNumber:true})} type="number" placeholder="j" min="1" max="365" className={colClass} />
            </div>
            <div className="col-span-1">
              <select {...register(`equipements.${i}.classeEnergie`)} className={colClass}>
                {["","A+","A","B","C","D","E","G"].map((c) => <option key={c} value={c}>{c||"—"}</option>)}
              </select>
            </div>
            <div className="col-span-1 flex justify-center">
              <button type="button" onClick={() => remove(i)} disabled={fields.length===1}
                className="text-stone-300 hover:text-red-500 transition-colors disabled:opacity-30 text-sm">✕</button>
            </div>
          </div>
        ))}
      </div>

      {errors.equipements?.root && (
        <p className="text-xs text-red-500">{errors.equipements.root.message}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 border border-stone-200 dark:border-stone-700
                     text-stone-600 dark:text-stone-400 text-sm font-medium
                     rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
          ← Retour
        </button>
        <button type="submit"
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white
                     font-semibold text-sm rounded-xl transition-colors">
          Suivant — Factures →
        </button>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════
// ÉTAPE 3 — FACTURES + BUDGET
// ══════════════════════════════════════════════════════════════

function EtapeFactures({ onSubmit, onBack, isCalculating }: {
  onSubmit:(d:FacturesForm)=>void; onBack:()=>void; isCalculating:boolean;
}) {
  const { register, handleSubmit, control } =
    useForm<FacturesForm>({
      resolver: zodResolver(schemaFactures),
      defaultValues: {
        factures: Array.from({length:12}, () => ({ consommationKwh:0, montantDH:0 })),
      },
    });

  const vals = useWatch({ control, name: "factures" });
  const moyKwh    = vals ? Math.round(vals.reduce((s,f) => s+(Number(f.consommationKwh)||0), 0)/12) : 0;
  const moyDH     = vals ? Math.round(vals.reduce((s,f) => s+(Number(f.montantDH)||0), 0)/12) : 0;

  const inputCls = "w-full text-xs border border-stone-200 dark:border-stone-700 bg-transparent text-stone-800 dark:text-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Moyennes temps réel */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-green-700 dark:text-green-300">{moyKwh} kWh</p>
          <p className="text-xs text-green-600 dark:text-green-400">Moyenne mensuelle</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-xl p-3 text-center">
          <p className="text-base font-bold text-blue-700 dark:text-blue-300">{moyDH} DH</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Facture moyenne</p>
        </div>
      </div>

      {/* En-têtes colonnes */}
      <div className="grid grid-cols-12 gap-2 px-1">
        <span className="col-span-2 text-[10px] font-medium text-stone-400 uppercase">Mois</span>
        <span className="col-span-5 text-[10px] font-medium text-stone-400 uppercase">kWh</span>
        <span className="col-span-5 text-[10px] font-medium text-stone-400 uppercase">Montant DH</span>
      </div>

      {/* 12 factures */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {Array.from({length:12}, (_,i) => (
          <div key={i}
            className="grid grid-cols-12 gap-2 items-center
                       bg-white dark:bg-stone-800
                       border border-stone-100 dark:border-stone-700
                       rounded-xl px-3 py-2">
            <span className="col-span-2 text-xs font-semibold text-stone-500">
              {Object.values(NOM_MOIS)[i].slice(0,3)}
            </span>
            <div className="col-span-5">
              <input type="number" placeholder="kWh"
                {...register(`factures.${i}.consommationKwh`,{valueAsNumber:true})}
                className={inputCls} />
            </div>
            <div className="col-span-5">
              <input type="number" placeholder="DH"
                {...register(`factures.${i}.montantDH`,{valueAsNumber:true})}
                className={inputCls} />
            </div>
          </div>
        ))}
      </div>

      {/* Budget cible optionnel */}
      <div className="border-t border-stone-100 dark:border-stone-800 pt-4">
        <label className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1.5">
          Budget mensuel cible en DH <span className="text-stone-300">(optionnel)</span>
        </label>
        <input type="number" placeholder="Ex: 800 DH/mois"
          {...register("budgetCibleDH",{valueAsNumber:true})}
          className="w-full text-sm border border-stone-200 dark:border-stone-700
                     bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100
                     rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-stone-400 mt-1">
          Si renseigné, un plan de réduction d'usage sera généré pour atteindre cet objectif.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 border border-stone-200 dark:border-stone-700
                     text-stone-600 dark:text-stone-400 font-medium text-sm
                     rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
          ← Retour
        </button>
        <button type="submit" disabled={isCalculating}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60
                     text-white font-semibold text-sm rounded-xl transition-colors
                     flex items-center justify-center gap-2">
          {isCalculating ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Calcul…</>
          ) : "🚀 Calculer mon score"}
        </button>
      </div>
    </form>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════

export default function SoumissionForm() {
  const [etape, setEtape] = useState<1|2|3>(1);

  const setBatiment    = useDossierStore((s) => s.setBatiment);
  const setEquipements = useDossierStore((s) => s.setEquipements);
  const setFactures    = useDossierStore((s) => s.setFactures);
  const setBudgetCible = useDossierStore((s) => s.setBudgetCible);
  const { soumettre, isCalculating, isError, erreurCalcul } = useScore();

  const handleBatiment = (data: BatimentForm) => {
    setBatiment({ ...data, id: uuid(), region: data.region as RegionMaroc });
    setEtape(2);
    window.scrollTo(0,0);
  };

  const handleEquipements = (data: EquipementsForm) => {
    setEquipements(data.equipements.map((e) => ({
      ...e,
      id: uuid(),
      classeEnergie: (e.classeEnergie || null) as ClasseEnergie | null,
    })));
    setEtape(3);
    window.scrollTo(0,0);
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
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950
                        text-green-700 dark:text-green-300 text-xs font-medium
                        px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 mb-3">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
          Certification énergétique · Loi 47-09 · AMEE
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
          Certifier mon bâtiment
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          3 étapes pour obtenir votre score A–G officiel
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {ETAPES.map((e, i) => (
          <div key={e.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                font-bold transition-all duration-300 text-sm
                ${etape > e.num
                  ? "bg-green-600 text-white"
                  : etape === e.num
                    ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-400"
                }`}>
                {etape > e.num ? "✓" : e.icon}
              </div>
              <span className={`text-xs font-medium hidden sm:block
                ${etape === e.num ? "text-green-700 dark:text-green-400" : "text-stone-400"}`}>
                {e.label}
              </span>
            </div>
            {i < ETAPES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded transition-all duration-500
                ${etape > e.num ? "bg-green-500" : "bg-stone-100 dark:bg-stone-800"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Formulaire,,, */}
      <div className="bg-white dark:bg-stone-900
                      border border-stone-100 dark:border-stone-800
                      rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-stone-900 dark:text-white mb-5">
          {ETAPES[etape-1].icon} Étape {etape} — {ETAPES[etape-1].label}
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={etape}
            initial={{ opacity:0, x:20 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-20 }}
            transition={{ duration:0.22 }}
          >
            {etape === 1 && <EtapeBatiment onNext={handleBatiment} />}
            {etape === 2 && <EtapeEquipements onNext={handleEquipements} onBack={() => setEtape(1)} />}
            {etape === 3 && <EtapeFactures onSubmit={handleFactures} onBack={() => setEtape(2)} isCalculating={isCalculating} />}
          </motion.div>
        </AnimatePresence>

        {isError && erreurCalcul && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800
                          rounded-xl text-sm text-red-700 dark:text-red-300">
            ❌ {erreurCalcul}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-stone-400 mt-4">
        Score sur la moyenne des 12 mois · baseCalcul:"12mois" · Conforme RTCM
      </p>
    </div>
  );
}