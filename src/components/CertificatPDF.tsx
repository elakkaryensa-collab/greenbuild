// ─────────────────────────────────────────────────────────────
// src/components/CertificatPDF.tsx
// GreenBuild v3.0 — Certificat A4 officiel + QR code
// CDC : "CSS @media print, window.print(), qrcode.react"
// ─────────────────────────────────────────────────────────────

import { useRef }              from "react";
import QRCode                  from "qrcode.react";
import { useDossierStore }     from "../store/dossierStore";
import { COULEURS_CLASSES,
         LABELS_CLASSES }      from "../types/Score";

// ── Numéro de certificat unique ───────────────────────────────

function genererNumeroCertificat(batimentId: string): string {
  const annee = new Date().getFullYear();
  const hash  = batimentId.slice(0, 6).toUpperCase();
  const seq   = Math.floor(Math.random() * 9000 + 1000);
  return `GB-${annee}-${hash}-${seq}`;
}

// ── Composant ─────────────────────────────────────────────────

export default function CertificatPDF() {
  const batiment      = useDossierStore((s) => s.batiment);
  const score         = useDossierStore((s) => s.score);
  const certifRef     = useRef<HTMLDivElement>(null);

  if (!batiment || !score) return null;

  const numeroCertif  = genererNumeroCertificat(batiment.id);
  const dateEmission  = new Date().toLocaleDateString("fr-MA", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const urlVerif = `https://greenbuild.netlify.app/verify/${numeroCertif}`;
  const couleurs = COULEURS_CLASSES[score.classe];
  const label    = LABELS_CLASSES[score.classe];

  const imprimer = () => window.print();

  return (
    <>
      {/* ── Styles @media print ──────────────────────────────── */}
      <style>{`
        @media print {
          body > *:not(#certificat-print-root) { display: none !important; }
          #certificat-print-root { display: block !important; }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* ── Bouton impression ────────────────────────────────── */}
      <button
        onClick={imprimer}
        className="no-print flex items-center gap-2 px-5 py-2.5
                   bg-green-600 hover:bg-green-700 text-white
                   text-sm font-semibold rounded-xl transition-colors mb-6"
      >
        🖨️ Télécharger / Imprimer le certificat
      </button>

      {/* ── Certificat A4 ────────────────────────────────────── */}
      <div id="certificat-print-root">
        <div
          ref={certifRef}
          className="w-full max-w-2xl mx-auto bg-white
                     border-2 border-stone-200 rounded-2xl overflow-hidden
                     print:rounded-none print:border-0 print:max-w-full"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* ── En-tête ──────────────────────────────────────── */}
          <div className="bg-green-700 text-white px-10 py-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">🌿</span>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">GreenBuild</h1>
                <p className="text-green-200 text-xs tracking-widest uppercase">
                  Plateforme de Certification Énergétique
                </p>
              </div>
            </div>
            <div className="border-t border-green-600 pt-4 mt-4">
              <h2 className="text-lg font-semibold tracking-wide">
                CERTIFICAT DE PERFORMANCE ÉNERGÉTIQUE
              </h2>
              <p className="text-green-300 text-xs mt-1">
                Conforme à la Loi 47-09 relative à l'efficacité énergétique
              </p>
            </div>
          </div>

          {/* ── Corps ────────────────────────────────────────── */}
          <div className="px-10 py-8">

            {/* Score principal */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className={`
                w-32 h-32 rounded-full border-4 ${couleurs.border} ${couleurs.bg}
                flex flex-col items-center justify-center shadow-md
              `}>
                <span className={`text-5xl font-extrabold ${couleurs.text}`}>
                  {score.classe}
                </span>
                <span className={`text-sm font-semibold ${couleurs.text} opacity-80`}>
                  {score.valeur}/100
                </span>
              </div>

              <div>
                <p className={`text-2xl font-bold ${couleurs.text}`}>{label}</p>
                <p className="text-sm text-stone-500 mt-1">
                  Score calculé sur {score.baseCalcul}
                </p>
                <div className="flex gap-1 mt-2">
                  {(["A","B","C","D","E","F","G"] as const).map((cls) => {
                    const c = COULEURS_CLASSES[cls];
                    return (
                      <div
                        key={cls}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold
                          ${cls === score.classe ? `${c.bg} ${c.text} border-2 ${c.border}` : "bg-stone-100 text-stone-400"}`}
                      >{cls}</div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Informations bâtiment */}
            <div className="border border-stone-200 rounded-xl p-5 mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                Informations du Bâtiment
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  ["Type",           batiment.type],
                  ["Surface",        `${batiment.surfaceM2} m²`],
                  ["Isolation",      batiment.isolation],
                  ["Vitrage",        batiment.vitrage],
                  ["Zone RTCM",      batiment.zoneClimatique],
                  ["Région",         batiment.region],
                  ["Ville",          batiment.ville],
                  ["Consommation",   `${score.consommationReelleMoyenne} kWh/mois moy.`],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm">
                    <span className="text-stone-400 w-24 flex-shrink-0">{k} :</span>
                    <span className="text-stone-800 font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Données énergétiques */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Consom. théorique",  valeur: `${score.consommationTheoriqueAnnuelle} kWh/an` },
                { label: "Consom. réelle moy.", valeur: `${score.consommationReelleMoyenne} kWh/mois` },
                { label: "Statut",              valeur: score.statutComparaison },
              ].map(({ label, valeur }) => (
                <div key={label} className="bg-stone-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-stone-400 mb-1">{label}</p>
                  <p className="text-sm font-bold text-stone-800 capitalize">{valeur}</p>
                </div>
              ))}
            </div>

            {/* QR Code + numéro */}
            <div className="flex items-center gap-6 border border-stone-200 rounded-xl p-5">
              <QRCode
                value={urlVerif}
                size={90}
                bgColor="#ffffff"
                fgColor="#166534"
                level="M"
              />
              <div className="flex-1">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
                  Numéro de certificat
                </p>
                <p className="text-base font-mono font-bold text-stone-900">
                  {numeroCertif}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Date d'émission : {dateEmission}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Valable 2 ans — Renouvellement recommandé après travaux
                </p>
                <p className="text-xs text-green-600 mt-1 font-mono break-all">
                  {urlVerif}
                </p>
              </div>
            </div>
          </div>

          {/* ── Pied de page ──────────────────────────────────── */}
          <div className="bg-stone-50 border-t border-stone-200 px-10 py-4 text-center">
            <p className="text-xs text-stone-400">
              Émis par <strong className="text-stone-600">GreenBuild v3.0</strong> —
              Agence Marocaine pour l'Efficacité Énergétique (AMEE) —
              Conforme Loi 47-09
            </p>
            <p className="text-xs text-stone-300 mt-1">
              ENSA Berrechid · Module Technologies Web · Pr. Ilhame Ait Lbachir
            </p>
          </div>
        </div>
      </div>
    </>
  );
}