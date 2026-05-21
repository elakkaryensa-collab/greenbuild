// ─────────────────────────────────────────────────────────────
// src/pages/Technicien/TechnicienPage.tsx
// GreenBuild — Palette 100% identique à AnalystePage
// ─────────────────────────────────────────────────────────────

import { useState }                from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm }                 from "react-hook-form";

// ── Palette Analyste (reprise exacte) ────────────────────────
const P = {
  primary: "#15803d",
  dark:    "#1A4A2E",
  accent:  "#6DB33F",
  warm:    "#B5451B",
  muted:   "#6b6b5e",
  bg:      "#F7F7F7",
  card:    "#FFFFFF",
  border:  "#E8E8E8",
  subtle:  "#F2F2F2",
};

// ── Données mock ──────────────────────────────────────────────
const MISSIONS_MOCK = [
  { id: "MIS-001", adresse: "45 Rue Ibn Sina, Casablanca",  proprietaire: "Mohammed Alaoui", date: "Aujourd'hui 9h",  statut: "en_cours"  as const },
  { id: "MIS-002", adresse: "12 Av. Hassan II, Rabat",      proprietaire: "Fatima Benali",   date: "Aujourd'hui 14h", statut: "planifiee" as const },
  { id: "MIS-003", adresse: "7 Derb El Mellah, Marrakech",  proprietaire: "Ahmed Tazi",      date: "Demain 10h",      statut: "planifiee" as const },
  { id: "MIS-004", adresse: "23 Rue Allal El Fassi, Fès",   proprietaire: "Zineb Chraibi",   date: "23 Jan 11h",      statut: "terminee"  as const },
];

// Statuts — couleurs cohérentes avec la palette Analyste
const STATUT_CONFIG = {
  en_cours:  { label: "En cours",  dot: "#185FA5",  bg: "#E6F1FB", text: "#185FA5",  border: "#B5D4F4" },
  planifiee: { label: "Planifiée", dot: "#BA7517",  bg: "#FAEEDA", text: "#BA7517",  border: "#FAC775" },
  terminee:  { label: "Terminée",  dot: P.primary,  bg: "#EAF3DE", text: P.dark,     border: "#C0DD97" },
};

interface FormMesures {
  epaisseurIsolation:     number;
  typeFenetre:            string;
  surfaceVitree:          number;
  etatClimatiseur:        string;
  infiltrationsDetectees: boolean;
  observations:           string;
}

// ── Icônes SVG ────────────────────────────────────────────────
const IcoPin     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoSave    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCamera  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoTrash   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoRefresh = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

// ── Styles (même approche que AuditeurPage migré) ─────────────
const styles = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }

  .page-wrap { background:${P.bg}; min-height:100vh; }
  .inner     { max-width:960px; margin:0 auto; padding:28px 16px; }

  /* ── En-tête ── */
  .pill-live {
    display:inline-flex; align-items:center; gap:6px;
    font-size:11px; color:${P.muted};
    background:${P.card}; border:1px solid ${P.border};
    border-radius:100px; padding:5px 14px; margin-bottom:14px;
  }
  .dot-pulse { width:6px; height:6px; border-radius:50%; background:${P.primary}; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  .header-row { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
  .header-row h1 { font-size:22px; font-weight:900; color:${P.dark}; letter-spacing:-.4px; }
  .header-row h1 span { color:${P.primary}; }
  .header-row p  { font-size:12px; color:${P.muted}; margin-top:3px; }

  /* ── KPI chips ── */
  .kpi-row { display:flex; gap:10px; }
  .kpi-chip {
    background:${P.card}; border:1px solid ${P.border};
    border-radius:14px; padding:10px 18px; text-align:center;
    box-shadow:0 1px 4px rgba(26,74,46,.04);
  }
  .kpi-val  { font-size:22px; font-weight:900; }
  .kpi-lbl  { font-size:10px; color:${P.muted}; font-weight:500; margin-top:2px; }
  .kpi-blue { color:#185FA5; }
  .kpi-amb  { color:#BA7517; }
  .kpi-grn  { color:${P.dark}; }

  /* ── Grille principale ── */
  .main-grid { display:grid; grid-template-columns:220px 1fr; gap:18px; align-items:start; }
  @media(max-width:680px){ .main-grid{ grid-template-columns:1fr; } }

  /* ── Sec label ── */
  .sec-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:${P.muted}; margin-bottom:10px; padding-left:2px; }

  /* ── Mission buttons ── */
  .mis-list { display:flex; flex-direction:column; gap:6px; }
  .mis-btn {
    width:100%; text-align:left; padding:12px 13px;
    border-radius:12px; background:${P.card};
    border:1px solid ${P.border}; cursor:pointer;
    transition:border-color .15s, box-shadow .15s;
  }
  .mis-btn:hover { border-color:#b0c4b8; }
  .mis-btn-active {
    background:${P.subtle} !important;
    border:2px solid ${P.primary} !important;
    box-shadow:0 0 0 0px ${P.primary};
  }
  .mis-id   { font-family:monospace; font-size:10px; color:${P.muted}; }
  .mis-addr { font-size:11px; font-weight:700; color:${P.dark}; margin:3px 0 2px; line-height:1.35; }
  .mis-addr-active { color:${P.primary}; }
  .mis-sub  { font-size:10px; color:${P.muted}; margin-bottom:8px; }
  .mis-foot { display:flex; align-items:center; justify-content:space-between; }

  /* ── Badge statut ── */
  .badge-statut {
    font-size:10px; font-weight:700; padding:2px 8px;
    border-radius:100px; border:1px solid;
    display:inline-flex; align-items:center; gap:4px;
  }
  .badge-dot { width:5px; height:5px; border-radius:50%; }

  /* ── Avatar initiale ── */
  .avatar { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; color:#fff; flex-shrink:0; }

  /* ── Tags ── */
  .tag-list { display:flex; flex-direction:column; gap:6px; margin-top:14px; }
  .tag {
    font-size:11px; font-weight:600; padding:5px 12px; border-radius:100px; text-align:center;
    background:${P.subtle}; color:${P.primary}; border:1px solid ${P.border};
  }

  /* ── Colonne droite ── */
  .right-col { display:flex; flex-direction:column; gap:12px; }

  /* ── Hero bannière ── */
  .hero-banner {
    border-radius:14px; padding:18px 20px;
    background:${P.primary};
    display:flex; align-items:center; gap:14px;
    position:relative; overflow:hidden;
  }
  .hero-icon {
    width:38px; height:38px; border-radius:10px;
    background:rgba(255,255,255,.15);
    display:flex; align-items:center; justify-content:center;
    color:#fff; flex-shrink:0;
  }
  .hero-eyebrow { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,.65); margin-bottom:2px; }
  .hero-title   { font-size:13px; font-weight:900; color:#fff; line-height:1.3; }
  .hero-sub     { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }
  .hero-badge   { margin-left:auto; font-size:11px; font-weight:700; padding:5px 12px; border-radius:10px; background:rgba(255,255,255,.15); color:#fff; flex-shrink:0; }

  /* ── Cards ── */
  .card {
    background:${P.card}; border:1px solid ${P.border};
    border-radius:14px; overflow:hidden;
    box-shadow:0 1px 4px rgba(26,74,46,.04);
  }
  .card-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 18px; border-bottom:1px solid ${P.border};
  }
  .card-header-left { display:flex; align-items:center; gap:10px; }
  .card-icon {
    width:34px; height:34px; border-radius:10px;
    background:${P.subtle}; border:1px solid ${P.border};
    display:flex; align-items:center; justify-content:center;
    color:${P.primary}; flex-shrink:0;
  }
  .card-title { font-size:13px; font-weight:700; color:${P.dark}; }
  .card-sub   { font-size:11px; color:${P.muted}; margin-top:1px; }

  /* ── Formulaire ── */
  .form-body { padding:18px; display:flex; flex-direction:column; gap:14px; }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .form-lbl  { font-size:11px; font-weight:600; color:${P.muted}; display:block; margin-bottom:5px; }
  .form-req  { color:${P.warm}; }
  .input-wrap { position:relative; }
  .input-unit {
    position:absolute; right:10px; top:50%; transform:translateY(-50%);
    font-size:11px; font-weight:700; color:${P.muted}; pointer-events:none;
  }
  .field {
    width:100%; padding:8px 12px; font-size:12px;
    background:${P.subtle}; border:1px solid ${P.border};
    color:${P.dark}; border-radius:9px; outline:none; font-family:inherit;
    transition:border-color .15s;
    appearance:none; -webkit-appearance:none;
  }
  .field:focus { border-color:${P.primary}; background:${P.card}; }
  .field-unit { padding-right:32px; }

  /* ── Checkbox ── */
  .checkbox-row {
    display:flex; align-items:flex-start; gap:10px; padding:12px 13px;
    border-radius:10px; cursor:pointer;
    background:${P.subtle}; border:1px solid ${P.border};
    transition:border-color .15s;
  }
  .checkbox-row:hover { border-color:#b0c4b8; }
  .checkbox-box {
    width:16px; height:16px; border-radius:5px; border:2px solid ${P.border};
    background:${P.card}; flex-shrink:0; margin-top:1px;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s;
  }
  .checkbox-box-checked { background:${P.primary}; border-color:${P.primary}; }
  .checkbox-lbl  { font-size:12px; font-weight:600; color:${P.dark}; }
  .checkbox-sub  { font-size:10px; color:${P.muted}; margin-top:2px; line-height:1.4; }

  /* ── Textarea ── */
  .textarea-field {
    width:100%; padding:9px 12px; font-size:12px;
    background:${P.subtle}; border:1px solid ${P.border};
    border-radius:9px; color:${P.dark}; resize:none; outline:none; font-family:inherit;
    transition:border-color .15s;
  }
  .textarea-field:focus { border-color:${P.primary}; background:${P.card}; }

  /* ── Btn submit ── */
  .btn-submit {
    width:100%; padding:11px; border-radius:10px;
    font-size:13px; font-weight:700; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:7px;
    background:${P.primary}; color:#fff;
    box-shadow:0 2px 12px rgba(21,128,61,.2);
    transition:background .15s, box-shadow .15s;
  }
  .btn-submit:hover { background:${P.dark}; }
  .btn-submit-ok { background:#27500A !important; }

  /* ── Zone upload photo ── */
  .upload-zone {
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
    padding:36px 20px;
    border:1.5px dashed ${P.border}; border-radius:12px; cursor:pointer;
    transition:border-color .2s, background .2s;
  }
  .upload-zone:hover { border-color:${P.primary}; background:#f0f8f4; }
  .upload-icon {
    width:44px; height:44px; border-radius:12px;
    background:${P.subtle}; border:1px solid ${P.border};
    display:flex; align-items:center; justify-content:center;
    color:${P.muted}; transition:background .2s, color .2s;
  }
  .upload-zone:hover .upload-icon { background:#daf0e2; color:${P.primary}; }
  .upload-title { font-size:13px; font-weight:600; color:${P.muted}; transition:color .2s; }
  .upload-zone:hover .upload-title { color:${P.dark}; }
  .upload-hint  { font-size:11px; color:${P.border}; margin-top:-4px; }

  /* ── Photos grid ── */
  .photos-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
  .photo-slot {
    aspect-ratio:1; border-radius:10px;
    background:${P.subtle}; border:1px solid ${P.border};
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;
  }
  .photo-slot-lbl { font-size:10px; color:${P.muted}; text-align:center; padding:0 6px; line-height:1.4; }
  .photo-slot-np  { font-size:9px; background:${P.border}; color:${P.muted}; padding:2px 7px; border-radius:100px; }

  /* ── Photo réelle ── */
  .photo-real { aspect-ratio:1; border-radius:10px; overflow:hidden; position:relative; border:1px solid ${P.border}; }
  .photo-real img { width:100%; height:100%; object-fit:cover; display:block; }
  .photo-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.4);
    opacity:0; transition:opacity .2s;
    display:flex; align-items:flex-end; justify-content:flex-start; padding:6px;
  }
  .photo-real:hover .photo-overlay { opacity:1; }
  .photo-delete {
    width:22px; height:22px; border-radius:6px;
    background:#E24B4A; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; color:#fff;
    transition:background .15s;
  }
  .photo-delete:hover { background:#A32D2D; }
  .photo-count-badge {
    font-size:11px; font-weight:700; padding:3px 10px; border-radius:100px;
    background:#EAF3DE; color:${P.dark}; border:1px solid #C0DD97;
  }

  /* ── Géolocalisation ── */
  .geo-row { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; gap:12px; }
  .geo-coords { font-family:monospace; font-size:11px; font-weight:600; color:${P.primary}; }
  .btn-refresh {
    display:flex; align-items:center; gap:6px;
    font-size:11px; font-weight:600; padding:7px 13px; border-radius:9px;
    background:${P.subtle}; border:1px solid ${P.border};
    color:${P.muted}; cursor:pointer; transition:border-color .15s, color .15s; flex-shrink:0;
  }
  .btn-refresh:hover { border-color:#b0c4b8; color:${P.dark}; }

  /* ── Tags footer ── */
  .tags-footer { display:flex; gap:6px; flex-wrap:wrap; }
  .tag-footer {
    font-size:11px; font-weight:600; padding:4px 12px; border-radius:100px;
    background:${P.subtle}; color:${P.primary}; border:1px solid ${P.border};
  }
`;

// ── SectionHeader (style Analyste) ───────────────────────────
function SectionHeader({ Icon, title, sub }: { Icon: () => React.ReactElement; title: string; sub: string }) {
  return (
    <div className="card-header">
      <div className="card-header-left">
        <div className="card-icon"><Icon /></div>
        <div>
          <p className="card-title">{title}</p>
          <p className="card-sub">{sub}</p>
        </div>
      </div>
    </div>
  );
}

// ── Icônes section ────────────────────────────────────────────
const IcoRuler = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 8.7 8.7 21.3c-.4.4-.8.6-1.3.7H4a1 1 0 0 1-1-1v-3.4c0-.5.2-1 .7-1.3L16.3 2.7a1 1 0 0 1 1.4 0l3.6 3.6a1 1 0 0 1 0 1.4z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>;
const IcoPhoto = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoGps   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>;

// ── Composant principal ───────────────────────────────────────
export default function TechnicienPage() {
  const [missionActive, setMissionActive] = useState(MISSIONS_MOCK[0].id);
  const [photos,        setPhotos]        = useState<string[]>([]);
  const [sauvegarde,    setSauvegarde]    = useState(false);
  const [checked,       setChecked]       = useState(false);

  const { register, handleSubmit } = useForm<FormMesures>({
    defaultValues: {
      epaisseurIsolation: 8,  typeFenetre: "simple",
      surfaceVitree: 18,       etatClimatiseur: "fonctionnel",
      infiltrationsDetectees: false, observations: "",
    },
  });

  const mission    = MISSIONS_MOCK.find((m) => m.id === missionActive)!;
  const missionCfg = STATUT_CONFIG[mission.statut];

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const onSubmit = (data: FormMesures) => {
    console.log("Mesures sauvegardées:", data);
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 3000);
  };

  const PHOTO_SLOTS = ["Façade principale", "Fenêtres / vitrage", "Équipements CVC"];

  return (
    <>
      <style>{styles}</style>
      <div className="page-wrap">
        <div className="inner">

          {/* ── En-tête ── */}
          <div>
            <div className="pill-live">
              <span className="dot-pulse" />
              Portail Technicien · Saisie terrain
            </div>
            <div className="header-row">
              <div>
                <h1>Mes <span>missions</span> terrain</h1>
                <p>Certification énergétique · Loi 47-09 · Conformité RTCM</p>
              </div>
              <div className="kpi-row">
                {[
                  { val: MISSIONS_MOCK.filter(m => m.statut === "en_cours").length,  label: "En cours",   cls: "kpi-blue" },
                  { val: MISSIONS_MOCK.filter(m => m.statut === "planifiee").length, label: "Planifiées", cls: "kpi-amb"  },
                  { val: MISSIONS_MOCK.filter(m => m.statut === "terminee").length,  label: "Terminées",  cls: "kpi-grn"  },
                ].map(k => (
                  <div key={k.label} className="kpi-chip">
                    <p className={`kpi-val ${k.cls}`}>{k.val}</p>
                    <p className="kpi-lbl">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="main-grid">

            {/* ── Liste missions ── */}
            <div>
              <p className="sec-label">Missions ({MISSIONS_MOCK.length})</p>
              <div className="mis-list">
                {MISSIONS_MOCK.map((m, idx) => {
                  const cfg      = STATUT_CONFIG[m.statut];
                  const isActive = missionActive === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.25 }}
                      className={`mis-btn${isActive ? " mis-btn-active" : ""}`}
                      onClick={() => setMissionActive(m.id)}
                    >
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                        <span className="mis-id">{m.id}</span>
                        <span
                          className="badge-statut"
                          style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
                        >
                          <span className="badge-dot" style={{ background: cfg.dot }} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className={`mis-addr${isActive ? " mis-addr-active" : ""}`}>{m.adresse}</p>
                      <p className="mis-sub">{m.proprietaire} · {m.date}</p>
                      <div className="mis-foot">
                        <div className="avatar" style={{ background: cfg.dot }}>
                          {m.proprietaire[0]}
                        </div>
                        <span style={{ fontSize:10, color: P.muted, opacity:.7 }}>{m.date}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Tags conformité */}
              <div className="tag-list">
                {["Conforme RTCM", "Certifié AMEE", "Loi 47-09"].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>

            {/* ── Colonne droite ── */}
            <div className="right-col">

              {/* Hero bannière */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={missionActive}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.22 }}
                  className="hero-banner"
                >
                  <div className="hero-icon"><IcoPin /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="hero-eyebrow">Mission active</p>
                    <h2 className="hero-title" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {mission.adresse}
                    </h2>
                    <p className="hero-sub">{mission.proprietaire} · {mission.date}</p>
                  </div>
                  <span className="hero-badge">{missionCfg.label}</span>
                </motion.div>
              </AnimatePresence>

              {/* ── Formulaire mesures ── */}
              <div className="card">
                <SectionHeader Icon={IcoRuler} title="Mesures physiques terrain" sub="Valeurs relevées sur site · Conformité RTCM" />
                <form onSubmit={handleSubmit(onSubmit)} className="form-body">

                  {/* Numériques */}
                  <div className="form-grid">
                    <div>
                      <label className="form-lbl">Épaisseur isolation <span className="form-req">*</span></label>
                      <div className="input-wrap">
                        <input type="number" step="0.5" className="field field-unit"
                          {...register("epaisseurIsolation", { valueAsNumber: true })} />
                        <span className="input-unit">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="form-lbl">Surface vitrée <span className="form-req">*</span></label>
                      <div className="input-wrap">
                        <input type="number" step="0.5" className="field field-unit"
                          {...register("surfaceVitree", { valueAsNumber: true })} />
                        <span className="input-unit">m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Selects */}
                  <div className="form-grid">
                    <div>
                      <label className="form-lbl">Type fenêtres <span className="form-req">*</span></label>
                      <select className="field" {...register("typeFenetre")}>
                        <option value="simple">Simple vitrage aluminium</option>
                        <option value="double">Double vitrage PVC</option>
                        <option value="triple">Triple vitrage</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-lbl">État climatiseur <span className="form-req">*</span></label>
                      <select className="field" {...register("etatClimatiseur")}>
                        <option value="fonctionnel">Fonctionnel</option>
                        <option value="vieux">Vieux (+10 ans)</option>
                        <option value="defaillant">Défaillant</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkbox infiltrations */}
                  <label
                    className="checkbox-row"
                    onClick={() => setChecked(v => !v)}
                    style={{ cursor:"pointer" }}
                  >
                    <div className={`checkbox-box${checked ? " checkbox-box-checked" : ""}`}>
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="checkbox-lbl">Infiltrations d'air détectées</p>
                      <p className="checkbox-sub">Cochez si des fuites ont été constatées lors de l'inspection</p>
                    </div>
                  </label>

                  {/* Observations */}
                  <div>
                    <label className="form-lbl">Observations</label>
                    <textarea rows={3} placeholder="Remarques techniques, anomalies constatées…"
                      className="textarea-field"
                      {...register("observations")} />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileHover={{ translateY: -1 }} whileTap={{ scale: 0.98 }}
                    className={`btn-submit${sauvegarde ? " btn-submit-ok" : ""}`}
                  >
                    {sauvegarde
                      ? <><IcoCheck /> Sauvegardé avec succès !</>
                      : <><IcoSave /> Sauvegarder les mesures</>
                    }
                  </motion.button>
                </form>
              </div>

              {/* ── Photos terrain ── */}
              <div className="card">
                <div className="card-header">
                  <div className="card-header-left">
                    <div className="card-icon"><IcoPhoto /></div>
                    <div>
                      <p className="card-title">Photos terrain</p>
                      <p className="card-sub">JPG, PNG · Max 10 MB chacune</p>
                    </div>
                  </div>
                  {photos.length > 0 && (
                    <span className="photo-count-badge">
                      {photos.length} photo{photos.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div style={{ padding:"16px" }}>
                  <label className="upload-zone">
                    <div className="upload-icon"><IcoCamera /></div>
                    <div style={{ textAlign:"center" }}>
                      <p className="upload-title">Cliquez ou glissez des photos ici</p>
                      <p className="upload-hint">Façade, fenêtres, équipements CVC…</p>
                    </div>
                    <input type="file" multiple accept="image/*" style={{ display:"none" }} onChange={handlePhoto} />
                  </label>

                  <div className="photos-grid">
                    {PHOTO_SLOTS.map((label, i) => {
                      const src = photos[i];
                      return src ? (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type:"spring", stiffness:320, damping:24 }}
                          className="photo-real"
                        >
                          <img src={src} alt={label} />
                          <div className="photo-overlay">
                            <button
                              className="photo-delete"
                              onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                            >
                              <IcoTrash />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div key={i} className="photo-slot">
                          <span style={{ color: P.muted }}><IcoCamera /></span>
                          <span className="photo-slot-lbl">{label}</span>
                          <span className="photo-slot-np">Non uploadée</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Géolocalisation ── */}
              <div className="card">
                <SectionHeader Icon={IcoGps} title="Géolocalisation GPS" sub="Position certifiée sur site · Casablanca" />
                <div className="geo-row">
                  <span className="geo-coords">33.5731° N, -7.5898° W · Casablanca</span>
                  <button className="btn-refresh">
                    <IcoRefresh /> Actualiser
                  </button>
                </div>
              </div>

              {/* Tags footer */}
              <div className="tags-footer">
                {["Conforme RTCM", "Certifié AMEE", "Loi 47-09", "Données chiffrées"].map(t => (
                  <span key={t} className="tag-footer">{t}</span>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}