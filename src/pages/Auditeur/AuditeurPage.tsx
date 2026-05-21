import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClasseEnergetique = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type DossierId = "DOS-2024-001" | "DOS-2024-002" | "DOS-2024-003" | "DOS-2024-004";
type Statut = "idle" | "valide" | "rejete";
type Onglet = "donnees" | "mesures";

interface Dossier {
  id: DossierId;
  nom: string;
  ville: string;
  surface: number;
  classe: ClasseEnergetique;
  date: string;
  urgent: boolean;
}

interface DossierDetail {
  bat: [string, string][];
  classe: ClasseEnergetique;
  factures: number[];
  mesures: [string, string][];
}

interface ScoreMeta {
  bg: string;
  c: string;
  label: string;
}

// ─── Palette Analyste (reprise exacte) ───────────────────────────────────────

const P = {
  primary:  "#15803d",
  dark:     "#1A4A2E",
  accent:   "#6DB33F",
  warm:     "#B5451B",
  muted:    "#6b6b5e",
  bg:       "#F7F7F7",
  card:     "#FFFFFF",
  border:   "#E8E8E8",
  subtle:   "#F2F2F2",
};

// ─── Données ──────────────────────────────────────────────────────────────────

const DOSSIERS: Dossier[] = [
  { id: "DOS-2024-001", nom: "Mohammed Alaoui",  ville: "Casablanca", surface: 120, classe: "D", date: "12 Jan 2025", urgent: true  },
  { id: "DOS-2024-002", nom: "Fatima Benali",    ville: "Rabat",      surface: 85,  classe: "C", date: "15 Jan 2025", urgent: false },
  { id: "DOS-2024-003", nom: "Ahmed Tazi",       ville: "Marrakech",  surface: 200, classe: "E", date: "18 Jan 2025", urgent: true  },
  { id: "DOS-2024-004", nom: "Zineb Chraibi",    ville: "Fès",        surface: 95,  classe: "B", date: "20 Jan 2025", urgent: false },
];

const DETAILS: Record<DossierId, DossierDetail> = {
  "DOS-2024-001": {
    bat: [["Type","Résidentiel"],["Surface","123 m²"],["Isolation","Moyen"],["Vitrage","Simple"],["Zone RTCM","Côtière"],["Région","Casablanca-Settat"]],
    classe: "D",
    factures: [546,653,764,456,422,6547,4317,4332,411,778,534,425],
    mesures: [["Épaisseur isolation","8 cm laine de verre"],["Type fenêtres","Simple vitrage alu"],["Surface vitrée","18 m² (15%)"],["Infiltrations","Détectées en cuisine"],["État CVC","Climatiseur > 10 ans"],["Certificat technicien","TEC-2024-0847"]],
  },
  "DOS-2024-002": {
    bat: [["Type","Résidentiel"],["Surface","85 m²"],["Isolation","Bon"],["Vitrage","Double"],["Zone RTCM","Atlantique"],["Région","Rabat-Salé-Kénitra"]],
    classe: "C",
    factures: [310,290,320,280,350,980,1100,1050,400,330,300,295],
    mesures: [["Épaisseur isolation","12 cm polystyrène"],["Type fenêtres","Double vitrage PVC"],["Surface vitrée","12 m² (14%)"],["Infiltrations","Aucune"],["État CVC","Récent (2 ans)"],["Certificat technicien","TEC-2024-0912"]],
  },
  "DOS-2024-003": {
    bat: [["Type","Commercial"],["Surface","200 m²"],["Isolation","Faible"],["Vitrage","Simple"],["Zone RTCM","Continentale"],["Région","Marrakech-Safi"]],
    classe: "E",
    factures: [1200,1350,1500,1800,2200,3800,4500,4300,2100,1600,1400,1250],
    mesures: [["Épaisseur isolation","Inexistante"],["Type fenêtres","Simple vitrage ancien"],["Surface vitrée","45 m² (22%)"],["Infiltrations","Multiples points"],["État CVC","Vétuste > 15 ans"],["Certificat technicien","TEC-2024-1023"]],
  },
  "DOS-2024-004": {
    bat: [["Type","Résidentiel"],["Surface","95 m²"],["Isolation","Très bon"],["Vitrage","Double"],["Zone RTCM","Continentale"],["Région","Fès-Meknès"]],
    classe: "B",
    factures: [280,260,290,250,310,750,820,800,350,290,270,265],
    mesures: [["Épaisseur isolation","15 cm laine de roche"],["Type fenêtres","Double vitrage thermique"],["Surface vitrée","14 m² (15%)"],["Infiltrations","Aucune"],["État CVC","Pompe à chaleur (1 an)"],["Certificat technicien","TEC-2024-1105"]],
  },
};

const MOIS: string[] = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

// Spectre classes A→G — même spectre que l'Analyste
const CLS_CLR: Record<ClasseEnergetique, string> = {
  A: "#1A4A2E",
  B: "#2D6B45",
  C: "#6DB33F",
  D: "#FAC775",
  E: "#EF9F27",
  F: "#F0997B",
  G: "#D85A30",
};

// Texte sur badge classe (contraste)
const CLS_TXT: Record<ClasseEnergetique, string> = {
  A: "#FFFFFF",
  B: "#FFFFFF",
  C: "#FFFFFF",
  D: "#1A4A2E",
  E: "#1A4A2E",
  F: "#1A4A2E",
  G: "#FFFFFF",
};

const SCORES_META: Record<ClasseEnergetique, ScoreMeta> = {
  A: { bg: CLS_CLR["A"], c: "#FFFFFF", label: "Très performant"          },
  B: { bg: CLS_CLR["B"], c: "#FFFFFF", label: "Performant"               },
  C: { bg: CLS_CLR["C"], c: "#FFFFFF", label: "Assez performant"         },
  D: { bg: CLS_CLR["D"], c: "#1A4A2E", label: "Peu performant"           },
  E: { bg: CLS_CLR["E"], c: "#1A4A2E", label: "Énergivore"               },
  F: { bg: CLS_CLR["F"], c: "#1A4A2E", label: "Très énergivore"          },
  G: { bg: CLS_CLR["G"], c: "#FFFFFF", label: "Extrêmement énergivore"   },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }

  /* ── Barre nav ── */
  .nav-bar {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 20px;
    background:${P.card};
    border-bottom:1px solid ${P.border};
  }
  .nav-left { display:flex; align-items:center; gap:8px; }
  .logo-icon {
    width:28px; height:28px; border-radius:8px;
    background:${P.primary};
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .logo-text { font-size:13px; font-weight:700; color:${P.dark}; }
  .logo-text span { color:${P.primary}; }
  .badge-live {
    display:inline-flex; align-items:center; gap:6px;
    font-size:11px; color:${P.muted};
    background:${P.subtle}; border:1px solid ${P.border};
    border-radius:100px; padding:5px 12px;
  }
  .dot-pulse {
    width:6px; height:6px; border-radius:50%;
    background:${P.primary}; animation:pulse 2s infinite; flex-shrink:0;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* ── Page ── */
  .page { max-width:920px; margin:0 auto; padding:20px 16px; background:${P.bg}; min-height:calc(100vh - 49px); }
  .header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
  .header h1 { font-size:18px; font-weight:700; color:${P.dark}; letter-spacing:-0.3px; }
  .header p  { font-size:12px; color:${P.muted}; margin-top:3px; }
  .sec-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:${P.muted}; margin-bottom:9px; }

  /* ── Grille ── */
  .grid { display:grid; grid-template-columns:210px 1fr; gap:14px; align-items:start; }
  @media(max-width:620px){ .grid{ grid-template-columns:1fr; } }

  /* ── Dossiers ── */
  .dossier-list { display:flex; flex-direction:column; gap:5px; }
  .dos-btn {
    width:100%; text-align:left; padding:10px 11px;
    border-radius:10px; background:${P.card};
    border:1px solid ${P.border}; cursor:pointer;
    transition:border-color .15s, background .15s;
  }
  .dos-btn:hover { border-color:#b0c4b8; }
  .dos-btn-active {
    background:${P.subtle} !important;
    border-color:${P.primary} !important;
    box-shadow:inset 0 0 0 1px ${P.primary};
  }
  .dos-id   { font-family:monospace; font-size:10px; color:${P.muted}; }
  .dos-name { font-size:11px; font-weight:600; color:${P.dark}; margin:2px 0; }
  .dos-sub  { font-size:10px; color:${P.muted}; }
  .dos-foot { display:flex; align-items:center; justify-content:space-between; margin-top:7px; }
  .dos-date { font-size:10px; color:${P.muted}; opacity:.7; }

  /* ── Badges ── */
  .badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:5px; }
  .badge-urgent {
    font-size:9px; padding:2px 6px; border-radius:100px;
    background:#fdf2ee; color:${P.warm};
    border:1px solid #f5c4b0;
  }

  /* ── Colonne droite ── */
  .right-col { display:flex; flex-direction:column; gap:11px; }

  /* ── Onglets ── */
  .tabs {
    display:flex; gap:2px;
    background:${P.subtle}; border:1px solid ${P.border};
    border-radius:10px; padding:3px; width:fit-content; margin-bottom:2px;
  }
  .tab-btn {
    padding:6px 14px; border-radius:8px;
    font-size:12px; font-weight:500;
    background:transparent; border:none;
    color:${P.muted}; cursor:pointer; transition:all .15s;
  }
  .tab-btn-active {
    background:${P.card} !important;
    color:${P.dark} !important;
    box-shadow:0 1px 3px rgba(26,74,46,.08);
  }

  /* ── Cards ── */
  .card {
    background:${P.card}; border:1px solid ${P.border};
    border-radius:14px; padding:16px;
    box-shadow:0 1px 4px rgba(26,74,46,.04);
  }
  .card-title { display:flex; align-items:center; gap:7px; margin-bottom:13px; }
  .card-dot   { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .card-title h3 { font-size:13px; font-weight:600; color:${P.dark}; }

  /* ── Key-value rows ── */
  .kv-row { display:flex; justify-content:space-between; align-items:baseline; padding:5px 0; border-bottom:1px solid ${P.border}; font-size:12px; }
  .kv-row:last-child { border-bottom:none; }
  .kv-k { color:${P.muted}; }
  .kv-v { font-weight:500; color:${P.dark}; }
  .kv-v-accent { font-weight:500; color:${P.dark}; }

  /* ── Score chip ── */
  .score-bar-section { margin-top:12px; padding-top:12px; border-top:1px solid ${P.border}; }
  .score-chip {
    display:inline-flex; align-items:center; gap:8px;
    margin-top:4px; padding:8px 12px;
    background:${P.subtle}; border:1px solid ${P.border}; border-radius:9px;
  }
  .score-letter { width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
  .score-chip-sub   { font-size:10px; color:${P.muted}; }
  .score-chip-label { font-size:12px; font-weight:600; color:${P.dark}; }

  /* ── Factures ── */
  .factures-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:5px; }
  @media(max-width:500px){ .factures-grid{ grid-template-columns:repeat(4,1fr); } }
  .fact-cell { background:${P.subtle}; border:1px solid ${P.border}; border-radius:8px; padding:7px 3px; text-align:center; }
  .fact-m { font-size:9px;  color:${P.muted}; }
  .fact-v { font-size:11px; font-weight:600; color:${P.dark}; }
  .fact-u { font-size:9px;  color:${P.muted}; opacity:.7; }

  /* ── Photos ── */
  .photos-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:11px; }
  .photo-slot {
    aspect-ratio:4/3; border-radius:9px;
    background:${P.subtle}; border:1.5px dashed ${P.border};
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;
  }
  .photo-slot span { font-size:10px; color:${P.muted}; text-align:center; padding:0 6px; line-height:1.4; }
  .photo-np { font-size:9px; background:${P.border}; color:${P.muted}; padding:2px 7px; border-radius:100px; }

  /* ── Décision ── */
  .textarea-field {
    width:100%; padding:9px 11px; font-size:12px;
    background:${P.subtle}; border:1px solid ${P.border};
    border-radius:9px; color:${P.dark}; resize:none; outline:none; font-family:inherit;
    transition:border-color .15s;
  }
  .textarea-field:focus { border-color:${P.primary}; }
  .btn-row { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:3px; }
  .btn-valider {
    padding:11px; border-radius:10px; font-size:13px; font-weight:600;
    background:${P.primary}; color:#FFFFFF; border:none; cursor:pointer;
    transition:background .15s; box-shadow:0 2px 12px rgba(21,128,61,.2);
  }
  .btn-valider:hover { background:${P.dark}; }
  .btn-rejeter {
    padding:11px; border-radius:10px; font-size:13px; font-weight:600;
    background:#fdf2ee; color:${P.warm}; border:1px solid #f5c4b0; cursor:pointer;
    transition:opacity .15s;
  }
  .btn-rejeter:hover { opacity:.85; }

  /* ── Résultat ── */
  .result-card { border-radius:14px; padding:24px; text-align:center; animation:fadeUp .3s ease both; }
  .result-card-valide { background:#eaf3de; border:2px solid ${P.primary}; }
  .result-card-rejete { background:#fdf2ee; border:2px solid #f5c4b0; }
  .result-icon  { font-size:34px; margin-bottom:9px; }
  .result-title { font-size:16px; font-weight:700; margin-bottom:5px; color:${P.dark}; }
  .result-sub   { font-size:12px; color:${P.muted}; margin-bottom:13px; line-height:1.6; }
  .btn-back { font-size:11px; color:${P.muted}; background:none; border:none; cursor:pointer; text-decoration:underline; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* ── Tags conformité ── */
  .tag-list { display:flex; gap:6px; flex-wrap:wrap; margin-top:16px; }
  .tag {
    font-size:11px; font-weight:600; padding:4px 12px; border-radius:100px;
    background:${P.subtle}; color:${P.primary}; border:1px solid ${P.border};
  }
`;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function GreenBuildPortal() {
  const [active, setActive]           = useState<DossierId>("DOS-2024-001");
  const [onglet, setOnglet]           = useState<Onglet>("donnees");
  const [statut, setStatut]           = useState<Statut>("idle");
  const [commentaire, setCommentaire] = useState<string>("");

  const handleValider = () => setStatut("valide");

  const handleRejeter = () => {
    if (!commentaire.trim()) {
      alert("Un commentaire est obligatoire pour rejeter un dossier.");
      return;
    }
    setStatut("rejete");
  };

  const handleReset = () => { setStatut("idle"); setCommentaire(""); };

  const handleSelect = (id: DossierId) => {
    setActive(id);
    setStatut("idle");
    setCommentaire("");
  };

  const det = DETAILS[active];
  const sm  = SCORES_META[det.classe];

  return (
    <>
      <style>{styles}</style>
      <div style={{ background: P.bg, minHeight: "100vh" }}>

      

        {/* ── Page ── */}
        <div className="page">
          <div className="header">
            <div>
              <h1>
                Auditeur <span style={{ color: P.primary }}>certifié</span>
              </h1>
              <p>Validation des dossiers de certification énergétique</p>
            </div>
            <div className="badge-live">
              <span className="dot-pulse" />
              4 dossiers en attente
            </div>
          </div>

          <div className="grid">
            {/* ── Liste des dossiers ── */}
            <div>
              <p className="sec-label">Dossiers en attente</p>
              <div className="dossier-list">
                {DOSSIERS.map((d) => (
                  <button
                    key={d.id}
                    className={`dos-btn${d.id === active ? " dos-btn-active" : ""}`}
                    onClick={() => handleSelect(d.id)}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span className="dos-id">{d.id}</span>
                      {d.urgent && <span className="badge badge-urgent">Urgent</span>}
                    </div>
                    <div className="dos-name">{d.nom}</div>
                    <div className="dos-sub">{d.ville} · {d.surface} m²</div>
                    <div className="dos-foot">
                      <span
                        className="badge"
                        style={{
                          background: CLS_CLR[d.classe],
                          color: CLS_TXT[d.classe],
                        }}
                      >
                        Classe {d.classe}
                      </span>
                      <span className="dos-date">{d.date}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tags conformité sous la liste */}
              <div className="tag-list">
                {["RTCM", "AMEE", "Loi 47-09"].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>

            {/* ── Panneau de détail ── */}
            <div className="right-col">

              {/* Onglets */}
              <div className="tabs">
                <button
                  className={`tab-btn${onglet === "donnees" ? " tab-btn-active" : ""}`}
                  onClick={() => setOnglet("donnees")}
                >
                  Données propriétaire
                </button>
                <button
                  className={`tab-btn${onglet === "mesures" ? " tab-btn-active" : ""}`}
                  onClick={() => setOnglet("mesures")}
                >
                  Mesures technicien
                </button>
              </div>

              {/* Contenu de l'onglet */}
              {onglet === "donnees" ? (
                <div className="card">
                  <div className="card-title">
                    <div className="card-dot" style={{ background: P.primary }} />
                    <h3>Données propriétaire</h3>
                  </div>
                  {det.bat.map(([k, v]) => (
                    <div key={k} className="kv-row">
                      <span className="kv-k">{k}</span>
                      <span className="kv-v">{v}</span>
                    </div>
                  ))}
                  <div className="score-bar-section">
                    <div className="score-chip">
                      <div className="score-letter" style={{ background: sm.bg, color: sm.c }}>
                        {det.classe}
                      </div>
                      <div>
                        <div className="score-chip-sub">Classe énergétique</div>
                        <div className="score-chip-label">{sm.label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-title">
                    <div className="card-dot" style={{ background: CLS_CLR["D"] }} />
                    <h3>Mesures terrain (technicien)</h3>
                  </div>
                  {det.mesures.map(([k, v]) => (
                    <div key={k} className="kv-row">
                      <span className="kv-k">{k}</span>
                      <span className="kv-v-accent">{v}</span>
                    </div>
                  ))}
                  <div className="score-bar-section">
                    <div style={{ fontSize:11, fontWeight:500, color: P.muted, marginBottom:9 }}>
                      Photos terrain
                    </div>
                    <div className="photos-grid">
                      {["Façade principale", "Fenêtres / vitrage", "Équipements CVC"].map((p) => (
                        <div key={p} className="photo-slot">
                          <span>{p}</span>
                          <span className="photo-np">Non uploadée</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Factures ONEE */}
              <div className="card">
                <div className="card-title">
                  <div className="card-dot" style={{ background: P.accent }} />
                  <h3>12 Factures ONEE</h3>
                </div>
                <div className="factures-grid">
                  {det.factures.map((v, i) => (
                    <div key={i} className="fact-cell">
                      <div className="fact-m">{MOIS[i]}</div>
                      <div className="fact-v">{v.toLocaleString()}</div>
                      <div className="fact-u">kWh</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Décision */}
              {statut === "idle" ? (
                <div className="card">
                  <div className="card-title">
                    <div className="card-dot" style={{ background: P.primary }} />
                    <h3>Décision d'audit</h3>
                  </div>
                  <div style={{ marginBottom:11 }}>
                    <label style={{ fontSize:11, color: P.muted, display:"block", marginBottom:5 }}>
                      Commentaire{" "}
                      <span style={{ color: P.warm }}>
                        (obligatoire pour le rejet)
                      </span>
                    </label>
                    <textarea
                      className="textarea-field"
                      rows={3}
                      placeholder="Observations, corrections, remarques techniques..."
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                    />
                  </div>
                  <div className="btn-row">
                    <button className="btn-valider" onClick={handleValider}>
                      Valider le dossier
                    </button>
                    <button className="btn-rejeter" onClick={handleRejeter}>
                      Rejeter le dossier
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`result-card result-card-${statut}`}>
                  <div className="result-icon">{statut === "valide" ? "✓" : "✕"}</div>
                  <div className="result-title">
                    Dossier {statut === "valide" ? "validé" : "rejeté"}
                  </div>
                  <div className="result-sub">
                    {statut === "valide"
                      ? "Le dossier a été transmis à l'AMEE pour émission du certificat officiel."
                      : `Motif : ${commentaire}`}
                  </div>
                  <button className="btn-back" onClick={handleReset}>
                    ← Revenir à la liste
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </>
  );
}