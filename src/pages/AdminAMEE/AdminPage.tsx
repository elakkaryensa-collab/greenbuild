/* eslint-disable */
// src/pages/AdminAMEE/AdminPage.tsx
// GreenBuild — Palette 100% identique à AnalystePage

import { useState, useEffect, useRef, type JSX } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { MOCK_REGIONS }                 from "../../data/normesRTCM";
import type { ClasseEnergetique }       from "../../types/Score";

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

// ── Spectre classes A→G — même que AnalystePage ───────────────
const CLS_CLR: Record<ClasseEnergetique, string> = {
  A: "#1A4A2E",
  B: "#2D6B45",
  C: "#6DB33F",
  D: "#FAC775",
  E: "#EF9F27",
  F: "#F0997B",
  G: "#D85A30",
};

const CLS_TXT: Record<ClasseEnergetique, string> = {
  A: "#FFFFFF",
  B: "#FFFFFF",
  C: "#FFFFFF",
  D: "#1A4A2E",
  E: "#1A4A2E",
  F: "#1A4A2E",
  G: "#FFFFFF",
};

// ── Icônes SVG ────────────────────────────────────────────────
const Ico = {
  Map:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Folder:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Users:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  FileText: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Award:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Percent:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Zap:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Search:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Pin:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Lock:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ChevronR: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

// ── Données ───────────────────────────────────────────────────
const totalDossiers  = MOCK_REGIONS.reduce((s, r) => s + r.nbDossiers,  0);
const totalCertifies = MOCK_REGIONS.reduce((s, r) => s + r.nbCertifies, 0);
const scoreMoyenNat  = Math.round(MOCK_REGIONS.reduce((s, r) => s + r.scoreMoyen, 0) / MOCK_REGIONS.length);

const DOSSIERS_ATTENTE = [
  { id: "DOS-2024-001", proprietaire: "Mohammed Alaoui",  region: "Casablanca-Settat",  classe: "D" as ClasseEnergetique, date: "12 Jan" },
  { id: "DOS-2024-003", proprietaire: "Ahmed Tazi",       region: "Marrakech-Safi",     classe: "E" as ClasseEnergetique, date: "18 Jan" },
  { id: "DOS-2024-007", proprietaire: "Karim Benbrahim",  region: "Fès-Meknès",         classe: "C" as ClasseEnergetique, date: "21 Jan" },
  { id: "DOS-2024-009", proprietaire: "Samira Naciri",    region: "Rabat-Salé-Kénitra", classe: "B" as ClasseEnergetique, date: "23 Jan" },
];

const NOM_VERS_ID: Record<string, string> = {
  "Tanger-Tétouan-Al Hoceïma": "tanger",  "Oriental": "oriental",
  "Fès-Meknès": "fes",                     "Rabat-Salé-Kénitra": "rabat",
  "Béni Mellal-Khénifra": "beni-mellal",   "Casablanca-Settat": "casablanca",
  "Marrakech-Safi": "marrakech",           "Drâa-Tafilalet": "draa",
  "Souss-Massa": "souss",                  "Guelmim-Oued Noun": "guelmim",
  "Laâyoune-Sakia El Hamra": "laayoune",   "Dakhla-Oued Ed-Dahab": "dakhla",
};

// ── Styles ────────────────────────────────────────────────────
const styles = `
  * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .page-wrap { background:${P.bg}; min-height:100vh; }
  .inner { max-width:1200px; margin:0 auto; padding:28px 16px; }

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
  .header-row p { font-size:12px; color:${P.muted}; margin-top:3px; }

  /* ── KPIs ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
  @media(max-width:700px){ .kpi-grid{ grid-template-columns:repeat(2,1fr); } }
  .kpi-card {
    background:${P.card}; border:1px solid ${P.border};
    border-radius:14px; padding:16px 18px;
    display:flex; align-items:center; gap:12px;
    box-shadow:0 1px 4px rgba(26,74,46,.04);
  }
  .kpi-icon {
    width:36px; height:36px; border-radius:10px;
    background:${P.subtle}; border:1px solid ${P.border};
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .kpi-val { font-size:20px; font-weight:900; color:${P.primary}; }
  .kpi-lbl { font-size:11px; color:${P.muted}; font-weight:500; margin-top:1px; }

  /* ── Légende classes ── */
  .legend-bar {
    background:${P.card}; border:1px solid ${P.border};
    border-radius:12px; padding:12px 18px;
    display:flex; align-items:center; gap:14px; flex-wrap:wrap;
    margin-bottom:14px; box-shadow:0 1px 4px rgba(26,74,46,.04);
  }
  .legend-item { display:flex; align-items:center; gap:6px; }
  .legend-chip {
    width:30px; height:30px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:900; flex-shrink:0;
  }
  .legend-lbl { font-size:10px; color:${P.muted}; }

  /* ── Onglets ── */
  .tabs-row {
    display:flex; gap:3px; padding:4px;
    background:${P.subtle}; border:1px solid ${P.border};
    border-radius:12px; width:fit-content; margin-bottom:16px;
    overflow-x:auto;
  }
  .tab-btn {
    display:flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:9px;
    font-size:12px; font-weight:600; border:none; cursor:pointer;
    background:transparent; color:${P.muted};
    transition:background .15s, color .15s; white-space:nowrap;
  }
  .tab-btn-active {
    background:${P.primary} !important; color:#fff !important;
    box-shadow:0 1px 6px rgba(21,128,61,.2);
  }

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

  /* ── Grille carte ── */
  .map-grid { display:grid; grid-template-columns:2fr 1fr; gap:14px; align-items:start; }
  @media(max-width:800px){ .map-grid{ grid-template-columns:1fr; } }

  /* ── Leaflet ── */
  .map-wrap { border-radius:0; overflow:hidden; }
  .map-footer {
    display:flex; align-items:center; gap:12px; flex-wrap:wrap;
    padding:10px 16px; border-top:1px solid ${P.border};
    background:${P.subtle};
  }
  .map-footer-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:${P.muted}; }
  .map-legend-item { display:flex; align-items:center; gap:4px; }
  .map-legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
  .map-legend-txt { font-size:10px; color:${P.muted}; font-weight:500; }
  .map-hint {
    position:absolute; bottom:10px; left:10px;
    background:rgba(255,255,255,.92); border:1px solid ${P.border};
    border-radius:8px; padding:5px 10px;
    font-size:10px; color:${P.muted}; pointer-events:none;
  }

  /* ── Panneau région ── */
  .region-panel-body { padding:18px; }
  .region-class-row { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .region-class-chip {
    width:52px; height:52px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; font-weight:900; flex-shrink:0;
  }
  .region-name { font-size:13px; font-weight:700; color:${P.dark}; line-height:1.3; }
  .region-score-sub { font-size:11px; color:${P.muted}; margin-top:2px; }
  .progress-lbl { display:flex; justify-content:space-between; font-size:10px; color:${P.muted}; margin-bottom:6px; }
  .progress-track { width:100%; height:7px; background:${P.border}; border-radius:100px; overflow:hidden; margin-bottom:16px; }
  .region-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
  .region-stat {
    background:${P.subtle}; border-radius:10px; padding:10px 12px;
  }
  .region-stat-lbl { font-size:10px; color:${P.muted}; margin-bottom:2px; }
  .region-stat-val { font-size:13px; font-weight:700; color:${P.dark}; }
  .btn-back {
    width:100%; padding:8px; border-radius:9px;
    font-size:12px; font-weight:600; cursor:pointer;
    background:${P.subtle}; border:1px solid ${P.border};
    color:${P.muted}; transition:border-color .15s, color .15s; margin-bottom:14px;
  }
  .btn-back:hover { border-color:#b0c4b8; color:${P.dark}; }
  .all-regions-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:${P.muted}; margin-bottom:8px; }
  .region-list { display:flex; flex-direction:column; gap:2px; max-height:200px; overflow-y:auto; }
  .region-list-btn {
    display:flex; align-items:center; justify-content:space-between;
    width:100%; padding:7px 10px; border-radius:9px;
    font-size:12px; text-align:left; cursor:pointer;
    background:transparent; border:1px solid transparent;
    transition:all .15s; color:${P.dark};
  }
  .region-list-btn:hover { background:${P.subtle}; border-color:${P.border}; }
  .region-list-btn-active { background:${P.subtle} !important; border-color:${P.primary} !important; }
  .region-list-btn-name { font-size:11px; color:${P.muted}; truncate:true; flex:1; text-align:left; }
  .region-list-btn-name-active { color:${P.primary}; font-weight:600; }
  .cls-pill {
    font-size:10px; font-weight:900; padding:2px 6px;
    border-radius:6px; flex-shrink:0; margin-left:6px;
  }
  .region-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-right:8px; }

  /* ── Dossiers ── */
  .search-wrap { position:relative; }
  .search-ico  { position:absolute; left:9px; top:50%; transform:translateY(-50%); color:${P.muted}; }
  .search-input {
    padding:6px 10px 6px 28px; font-size:12px;
    background:${P.subtle}; border:1px solid ${P.border};
    border-radius:8px; color:${P.dark}; outline:none;
    transition:border-color .15s, width .2s; width:140px;
  }
  .search-input:focus { border-color:${P.primary}; width:180px; }
  .dos-approved-banner {
    display:flex; align-items:center; gap:8px;
    padding:8px 18px; border-bottom:1px solid #C0DD97;
    background:#EAF3DE;
    font-size:12px; font-weight:600; color:${P.dark};
  }
  .dos-list { display:flex; flex-direction:column; }
  .dos-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 18px;
    border-bottom:1px solid ${P.border};
    transition:background .12s;
  }
  .dos-row:last-child { border-bottom:none; }
  .dos-row:hover { background:${P.subtle}; }
  .dos-left { display:flex; align-items:center; gap:10px; min-width:0; }
  .class-badge {
    font-size:11px; font-weight:900; padding:4px 8px;
    border-radius:7px; flex-shrink:0;
  }
  .dos-name { font-size:13px; font-weight:600; color:${P.dark}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .dos-meta { font-size:11px; color:${P.muted}; margin-top:1px; }
  .dos-actions { display:flex; gap:6px; flex-shrink:0; margin-left:12px; }
  .btn-approve {
    display:flex; align-items:center; gap:5px;
    font-size:11px; font-weight:700; padding:6px 12px; border-radius:8px;
    background:${P.primary}; color:#fff; border:none; cursor:pointer;
    box-shadow:0 2px 8px rgba(21,128,61,.2); transition:background .15s;
  }
  .btn-approve:hover { background:${P.dark}; }
  .btn-approved {
    display:flex; align-items:center; gap:5px;
    font-size:11px; font-weight:700; padding:6px 12px; border-radius:8px;
    background:#EAF3DE; color:${P.dark}; border:1px solid #C0DD97;
  }
  .btn-voir {
    display:flex; align-items:center; gap:5px;
    font-size:11px; font-weight:600; padding:6px 12px; border-radius:8px;
    background:${P.subtle}; color:${P.muted}; border:1px solid ${P.border}; cursor:pointer;
    transition:border-color .15s, color .15s;
  }
  .btn-voir:hover { border-color:#b0c4b8; color:${P.dark}; }
  .empty-state { text-align:center; padding:48px 20px; }
  .empty-icon {
    width:44px; height:44px; border-radius:12px;
    background:${P.subtle}; border:1px solid ${P.border};
    display:flex; align-items:center; justify-content:center;
    color:${P.muted}; margin:0 auto 10px;
  }
  .empty-txt { font-size:13px; color:${P.muted}; }

  /* ── Utilisateurs ── */
  .users-placeholder { text-align:center; padding:56px 20px; }
  .users-icon {
    width:56px; height:56px; border-radius:16px;
    background:${P.subtle}; border:1px solid ${P.border};
    display:flex; align-items:center; justify-content:center;
    color:${P.primary}; margin:0 auto 14px;
  }
  .users-title { font-size:14px; font-weight:700; color:${P.dark}; margin-bottom:6px; }
  .users-sub   { font-size:12px; color:${P.muted}; max-width:320px; margin:0 auto 20px; line-height:1.6; }
  .roles-wrap  { display:flex; flex-wrap:wrap; justify-content:center; gap:6px; }
  .role-tag {
    font-size:11px; font-weight:600; padding:4px 12px; border-radius:100px;
    background:${P.subtle}; color:${P.primary}; border:1px solid ${P.border};
  }

  /* ── Tags footer ── */
  .tags-footer { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
  .tag-footer {
    font-size:11px; font-weight:600; padding:4px 12px; border-radius:100px;
    background:${P.subtle}; color:${P.primary}; border:1px solid ${P.border};
  }

  /* ── Btn Export ── */
  .btn-export {
    display:flex; align-items:center; gap:6px;
    padding:8px 16px; font-size:12px; font-weight:600;
    background:${P.card}; border:1px solid ${P.border};
    color:${P.primary}; border-radius:10px; cursor:pointer;
    box-shadow:0 1px 4px rgba(26,74,46,.04);
    transition:border-color .15s, background .15s;
  }
  .btn-export:hover { border-color:#b0c4b8; background:${P.subtle}; }

  /* ── Modal ── */
  .modal-overlay {
    position:fixed; inset:0; z-index:50;
    display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,.45); padding:16px;
  }
  .modal-box {
    background:${P.card}; border:1px solid ${P.border};
    border-radius:16px; width:100%; max-width:420px;
    overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.15);
  }
  .modal-hero { background:${P.primary}; padding:20px 22px; position:relative; overflow:hidden; }
  .modal-hero-deco { position:absolute; top:0; right:0; width:100px; height:100px; background:rgba(255,255,255,.08); border-radius:50%; transform:translate(30px,-30px); pointer-events:none; }
  .modal-eyebrow { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,.6); margin-bottom:4px; }
  .modal-name    { font-size:15px; font-weight:900; color:#fff; }
  .modal-id      { font-size:11px; font-family:monospace; color:rgba(255,255,255,.6); margin-top:2px; }
  .modal-close   { position:absolute; top:14px; right:16px; background:none; border:none; color:rgba(255,255,255,.7); cursor:pointer; font-size:18px; line-height:1; }
  .modal-close:hover { color:#fff; }
  .modal-body { padding:18px; display:flex; flex-direction:column; gap:12px; }
  .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .modal-stat { background:${P.subtle}; border-radius:10px; padding:10px 12px; }
  .modal-stat-lbl { font-size:10px; color:${P.muted}; margin-bottom:2px; }
  .modal-stat-val { font-size:12px; font-weight:700; color:${P.dark}; }
  .modal-cls-row {
    display:flex; align-items:center; gap:10px; padding:10px 12px;
    border-radius:10px;
  }
  .modal-bat { background:${P.subtle}; border-radius:10px; padding:12px 14px; }
  .modal-bat-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:${P.muted}; margin-bottom:10px; }
  .modal-bat-row { display:flex; justify-content:space-between; align-items:baseline; font-size:12px; padding:5px 0; border-bottom:1px solid ${P.border}; }
  .modal-bat-row:last-child { border-bottom:none; }
  .modal-bat-k { color:${P.muted}; }
  .modal-bat-v { font-weight:600; color:${P.dark}; }
  .modal-actions { display:flex; gap:8px; }
  .modal-btn-approve {
    flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
    padding:11px; border-radius:10px; font-size:13px; font-weight:700;
    background:${P.primary}; color:#fff; border:none; cursor:pointer;
    box-shadow:0 2px 12px rgba(21,128,61,.2); transition:background .15s;
  }
  .modal-btn-approve:hover { background:${P.dark}; }
  .modal-btn-close {
    flex:1; padding:11px; border-radius:10px;
    font-size:13px; font-weight:600; cursor:pointer;
    background:${P.subtle}; border:1px solid ${P.border}; color:${P.muted};
    transition:border-color .15s, color .15s;
  }
  .modal-btn-close:hover { border-color:#b0c4b8; color:${P.dark}; }
`;

// ── Badge classe réutilisable ─────────────────────────────────
function ClasseBadge({ classe, large = false }: { classe: ClasseEnergetique; large?: boolean }) {
  return (
    <span
      className={large ? "region-class-chip" : "class-badge"}
      style={
        large
          ? { width:52, height:52, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, background: CLS_CLR[classe], color: CLS_TXT[classe] }
          : { background: CLS_CLR[classe], color: CLS_TXT[classe] }
      }
    >
      {large ? classe : `Cl. ${classe}`}
    </span>
  );
}

// ── SectionHeader ─────────────────────────────────────────────
function SectionHeader({ Icon, title, sub, action }: {
  Icon: () => JSX.Element; title: string; sub: string; action?: React.ReactNode;
}) {
  return (
    <div className="card-header">
      <div className="card-header-left">
        <div className="card-icon"><Icon /></div>
        <div>
          <p className="card-title">{title}</p>
          <p className="card-sub">{sub}</p>
        </div>
      </div>
      {action && <div style={{ flexShrink:0 }}>{action}</div>}
    </div>
  );
}

// ── Carte Leaflet ─────────────────────────────────────────────
function CarteLeaflet({ regionActive, onRegion }: { regionActive: string | null; onRegion: (id: string) => void }) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const layersRef  = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const linkCSS = document.createElement("link");
    linkCSS.rel = "stylesheet";
    linkCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkCSS);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as any).L;
      const map = L.map(mapRef.current!, { center:[29.0,-7.0], zoom:5, zoomControl:true, attributionControl:false, scrollWheelZoom:false });
      leafletRef.current = map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", { subdomains:"abcd", maxZoom:19 }).addTo(map);
      fetch("https://raw.githubusercontent.com/sigmapix/morocco-regions-geojson/main/morocco_regions.geojson")
        .then(r => r.json())
        .then((geojson: any) => {
          L.geoJSON(geojson, {
            style: (feature: any) => {
              const nom    = feature?.properties?.region_name || feature?.properties?.NAME_1 || "";
              const id     = NOM_VERS_ID[nom] ?? null;
              const region = id ? MOCK_REGIONS.find(r => r.id === id) : null;
              return { fillColor: region ? CLS_CLR[region.classemoyenne] : "#d6d3d1", fillOpacity:0.80, color:"white", weight:2 };
            },
            onEachFeature: (feature: any, layer: any) => {
              const nom    = feature?.properties?.region_name || feature?.properties?.NAME_1 || "";
              const id     = NOM_VERS_ID[nom] ?? null;
              const region = id ? MOCK_REGIONS.find(r => r.id === id) : null;
              if (id) layersRef.current[id] = layer;
              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ fillOpacity:0.95, weight:3 });
                  if (region) layer.bindTooltip(
                    `<div style="font-family:sans-serif;font-size:12px;padding:6px 10px;border-radius:8px">
                      <strong>${nom}</strong><br/>
                      Classe ${region.classemoyenne} · ${region.scoreMoyen}/100<br/>
                      <span style="color:#6b6b5e">${region.nbDossiers} dossiers</span>
                    </div>`,
                    { sticky:true, opacity:0.97 }
                  ).openTooltip();
                },
                mouseout: (e: any) => { e.target.setStyle({ fillOpacity:0.80, weight:2 }); layer.closeTooltip(); },
                click:    () => { if (id) onRegion(id); },
              });
            },
          }).addTo(map);
        })
        .catch(() => {
          MOCK_REGIONS.forEach(r => {
            L.circleMarker([r.lat, r.lng], { radius:14, fillColor:CLS_CLR[r.classemoyenne], fillOpacity:0.85, color:"white", weight:2 })
              .bindTooltip(`<strong>${r.nom}</strong><br/>Classe ${r.classemoyenne}`, { sticky:true })
              .on("click", () => onRegion(r.id)).addTo(map);
          });
        });
    };
    document.head.appendChild(script);
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [onRegion]);

  useEffect(() => {
    Object.entries(layersRef.current).forEach(([id, layer]) => {
      const region = MOCK_REGIONS.find(r => r.id === id);
      layer.setStyle({
        fillOpacity: id === regionActive ? 1 : 0.80,
        weight:      id === regionActive ? 3.5 : 2,
        fillColor:   region ? CLS_CLR[region.classemoyenne] : "#d6d3d1",
      });
    });
  }, [regionActive]);

  return (
    <div style={{ position:"relative" }}>
      <div ref={mapRef} style={{ height:420, width:"100%" }} />
      <div className="map-hint">💡 Cliquez une région pour les détails</div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────
type OngletId = "carte" | "dossiers" | "utilisateurs";
const ONGLETS: { id: OngletId; label: string; Icon: () => JSX.Element }[] = [
  { id: "carte",        label: "Carte nationale", Icon: Ico.Map    },
  { id: "dossiers",     label: "Dossiers",         Icon: Ico.Folder },
  { id: "utilisateurs", label: "Utilisateurs",     Icon: Ico.Users  },
];

// ══════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [regionActive, setRegionActive] = useState<string | null>(null);
  const [onglet,       setOnglet]       = useState<OngletId>("carte");
  const [dossierModal, setDossierModal] = useState<typeof DOSSIERS_ATTENTE[0] | null>(null);
  const [approuves,    setApprouves]    = useState<string[]>([]);
  const [search,       setSearch]       = useState("");

  const regionInfo = regionActive ? MOCK_REGIONS.find(r => r.id === regionActive) : null;

  const exportCSV = () => {
    const csv = ["Région,Classe,Score moyen,Dossiers,Certifiés",
      ...MOCK_REGIONS.map(r => `"${r.nom}",${r.classemoyenne},${r.scoreMoyen},${r.nbDossiers},${r.nbCertifies}`)
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "greenbuild-regions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const KPIS = [
    { label: "Dossiers soumis",      val: totalDossiers,                                       Icon: Ico.FileText, accent: P.primary },
    { label: "Certificats émis",     val: totalCertifies,                                      Icon: Ico.Award,    accent: "#185FA5" },
    { label: "Taux certification",   val: `${Math.round(totalCertifies/totalDossiers*100)}%`,  Icon: Ico.Percent,  accent: P.accent  },
    { label: "Score moyen national", val: `${scoreMoyenNat}/100`,                              Icon: Ico.Zap,      accent: P.warm    },
  ];

  const dossiersFiltres = DOSSIERS_ATTENTE.filter(d =>
    !search ||
    d.proprietaire.toLowerCase().includes(search.toLowerCase()) ||
    d.region.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{styles}</style>
      <div className="page-wrap">
        <div className="inner">

          {/* ── En-tête ── */}
          <div>
            <div className="pill-live">
              <span className="dot-pulse" />
              Portail Admin AMEE · Vue nationale
            </div>
            <div className="header-row">
              <div>
                <h1>Administration <span>AMEE</span></h1>
                <p>Agence Marocaine pour l'Efficacité Énergétique · 12 régions · {new Date().getFullYear()}</p>
              </div>
              <motion.button onClick={exportCSV} whileHover={{ translateY:-1 }} whileTap={{ scale:0.97 }} className="btn-export">
                <Ico.Download /> Export CSV
              </motion.button>
            </div>
          </div>

          {/* ── KPIs ── */}
          <div className="kpi-grid">
            {KPIS.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
                className="kpi-card" style={{ borderTop:`3px solid ${k.accent}` }}>
                <div className="kpi-icon" style={{ color: k.accent }}><k.Icon /></div>
                <div>
                  <p className="kpi-val" style={{ color: k.accent }}>{k.val}</p>
                  <p className="kpi-lbl">{k.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Légende classes ── */}
          <div className="legend-bar">
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.2px", color: P.muted, flexShrink:0 }}>Classes</span>
            {(["A","B","C","D","E","F","G"] as ClasseEnergetique[]).map(cls => (
              <div key={cls} className="legend-item">
                <div className="legend-chip" style={{ background: CLS_CLR[cls], color: CLS_TXT[cls] }}>{cls}</div>
                <span className="legend-lbl">
                  {cls==="A"?"Très perf.":cls==="B"?"Performant":cls==="C"?"Assez perf.":
                   cls==="D"?"Peu perf.":cls==="E"?"Énergivore":cls==="F"?"Très énerg.":"Extr. énerg."}
                </span>
              </div>
            ))}
          </div>

          {/* ── Onglets ── */}
          <div className="tabs-row">
            {ONGLETS.map(o => (
              <button key={o.id} className={`tab-btn${onglet === o.id ? " tab-btn-active" : ""}`}
                onClick={() => setOnglet(o.id)}>
                <o.Icon /> {o.label}
              </button>
            ))}
          </div>

          {/* ── Contenu ── */}
          <AnimatePresence mode="wait">

            {/* CARTE */}
            {onglet === "carte" && (
              <motion.div key="carte" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.18 }}>
                <div className="map-grid">

                  {/* Carte */}
                  <div className="card">
                    <SectionHeader Icon={Ico.Map} title="Carte des 12 régions" sub="Classes énergétiques moyennes · OpenStreetMap" />
                    <div className="map-wrap"><CarteLeaflet regionActive={regionActive} onRegion={setRegionActive} /></div>
                    <div className="map-footer">
                      <span className="map-footer-lbl">Légende</span>
                      {(["A","B","C","D","E","F","G"] as ClasseEnergetique[]).map(cls => (
                        <div key={cls} className="map-legend-item">
                          <div className="map-legend-dot" style={{ background: CLS_CLR[cls] }} />
                          <span className="map-legend-txt">Cl. {cls}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panneau région */}
                  <div className="card">
                    <SectionHeader Icon={Ico.Pin} title="Détail région" sub="Sélectionnez une région sur la carte" />
                    <div className="region-panel-body">
                      <AnimatePresence mode="wait">
                        {regionInfo ? (
                          <motion.div key={regionInfo.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} transition={{ duration:.18 }}>
                            <div className="region-class-row">
                              <ClasseBadge classe={regionInfo.classemoyenne} large />
                              <div>
                                <p className="region-name">{regionInfo.nom}</p>
                                <p className="region-score-sub">Score : <strong style={{ color: P.dark }}>{regionInfo.scoreMoyen}/100</strong></p>
                              </div>
                            </div>
                            <div className="progress-lbl"><span>Performance</span><span>{regionInfo.scoreMoyen}%</span></div>
                            <div className="progress-track">
                              <motion.div
                                initial={{ width:0 }} animate={{ width:`${regionInfo.scoreMoyen}%` }}
                                transition={{ duration:.7, ease:"easeOut" }}
                                style={{ height:"100%", borderRadius:100, background: CLS_CLR[regionInfo.classemoyenne] }}
                              />
                            </div>
                            <div className="region-stats-grid">
                              {[
                                { label:"Dossiers",     val: regionInfo.nbDossiers  },
                                { label:"Certifiés",    val: regionInfo.nbCertifies },
                                { label:"Taux certif.", val: `${Math.round(regionInfo.nbCertifies/regionInfo.nbDossiers*100)}%` },
                                { label:"Classe moy.",  val: regionInfo.classemoyenne },
                              ].map(({ label, val }) => (
                                <div key={label} className="region-stat">
                                  <p className="region-stat-lbl">{label}</p>
                                  <p className="region-stat-val">{val}</p>
                                </div>
                              ))}
                            </div>
                            <button className="btn-back" onClick={() => setRegionActive(null)}>← Toutes les régions</button>
                            <p className="all-regions-title">Toutes les régions</p>
                            <div className="region-list">
                              {MOCK_REGIONS.map(r => (
                                <button key={r.id} onClick={() => setRegionActive(r.id)}
                                  className={`region-list-btn${r.id === regionActive ? " region-list-btn-active" : ""}`}>
                                  <span className="region-dot" style={{ background: CLS_CLR[r.classemoyenne] }} />
                                  <span className={`region-list-btn-name${r.id === regionActive ? " region-list-btn-name-active" : ""}`}>
                                    {r.nom}
                                  </span>
                                  <span className="cls-pill" style={{ background: CLS_CLR[r.classemoyenne], color: CLS_TXT[r.classemoyenne] }}>
                                    {r.classemoyenne}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                            <div style={{ textAlign:"center", marginBottom:16 }}>
                              <div style={{ width:48, height:48, background: P.subtle, border:`1px solid ${P.border}`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", color: P.primary, margin:"0 auto 10px" }}>
                                <Ico.Map />
                              </div>
                              <p style={{ fontSize:13, fontWeight:600, color: P.dark, marginBottom:4 }}>Aucune région sélectionnée</p>
                              <p style={{ fontSize:11, color: P.muted, lineHeight:1.5, marginBottom:14 }}>
                                Cliquez une région sur la carte ou choisissez dans la liste
                              </p>
                            </div>
                            <div className="region-list" style={{ maxHeight:340 }}>
                              {MOCK_REGIONS.map(r => (
                                <button key={r.id} onClick={() => setRegionActive(r.id)} className="region-list-btn">
                                  <span className="region-dot" style={{ background: CLS_CLR[r.classemoyenne] }} />
                                  <span className="region-list-btn-name">{r.nom}</span>
                                  <span className="cls-pill" style={{ background: CLS_CLR[r.classemoyenne], color: CLS_TXT[r.classemoyenne] }}>
                                    {r.classemoyenne}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* DOSSIERS */}
            {onglet === "dossiers" && (
              <motion.div key="dossiers" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.18 }}>
                <div className="card">
                  <SectionHeader
                    Icon={Ico.Folder}
                    title={`Dossiers en attente (${dossiersFiltres.length})`}
                    sub="En attente d'approbation · Transmis par les auditeurs"
                    action={
                      <div className="search-wrap">
                        <span className="search-ico"><Ico.Search /></span>
                        <input type="text" placeholder="Rechercher…" value={search}
                          onChange={e => setSearch(e.target.value)} className="search-input" />
                      </div>
                    }
                  />
                  {approuves.length > 0 && (
                    <div className="dos-approved-banner">
                      <span style={{ color: P.primary }}><Ico.Check /></span>
                      {approuves.length} dossier{approuves.length > 1 ? "s" : ""} approuvé{approuves.length > 1 ? "s" : ""} cette session
                    </div>
                  )}
                  <div className="dos-list">
                    {dossiersFiltres.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon"><Ico.Search /></div>
                        <p className="empty-txt">Aucun dossier trouvé pour « {search} »</p>
                      </div>
                    ) : dossiersFiltres.map((d, i) => (
                      <motion.div key={d.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}
                        className="dos-row">
                        <div className="dos-left">
                          <span className="class-badge" style={{ background: CLS_CLR[d.classe], color: CLS_TXT[d.classe] }}>
                            Cl. {d.classe}
                          </span>
                          <div style={{ minWidth:0 }}>
                            <p className="dos-name">{d.proprietaire}</p>
                            <p className="dos-meta"><span style={{ fontFamily:"monospace" }}>{d.id}</span> · {d.region} · {d.date}</p>
                          </div>
                        </div>
                        <div className="dos-actions">
                          {approuves.includes(d.id) ? (
                            <span className="btn-approved"><Ico.Check /> Approuvé</span>
                          ) : (
                            <motion.button whileHover={{ translateY:-1 }} whileTap={{ scale:.97 }}
                              className="btn-approve" onClick={() => setApprouves(prev => [...prev, d.id])}>
                              <Ico.Check /> Approuver
                            </motion.button>
                          )}
                          <button className="btn-voir" onClick={() => setDossierModal(d)}>
                            <Ico.ChevronR /> Voir
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* UTILISATEURS */}
            {onglet === "utilisateurs" && (
              <motion.div key="utilisateurs" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.18 }}>
                <div className="card">
                  <SectionHeader Icon={Ico.Users} title="Gestion des utilisateurs" sub="Comptes propriétaires, techniciens et auditeurs" />
                  <div className="users-placeholder">
                    <div className="users-icon"><Ico.Lock /></div>
                    <p className="users-title">Module backend requis</p>
                    <p className="users-sub">
                      Ce module sera disponible avec l'authentification. Il permettra de gérer les comptes, attribuer les rôles et suivre l'activité.
                    </p>
                    <div className="roles-wrap">
                      {["Propriétaires","Techniciens","Auditeurs","Admins AMEE","Analystes"].map(r => (
                        <span key={r} className="role-tag">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── Tags footer ── */}
          <div className="tags-footer">
            {["Conforme RTCM","Certifié AMEE","Loi 47-09","12 Régions",`${totalDossiers} dossiers`].map(t => (
              <span key={t} className="tag-footer">{t}</span>
            ))}
          </div>

        </div>
      </div>

      {/* ── Modal dossier ── */}
      <AnimatePresence>
        {dossierModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="modal-overlay" onClick={() => setDossierModal(null)}>
            <motion.div initial={{ scale:.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:.95, y:20 }}
              transition={{ type:"spring", stiffness:300, damping:26 }}
              onClick={e => e.stopPropagation()} className="modal-box">

              {/* Hero */}
              <div className="modal-hero">
                <div className="modal-hero-deco" />
                <div style={{ position:"relative" }}>
                  <div>
                    <p className="modal-eyebrow">Dossier d'audit</p>
                    <p className="modal-name">{dossierModal.proprietaire}</p>
                    <p className="modal-id">{dossierModal.id}</p>
                  </div>
                  <button className="modal-close" onClick={() => setDossierModal(null)}>✕</button>
                </div>
              </div>

              {/* Corps */}
              <div className="modal-body">
                <div className="modal-grid">
                  {[
                    ["Région",          dossierModal.region],
                    ["Classe",          `Classe ${dossierModal.classe}`],
                    ["Date soumission", dossierModal.date],
                    ["Statut",          approuves.includes(dossierModal.id) ? "✅ Approuvé" : "⏳ En attente"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="modal-stat">
                      <p className="modal-stat-lbl">{k}</p>
                      <p className="modal-stat-val">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Aperçu classe */}
                <div className="modal-cls-row" style={{ background: CLS_CLR[dossierModal.classe] + "22" }}>
                  <span className="class-badge" style={{ fontSize:16, padding:"6px 10px", borderRadius:10, background: CLS_CLR[dossierModal.classe], color: CLS_TXT[dossierModal.classe] }}>
                    {dossierModal.classe}
                  </span>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color: P.dark }}>Classe {dossierModal.classe}</p>
                    <p style={{ fontSize:11, color: P.muted }}>Performance énergétique</p>
                  </div>
                </div>

                {/* Données bâtiment */}
                <div className="modal-bat">
                  <p className="modal-bat-title">Données bâtiment</p>
                  {[
                    ["Type bâtiment","Appartement"],
                    ["Surface","120 m²"],
                    ["Isolation","Laine de verre 8 cm"],
                    ["Vitrage","Simple vitrage alu"],
                    ["Zone RTCM","Zone 2 – Semi-aride"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="modal-bat-row">
                      <span className="modal-bat-k">{k}</span>
                      <span className="modal-bat-v">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  {!approuves.includes(dossierModal.id) && (
                    <motion.button whileHover={{ translateY:-1 }} whileTap={{ scale:.97 }}
                      className="modal-btn-approve"
                      onClick={() => { setApprouves(prev => [...prev, dossierModal.id]); setDossierModal(null); }}>
                      <Ico.Check /> Approuver le dossier
                    </motion.button>
                  )}
                  <button className="modal-btn-close" onClick={() => setDossierModal(null)}>Fermer</button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}