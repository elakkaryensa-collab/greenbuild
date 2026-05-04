// CertificatPDF.tsx — Classe A, score 92/100
import { useRef } from "react";
import { useDossierStore } from "../store/dossierStore";
import { LABELS_CLASSES } from "../types/Score";

function genererNumeroCertificat(batimentId: string): string {
  const annee = new Date().getFullYear();
  const hash = batimentId.slice(0, 6).toUpperCase();
  const seq = Math.floor(Math.random() * 9000 + 1000);
  return `GB-${annee}-${hash}-${seq}`;
}

// ─── Score forcé à A pour la démo ───────────────────────────
const SCORE_DEMO = {
  classe: "A" as const,
  valeur: 92,
  baseCalcul: "210 m² · Zone 1",
  consommationTheoriqueAnnuelle: 8400,
  consommationReelleMoyenne: 620,
  statutComparaison: "sous le seuil",
};

const BATIMENT_DEMO = {
  id: "a3f9e1",
  type: "Résidentiel",
  surfaceM2: 210,
  isolation: "Excellente",
  vitrage: "Triple vitrage",
  zoneClimatique: "Zone 1 — Littorale",
  region: "Marrakesh-Safi",
  ville: "Safi",
};

export default function CertificatPDF() {
  const certifRef = useRef<HTMLDivElement>(null);

  // Utilise le store si disponible, sinon la démo
  const batimentStore = useDossierStore((s) => s.batiment);
  const scoreStore = useDossierStore((s) => s.score);
  const batiment = batimentStore ?? BATIMENT_DEMO;
  const score = scoreStore ?? SCORE_DEMO;

  const numeroCertif = genererNumeroCertificat(batiment.id);
  const dateEmission = new Date().toLocaleDateString("fr-MA", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const urlVerif = `https://greenbuild.netlify.app/verify/${numeroCertif}`;
  const CLASSES = ["A","B","C","D","E","F","G"] as const;

  const COULEURS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    A: { bg: "#e8f5ee", text: "#0f5e2a", border: "#1a9950", badge: "#1a9950" },
    B: { bg: "#eef7e8", text: "#2a6e10", border: "#4aa830", badge: "#4aa830" },
    C: { bg: "#f5fbe8", text: "#4a6e10", border: "#8ac830", badge: "#8ac830" },
    D: { bg: "#fefce8", text: "#6e5810", border: "#d4b030", badge: "#d4b030" },
    E: { bg: "#fef3e8", text: "#6e3e10", border: "#d47030", badge: "#d47030" },
    F: { bg: "#feeae8", text: "#6e1e10", border: "#d44030", badge: "#d44030" },
    G: { bg: "#fde8e8", text: "#6e0810", border: "#c42020", badge: "#c42020" },
  };

  const c = COULEURS[score.classe];
  const imprimer = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#certificat-print-root) { display: none !important; }
          #certificat-print-root { display: block !important; }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@300;400;600&display=swap');
      `}</style>

      {/* Bouton impression */}
      <button
        onClick={imprimer}
        className="no-print flex items-center gap-2 px-5 py-2.5
                   bg-green-700 hover:bg-green-800 text-white
                   text-sm font-semibold rounded-xl transition-colors mb-6"
      >
        🖨️ Télécharger / Imprimer le certificat
      </button>

      <div id="certificat-print-root">
        <div
          ref={certifRef}
          style={{ fontFamily: "'Source Sans 3', sans-serif", color: "#1a1a1a", maxWidth: 660, margin: "0 auto", border: "1px solid #d4d0c8", background: "#fff" }}
          className="print:max-w-full print:border-0"
        >

          {/* En-tête */}
          <div style={{ background: "#0f4c2a", color: "#fff", padding: "28px 40px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>GreenBuild</h1>
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#7dbf97", margin: 0 }}>
                Plateforme de Certification Énergétique
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#7dbf97", letterSpacing: 1 }}>N° {numeroCertif}</div>
              <div style={{ fontSize: 11, color: "#a8d4b8", marginTop: 3 }}>Émis le {dateEmission}</div>
            </div>
          </div>
          <div style={{ background: "#1a6638", height: 3 }} />

          {/* Corps */}
          <div style={{ padding: "32px 40px" }}>

            {/* Titre + Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26, borderBottom: "0.5px solid #e8e4dc", paddingBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 400, color: "#2a2a2a", margin: "0 0 4px", letterSpacing: 0.5 }}>
                  Certificat de Performance Énergétique
                </h2>
                <p style={{ fontSize: 11, color: "#888", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>
                  Conforme à la Loi 47-09 — Efficacité Énergétique
                </p>
              </div>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: c.bg, border: `3px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: c.text, lineHeight: 1 }}>{score.classe}</span>
                <span style={{ fontSize: 10, color: c.badge, fontWeight: 600 }}>{score.valeur}/100</span>
              </div>
            </div>

            {/* Barre des classes */}
            <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 22 }}>
              <span style={{ fontSize: 11, color: "#888", marginRight: 6 }}>Classe :</span>
              {CLASSES.map((cls) => (
                <div
                  key={cls}
                  style={{
                    width: 30, height: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 600, borderRadius: 1,
                    background: cls === score.classe ? COULEURS[cls].badge : "#f0f0eb",
                    color: cls === score.classe ? "#fff" : "#bbb",
                    border: cls === score.classe ? `2px solid ${COULEURS[cls].text}` : "none",
                  }}
                >{cls}</div>
              ))}
              <span style={{ fontSize: 11, color: c.badge, fontWeight: 600, marginLeft: 8 }}>
                {LABELS_CLASSES[score.classe] ?? "Très haute performance"}
              </span>
            </div>

            {/* Informations bâtiment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "0.5px solid #ddd8cc", borderRadius: 2, overflow: "hidden", marginBottom: 22 }}>
              {[
                ["Type", batiment.type],
                ["Surface", `${batiment.surfaceM2} m²`],
                ["Isolation", batiment.isolation],
                ["Vitrage", batiment.vitrage],
                ["Zone RTCM", batiment.zoneClimatique],
                ["Région", batiment.region],
              ].map(([k, v], i) => (
                <div key={k} style={{ padding: "10px 14px", borderBottom: i < 4 ? "0.5px solid #ddd8cc" : "none", borderRight: i % 2 === 0 ? "0.5px solid #ddd8cc" : "none" }}>
                  <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Données énergétiques */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
              {[
                ["Consom. théorique", `${score.consommationTheoriqueAnnuelle} kWh/an`],
                ["Consom. réelle moy.", `${score.consommationReelleMoyenne} kWh/mois`],
                ["Statut", score.statutComparaison],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "#f6f4ef", padding: 12, textAlign: "center", borderRadius: 2 }}>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{lbl}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", textTransform: "capitalize" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* QR + méta */}
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", borderTop: "0.5px solid #e8e4dc", paddingTop: 22 }}>
              {/* QR simulé — remplace par <QRCode value={urlVerif} size={80} fgColor="#0f4c2a" /> */}
              <div style={{ width: 80, height: 80, flexShrink: 0, background: "#f0ede6", border: "0.5px solid #ccc9bf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#888", textAlign: "center" }}>
                QR Code
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Numéro de certificat</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#0f4c2a", fontWeight: 600, marginBottom: 8 }}>{numeroCertif}</div>
                <div style={{ fontSize: 10, color: "#1a9950", fontFamily: "monospace", wordBreak: "break-all" }}>{urlVerif}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>Valable 2 ans · Renouvellement recommandé après travaux</div>
              </div>
            </div>
          </div>

         

        </div>
      </div>
    </>
  );
}