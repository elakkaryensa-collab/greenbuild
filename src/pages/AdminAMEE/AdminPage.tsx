// ─────────────────────────────────────────────────────────────
// src/pages/AdminAMEE/AdminPage.tsx
// GreenBuild v3.0 — Admin AMEE : carte + stats (Étape 12)
// CDC : "12 régions colorées, gestion utilisateurs, CSV"
// Note : Leaflet est chargé dynamiquement via CDN dans index.html
// ─────────────────────────────────────────────────────────────

import { useState }          from "react";
import { motion }            from "framer-motion";
import { MOCK_REGIONS }      from "../../data/normesRTCM";
import { COULEURS_CLASSES }  from "../../types/Score";
import type { ClasseEnergetique } from "../../types/Score";

// ── Couleurs hex pour la carte (Tailwind → hex) ───────────────

const COULEURS_HEX: Record<ClasseEnergetique, string> = {
  A: "#166534", B: "#4d7c0f", C: "#a16207",
  D: "#9a3412", E: "#991b1b", F: "#831843", G: "#4c1d95",
};

// ── KPIs nationaux calculés depuis les données mock ───────────

const totalDossiers   = MOCK_REGIONS.reduce((s, r) => s + r.nbDossiers,  0);
const totalCertifies  = MOCK_REGIONS.reduce((s, r) => s + r.nbCertifies, 0);
const scoreMoyenNat   = Math.round(
  MOCK_REGIONS.reduce((s, r) => s + r.scoreMoyen, 0) / MOCK_REGIONS.length
);

const KPIS = [
  { label: "Dossiers soumis",      valeur: totalDossiers,                    icon: "📋", color: "text-blue-600  dark:text-blue-400"   },
  { label: "Certificats émis",     valeur: totalCertifies,                   icon: "🏅", color: "text-green-600 dark:text-green-400"  },
  { label: "Taux certification",   valeur: `${Math.round(totalCertifies/totalDossiers*100)}%`, icon: "📊", color: "text-amber-600  dark:text-amber-400"  },
  { label: "Score moyen national", valeur: `${scoreMoyenNat}/100`,           icon: "⚡", color: "text-purple-600 dark:text-purple-400" },
];

// ── Dossiers en attente (mock) ────────────────────────────────

const DOSSIERS_ATTENTE = [
  { id: "DOS-2024-001", proprietaire: "Mohammed Alaoui",  region: "Casablanca-Settat",    classe: "D" as ClasseEnergetique, date: "12 Jan" },
  { id: "DOS-2024-003", proprietaire: "Ahmed Tazi",       region: "Marrakech-Safi",       classe: "E" as ClasseEnergetique, date: "18 Jan" },
  { id: "DOS-2024-007", proprietaire: "Karim Benbrahim",  region: "Fès-Meknès",           classe: "C" as ClasseEnergetique, date: "21 Jan" },
  { id: "DOS-2024-009", proprietaire: "Samira Naciri",    region: "Rabat-Salé-Kénitra",   classe: "B" as ClasseEnergetique, date: "23 Jan" },
];

// ── Composant carte Maroc SVG simplifiée ─────────────────────

function CarteMarocSimplifiee({
  regionActive,
  onRegion,
}: {
  regionActive: string | null;
  onRegion: (id: string) => void;
}) {
  // Représentation simplifiée des 12 régions en grille
  const GRILLE = [
    { id: "tanger",       nom: "Tanger",       col: 1, row: 0 },
    { id: "oriental",     nom: "Oriental",      col: 2, row: 0 },
    { id: "rabat",        nom: "Rabat",         col: 1, row: 1 },
    { id: "fes",          nom: "Fès-Meknès",   col: 2, row: 1 },
    { id: "casablanca",   nom: "Casablanca",   col: 0, row: 1 },
    { id: "beni-mellal",  nom: "Béni Mellal",  col: 2, row: 2 },
    { id: "marrakech",    nom: "Marrakech",    col: 1, row: 2 },
    { id: "souss",        nom: "Souss-Massa",  col: 0, row: 2 },
    { id: "draa",         nom: "Drâa-Tafil.",  col: 2, row: 3 },
    { id: "guelmim",      nom: "Guelmim",      col: 0, row: 3 },
    { id: "laayoune",     nom: "Laâyoune",     col: 0, row: 4 },
    { id: "dakhla",       nom: "Dakhla",       col: 0, row: 5 },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {GRILLE.map((g) => {
        const region = MOCK_REGIONS.find((r) => r.id === g.id);
        if (!region) return null;
        const couleur = COULEURS_HEX[region.classemoyenne];
        const actif   = regionActive === g.id;

        return (
          <motion.button
            key={g.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRegion(g.id)}
            className={`
              p-3 rounded-xl text-left transition-all duration-150
              border-2 ${actif ? "border-white shadow-lg" : "border-transparent"}
            `}
            style={{ background: couleur + (actif ? "ff" : "cc") }}
          >
            <p className="text-white text-xs font-bold leading-tight">{g.nom}</p>
            <p className="text-white/80 text-[10px] mt-0.5">Classe {region.classemoyenne}</p>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────

export default function AdminPage() {
  const [regionActive, setRegionActive] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<"carte" | "dossiers" | "utilisateurs">("carte");

  const regionInfo = regionActive
    ? MOCK_REGIONS.find((r) => r.id === regionActive)
    : null;

  const exportCSV = () => {
    const csv = [
      "Région,Classe,Score moyen,Dossiers,Certifiés",
      ...MOCK_REGIONS.map((r) =>
        `"${r.nom}",${r.classemoyenne},${r.scoreMoyen},${r.nbDossiers},${r.nbCertifies}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "greenbuild-regions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            Admin AMEE — Vue nationale
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Agence Marocaine pour l'Efficacité Énergétique · 12 régions
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                     bg-white dark:bg-stone-900
                     border border-stone-200 dark:border-stone-700
                     text-stone-700 dark:text-stone-300
                     rounded-xl hover:bg-stone-50 transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPIS.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-stone-900
                       border border-stone-100 dark:border-stone-800
                       rounded-2xl p-5 text-center"
          >
            <span className="text-2xl block mb-1">{k.icon}</span>
            <span className={`text-2xl font-extrabold block ${k.color}`}>
              {k.valeur}
            </span>
            <span className="text-xs text-stone-400 mt-0.5 block">{k.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Onglets ───────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl w-fit mb-5">
        {(["carte", "dossiers", "utilisateurs"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              onglet === o
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {o === "carte" ? "🗺️ Carte" : o === "dossiers" ? "📋 Dossiers" : "👥 Utilisateurs"}
          </button>
        ))}
      </div>

      {/* ── Onglet carte ─────────────────────────────────────── */}
      {onglet === "carte" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-stone-900
                          border border-stone-100 dark:border-stone-800
                          rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Carte des 12 régions — Classes énergétiques moyennes
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">Cliquez une région pour les détails</p>
            </div>
            <CarteMarocSimplifiee regionActive={regionActive} onRegion={setRegionActive} />

            {/* Légende */}
            <div className="flex gap-2 flex-wrap p-4 border-t border-stone-100 dark:border-stone-800">
              {(["A","B","C","D","E","F","G"] as ClasseEnergetique[]).map((cls) => (
                <div key={cls} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ background: COULEURS_HEX[cls] }} />
                  <span className="text-[10px] text-stone-500">Classe {cls}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Détail région */}
          <div className="bg-white dark:bg-stone-900
                          border border-stone-100 dark:border-stone-800
                          rounded-2xl p-5">
            {regionInfo ? (
              <motion.div
                key={regionInfo.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  text-white text-2xl font-extrabold mb-4
                `} style={{ background: COULEURS_HEX[regionInfo.classemoyenne] }}>
                  {regionInfo.classemoyenne}
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white mb-1">
                  {regionInfo.nom}
                </h3>
                <p className="text-sm text-stone-400 mb-4">Score moyen : {regionInfo.scoreMoyen}/100</p>
                <div className="space-y-2.5">
                  {[
                    ["Dossiers soumis",  regionInfo.nbDossiers],
                    ["Certifiés",        regionInfo.nbCertifies],
                    ["Taux certif.",     `${Math.round(regionInfo.nbCertifies/regionInfo.nbDossiers*100)}%`],
                    ["Classe moyenne",   regionInfo.classemoyenne],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between text-sm">
                      <span className="text-stone-400">{k}</span>
                      <span className="font-semibold text-stone-700 dark:text-stone-200">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🗺️</p>
                <p className="text-sm text-stone-400">
                  Cliquez une région<br />pour voir ses statistiques
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Onglet dossiers ──────────────────────────────────── */}
      {onglet === "dossiers" && (
        <div className="bg-white dark:bg-stone-900
                        border border-stone-100 dark:border-stone-800
                        rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Dossiers en attente d'approbation ({DOSSIERS_ATTENTE.length})
            </h3>
          </div>
          <div className="divide-y divide-stone-50 dark:divide-stone-800">
            {DOSSIERS_ATTENTE.map((d, i) => {
              const c = COULEURS_CLASSES[d.classe];
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between p-4
                             hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${c.bg} ${c.text}`}>
                      {d.classe}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-white">{d.proprietaire}</p>
                      <p className="text-xs text-stone-400">{d.id} · {d.region} · {d.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Approuver
                    </button>
                    <button className="text-xs px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg hover:bg-stone-200 transition-colors">
                      Voir
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Onglet utilisateurs ───────────────────────────────── */}
      {onglet === "utilisateurs" && (
        <div className="bg-white dark:bg-stone-900
                        border border-stone-100 dark:border-stone-800
                        rounded-2xl p-6 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            Gestion des utilisateurs
          </p>
          <p className="text-xs text-stone-400">
            Module de gestion des comptes propriétaires, techniciens et auditeurs.<br />
            Fonctionnalité disponible avec l'authentification backend.
          </p>
        </div>
      )}

    </div>
  );
}