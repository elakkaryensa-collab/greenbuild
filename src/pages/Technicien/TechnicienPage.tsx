// ─────────────────────────────────────────────────────────────
// src/pages/Technicien/TechnicienPage.tsx
// GreenBuild v3.0 — Portail Technicien terrain (CDC Étape B)
// CDC : "PWA offline, liste missions, saisie mesures, upload photos"
// ─────────────────────────────────────────────────────────────

import { useState }           from "react";
import { motion }             from "framer-motion";
import { useForm }            from "react-hook-form";

// ── Données mock missions ─────────────────────────────────────

const MISSIONS_MOCK = [
  { id: "MIS-001", adresse: "45 Rue Ibn Sina, Casablanca",    proprietaire: "Mohammed Alaoui",  date: "Aujourd'hui 9h",   statut: "en_cours"  as const },
  { id: "MIS-002", adresse: "12 Av. Hassan II, Rabat",        proprietaire: "Fatima Benali",    date: "Aujourd'hui 14h",  statut: "planifiee" as const },
  { id: "MIS-003", adresse: "7 Derb El Mellah, Marrakech",   proprietaire: "Ahmed Tazi",       date: "Demain 10h",       statut: "planifiee" as const },
  { id: "MIS-004", adresse: "23 Rue Allal El Fassi, Fès",    proprietaire: "Zineb Chraibi",    date: "23 Jan 11h",       statut: "terminee"  as const },
];

const STATUT_CONFIG = {
  en_cours:  { label: "En cours",   color: "bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200"   },
  planifiee: { label: "Planifiée",  color: "bg-amber-100  text-amber-800  dark:bg-amber-900  dark:text-amber-200"  },
  terminee:  { label: "Terminée",   color: "bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200"  },
};

// ── Types formulaire mesures ──────────────────────────────────

interface FormMesures {
  epaisseurIsolation:   number;
  typeFenetre:          string;
  surfaceVitree:        number;
  etatClimatiseur:      string;
  infiltrationsDetectees: boolean;
  observations:         string;
}

// ── Composant ─────────────────────────────────────────────────

export default function TechnicienPage() {
  const [missionActive, setMissionActive] = useState(MISSIONS_MOCK[0].id);
  const [photos,        setPhotos]        = useState<string[]>([]);
  const [sauvegarde,    setSauvegarde]    = useState(false);
  const [online,        setOnline]        = useState(true); // simulé

  const { register, handleSubmit,/* formState: { isDirty }*/ } = useForm<FormMesures>({
    defaultValues: {
      epaisseurIsolation: 8, typeFenetre: "simple",
      surfaceVitree: 18, etatClimatiseur: "fonctionnel",
      infiltrationsDetectees: false, observations: "",
    },
  });

  const mission = MISSIONS_MOCK.find((m) => m.id === missionActive)!;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const onSubmit = (data: FormMesures) => {
    // En production : sauvegarder dans IndexedDB (offline) ou API (online)
    console.log("Mesures sauvegardées:", data);
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 3000);
  };

  const inputCls = `w-full text-sm border border-stone-200 dark:border-stone-700
    bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200
    rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Portail Technicien terrain
          </h1>
          <p className="text-sm text-stone-400 mt-1">Saisie de mesures et upload de photos</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Statut connexion simulé */}
          <button
            onClick={() => setOnline(!online)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              online
                ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                : "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
            {online ? "En ligne" : "Hors ligne (PWA)"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Liste missions ────────────────────────────────── */}
        <div className="lg:col-span-1">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Mes missions ({MISSIONS_MOCK.length})
          </p>
          <div className="space-y-2">
            {MISSIONS_MOCK.map((m) => {
              const cfg = STATUT_CONFIG[m.statut];
              return (
                <button
                  key={m.id}
                  onClick={() => setMissionActive(m.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    missionActive === m.id
                      ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:border-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-stone-400">{m.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-stone-800 dark:text-white leading-snug">{m.adresse}</p>
                  <p className="text-[10px] text-stone-400 mt-1">{m.proprietaire} · {m.date}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Formulaire mesures ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Info mission active */}
          <div className="bg-blue-50 dark:bg-blue-950
                          border border-blue-200 dark:border-blue-800
                          rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">{mission.adresse}</h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  Propriétaire : {mission.proprietaire} · {mission.date}
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-stone-900
                       border border-stone-100 dark:border-stone-800
                       rounded-2xl p-5 space-y-4">

            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              🔧 Mesures physiques terrain
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Épaisseur isolation (cm)
                </label>
                <input type="number" step="0.5" className={inputCls}
                  {...register("epaisseurIsolation", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Surface vitrée (m²)
                </label>
                <input type="number" step="0.5" className={inputCls}
                  {...register("surfaceVitree", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Type fenêtres
                </label>
                <select className={inputCls + " cursor-pointer"} {...register("typeFenetre")}>
                  <option value="simple">Simple vitrage aluminium</option>
                  <option value="double">Double vitrage PVC</option>
                  <option value="triple">Triple vitrage</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                  État climatiseur
                </label>
                <select className={inputCls + " cursor-pointer"} {...register("etatClimatiseur")}>
                  <option value="fonctionnel">Fonctionnel</option>
                  <option value="vieux">Vieux (+10 ans)</option>
                  <option value="defaillant">Défaillant</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="infiltrations"
                className="w-4 h-4 rounded accent-blue-600"
                {...register("infiltrationsDetectees")} />
              <label htmlFor="infiltrations" className="text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
                Infiltrations d'air détectées
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                Observations
              </label>
              <textarea rows={3} placeholder="Remarques techniques, anomalies constatées…"
                className={inputCls + " resize-none"}
                {...register("observations")} />
            </div>

            <button type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold
                         bg-blue-600 hover:bg-blue-700 text-white
                         transition-colors flex items-center justify-center gap-2">
              {sauvegarde ? "✓ Sauvegardé !" : online ? "💾 Sauvegarder les mesures" : "💾 Sauvegarder (hors ligne)"}
            </button>
          </form>

          {/* Upload photos */}
          <div className="bg-white dark:bg-stone-900
                          border border-stone-100 dark:border-stone-800
                          rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
              📸 Photos terrain
            </h3>
            <label className="flex flex-col items-center justify-center gap-2
                              border-2 border-dashed border-stone-200 dark:border-stone-700
                              rounded-xl p-6 cursor-pointer
                              hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <span className="text-2xl">📷</span>
              <span className="text-sm font-medium text-stone-500">
                Cliquez ou glissez des photos ici
              </span>
              <span className="text-xs text-stone-400">JPG, PNG — Max 10 MB chacune</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photos.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square"
                  >
                    <img src={src} alt={`Photo ${i+1}`}
                      className="w-full h-full object-cover rounded-lg border border-stone-200 dark:border-stone-700" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white
                                 rounded-full text-[10px] flex items-center justify-center
                                 hover:bg-red-600 transition-colors"
                    >✕</button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Géolocalisation */}
          <div className="bg-white dark:bg-stone-900
                          border border-stone-100 dark:border-stone-800
                          rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Géolocalisation GPS</p>
                <p className="text-xs text-stone-400">33.5731° N, -7.5898° W — Casablanca</p>
              </div>
            </div>
            <button className="text-xs font-medium text-blue-600 dark:text-blue-400
                               border border-blue-200 dark:border-blue-800
                               px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              Actualiser
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}