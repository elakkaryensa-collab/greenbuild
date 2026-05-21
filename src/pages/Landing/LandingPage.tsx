// src/pages/Landing/LandingPage.tsx
// GreenBuild v3.0 — Landing professionnelle + Footer intégré


import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  IconBuilding,
  IconTool,
  
  IconHome,
  IconCheckbox,
  IconMap,
  IconChartBar,
  IconBuildingBank,
  IconMail,
  IconPhone,
  IconMapPin,
  IconDownload,
  IconFileText,
  IconScale,
  IconRuler,
  IconTemperature,
  IconBulb,
  IconLink,
  IconChevronDown,
  IconChevronUp,
  IconX,
  IconLeaf,
  IconCertificate,
  IconShieldCheck,
  IconDatabase,
} from "@tabler/icons-react";
import imageConforme from '../../image/image.png';
import donneSecurise from '../../image/image copy 11.png';
import suiviNational from '../../image/image copy 2.png';
import rapport from '../../image/image copy 10.png';
import certif from '../../image/image copy 6.png';
import resultat from '../../image/image copy 5.png';
import batiment from '../../image/image copy 7.png';
import equipements from '../../image/image copy 8.png';
import factures from '../../image/image copy 9.png';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

// FIX #1 : type explicite pour éviter "Element not assignable to string"
type WhySlide = {
  image: React.ReactNode | null;
  fallbackBg: string;
  fallbackIcon: React.ReactNode;
  title: string;
  description: string;
};

// ─────────────────────────────────────────────────────────────
// WHY_CAROUSEL_SLIDES
// ─────────────────────────────────────────────────────────────

const WHY_SLIDES: WhySlide[] = [
  {
    // FIX #1 : image est React.ReactNode, on le rend directement (plus de src={slide.image})
    image: (
      <img
        src={imageConforme}
        alt="Conforme RTCM"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ),
    fallbackBg: "#E4F0D8",
    fallbackIcon: (
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L3 6v5c0 4.97 3.43 9.64 8 10.93C16.57 20.64 20 15.97 20 11V6L11 2z" stroke="#043222" strokeWidth="1.4" fill="none"/>
        <path d="M7.5 11l2.5 2.5 4.5-5" stroke="#043222" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Conforme RTCM",
    description: "Calcul officiel selon la réglementation thermique marocaine, reconnu par l'AMEE pour chaque type de bâtiment.",
  },
  {
    image:(
      <img
        src={donneSecurise}
        alt="Conforme RTCM"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ),
    fallbackBg: "#D9EAF7",
    fallbackIcon: (
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="10" width="14" height="9" rx="2" stroke="#185FA5" strokeWidth="1.4" fill="none"/>
        <path d="M7 10V7a4 4 0 018 0v3" stroke="#185FA5" strokeWidth="1.4"/>
        <circle cx="11" cy="15" r="1.5" fill="#185FA5"/>
      </svg>
    ),
    title: "Données sécurisées",
    description: "Factures et données bâtiment chiffrées de bout en bout. Hébergement certifié ISO 27001 sur serveurs marocains.",
  },
  {
    image: (
      <img
        src={resultat}
        alt="Conforme RTCM"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ),
    fallbackBg: "#FAF0DA",
    fallbackIcon: (
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#854F0B" strokeWidth="1.4" fill="none"/>
        <path d="M11 7v4l3 2" stroke="#854F0B" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Résultat immédiat",
    description: "Score A–G calculé en temps réel dès la saisie des premières données, sans attendre la validation complète.",
  },
  {
    //suiviNational
    image: (
      <img
        src={suiviNational}
        alt="Conforme RTCM"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ),
    fallbackBg: "#EBE9FD",
    fallbackIcon: (
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
        <path d="M3 16l5-5 4 3 5-8" stroke="#534AB7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="3" width="18" height="16" rx="2" stroke="#534AB7" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
    title: "Suivi national",
    description: "Tableaux de bord AMEE avec visualisation par région et par type de bâtiment, mis à jour en continu.",
  },
  {
    image: (
      <img
        src={rapport}
        alt="Conforme RTCM"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ),
    fallbackBg: "#FAECEA",
    fallbackIcon: (
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
        <path d="M13 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-6z" stroke="#993C1D" strokeWidth="1.4" fill="none"/>
        <path d="M13 2v6h6M8 13h6M8 10h4" stroke="#993C1D" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Rapport détaillé",
    description: "PDF officiel généré automatiquement avec recommandations personnalisées pour améliorer votre performance.",
  },
  {
    image: (
      <img
        src={certif}
        alt="Conforme RTCM"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ),
    fallbackBg: "#D8F0E8",
    fallbackIcon: (
      <svg width="36" height="36" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#043222" strokeWidth="1.4" fill="none"/>
        <path d="M7.5 11l2.5 2.5 4.5-5" stroke="#043222" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: "Certifié AMEE",
    description: "Certificat reconnu officiellement par l'Agence Marocaine pour l'Efficacité Énergétique sur tout le territoire.",
  },
];

// ─────────────────────────────────────────────────────────────
// COMPOSANT CARROUSEL
// ─────────────────────────────────────────────────────────────

function WhyCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const total = WHY_SLIDES.length;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 2000);
    return () => clearInterval(id);
  }, [paused, total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const idxPrev = (current - 1 + total) % total;
  const idxNext = (current + 1) % total;

  const slides = [
    { idx: idxPrev, pos: "prev"    as const },
    { idx: current, pos: "current" as const },
    { idx: idxNext, pos: "next"    as const },
  ];

  const posStyle = (pos: "prev" | "current" | "next"): React.CSSProperties => {
    if (pos === "current") return { transform: "translateX(0) scale(1)",      opacity: 1,    zIndex: 10, filter: "none"             };
    if (pos === "prev")    return { transform: "translateX(-58%) scale(0.82)", opacity: 0.55, zIndex: 5,  filter: "brightness(0.85)" };
                           return { transform: "translateX(58%) scale(0.82)",  opacity: 0.55, zIndex: 5,  filter: "brightness(0.85)" };
  };

  return (
    <div
      className="select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex items-center justify-center" style={{ height: 380, overflow: "hidden" }}>
        {slides.map(({ idx, pos }) => {
          const slide = WHY_SLIDES[idx];
          return (
            <div
              key={`${pos}-${idx}`}
              className="absolute"
              style={{
                width: "min(340px, 80vw)",
                transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease, filter 0.55s ease",
                ...posStyle(pos),
              }}
              onClick={() => {
                if (pos === "prev") prev();
                if (pos === "next") next();
              }}
            >
              <div
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "white",
                  border: "1.5px solid #d4c9b0",
                  cursor: pos !== "current" ? "pointer" : "default",
                  boxShadow: pos === "current" ? "0 8px 32px 0 rgba(4,50,34,0.10)" : "none",
                }}
              >
                {/* Zone image */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ height: 220, background: slide.image ? "transparent" : slide.fallbackBg, flexShrink: 0 }}
                >
                  {/* FIX #1 : rendu direct du ReactNode, plus de src={slide.image} */}
                  {slide.image ? (
                    slide.image
                  ) : (
                    <div style={{ opacity: 0.6 }}>{slide.fallbackIcon}</div>
                  )}
                </div>

                {/* Texte */}
                <div className="px-5 py-4 flex flex-col gap-1.5" style={{ background: "white" }}>
                  <p className="text-sm font-bold" style={{ color: "#043222" }}>{slide.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b6b5e" }}>{slide.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrôles */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={prev} aria-label="Slide précédent"
          className="w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          <IconChevronDown size={16} stroke={2} style={{ transform: "rotate(90deg)" }} />
        </button>

        <div className="flex gap-2">
          {WHY_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
              style={{
                width: i === current ? 20 : 6, height: 6, borderRadius: 3,
                background: i === current ? "#043222" : "#d4c9b0",
                border: "none", cursor: "pointer", padding: 0,
                transition: "width 0.35s ease, background 0.35s ease",
              }}
            />
          ))}
        </div>

        <button onClick={next} aria-label="Slide suivant"
          className="w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          <IconChevronDown size={16} stroke={2} style={{ transform: "rotate(-90deg)" }} />
        </button>
      </div>

      <p className="text-center text-[11px] text-stone-300 dark:text-stone-600 mt-3">
        {current + 1} / {total}
      </p>
    </div>
  );
}

type UserType = "proprietaire" | "technicien" | "auditeur" | "admin" | "analyste" | "amee";
type AuthMode = "signin" | "signup";
type FooterPage =
  | "users" | "calculateur" | "statistiques"
  | "faq" | "documentation" | "contact"
  | "confidentialite" | "cgu" | "mentions";

// ─────────────────────────────────────────────────────────────
// CONSTANTES LANDING
// ─────────────────────────────────────────────────────────────

const SCORES = [
  { letter: "A", bg: "#16a34a", pct: 95, label: "Très performant",        kwh: "< 50 kWh/m²/an"   },
  { letter: "B", bg: "#4ade80", pct: 80, label: "Performant",             kwh: "51–90 kWh/m²/an"  },
  { letter: "C", bg: "#a3e635", pct: 65, label: "Assez performant",       kwh: "91–150 kWh/m²/an" },
  { letter: "D", bg: "#facc15", pct: 50, label: "Peu performant",         kwh: "151–230 kWh/m²/an"},
  { letter: "E", bg: "#fb923c", pct: 35, label: "Énergivore",             kwh: "231–330 kWh/m²/an"},
  { letter: "F", bg: "#f87171", pct: 20, label: "Très énergivore",        kwh: "331–450 kWh/m²/an"},
  { letter: "G", bg: "#dc2626", pct: 8,  label: "Extrêmement énergivore", kwh: "> 450 kWh/m²/an"  },
] as const;



const ETAPES = [
  {
    num: 1,
    image: batiment,
    title: "Bâtiment",
    desc: "Surface, matériaux, isolation et zone climatique RTCM",
  },
  {
    num: 2,
    image: equipements,
    title: "Équipements",
    desc: "Inventaire complet avec puissance et usage journalier",
  },
  {
    num: 3,
    image: factures,
    title: "Factures ONEE",
    desc: "12 mois de consommation réelle pour le score officiel",
  },
];


const REGIONS = [
  "Tanger-Tétouan-Al Hoceïma", "Oriental", "Fès-Meknès",
  "Rabat-Salé-Kénitra", "Béni Mellal-Khénifra", "Casablanca-Settat",
  "Marrakech-Safi", "Drâa-Tafilalet", "Souss-Massa",
  "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
];

// ─────────────────────────────────────────────────────────────
// CONSTANTES FOOTER
// ─────────────────────────────────────────────────────────────

const CREAM  = "#F0F7F2";   // P.bg  de AnalystePage
const DARK   = "#0a1f14";   // P.dark
const DARK2  = "#27500A";   // c-green 800
const ACCENT = "#2D6B45";   // P.primary

const SCORE_MAP: Record<string, { letter: string; bg: string; color: string }> = {
  "H1-bon-gaz":      { letter: "A", bg: "#C0DD97", color: "#27500A" },
  "H1-bon-elec":     { letter: "B", bg: "#97C459", color: "#27500A" },
  "H1-moyen-gaz":    { letter: "C", bg: "#C0DD97", color: "#3B6D11" },
  "H1-moyen-elec":   { letter: "D", bg: "#FAC775", color: "#633806" },
  "H1-mauvais-gaz":  { letter: "E", bg: "#EF9F27", color: "#412402" },
  "H1-mauvais-elec": { letter: "F", bg: "#F0997B", color: "#712B13" },
  "H2-bon-gaz":      { letter: "B", bg: "#97C459", color: "#27500A" },
  "H2-bon-elec":     { letter: "C", bg: "#C0DD97", color: "#3B6D11" },
  "H2-moyen-gaz":    { letter: "D", bg: "#FAC775", color: "#633806" },
  "H2-moyen-elec":   { letter: "E", bg: "#EF9F27", color: "#412402" },
  "H2-mauvais-gaz":  { letter: "F", bg: "#F0997B", color: "#712B13" },
  "H2-mauvais-elec": { letter: "G", bg: "#D85A30", color: "#fff"    },
};

// ─────────────────────────────────────────────────────────────
// THÈME
// ─────────────────────────────────────────────────────────────

function getInitialDark(): boolean {
  
    const s = localStorage.getItem("greenbuild-theme");
    if (s) return s === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } 
   
  


// ─────────────────────────────────────────────────────────────
// CHAMPS GÉNÉRIQUES
// ─────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all";
const selectCls = inputCls;

function Field({ label, id, type = "text", placeholder, required = true }: {
  label: string; id: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-stone-600 dark:text-stone-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input id={id} type={type} placeholder={placeholder} required={required} className={inputCls} />
    </div>
  );
}

function SelectField({ label, id, options, required = true }: {
  label: string; id: string; options: string[]; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-stone-600 dark:text-stone-400">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select id={id} required={required} className={selectCls}>
        <option value="">Sélectionner…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORMULAIRES D'INSCRIPTION
// ─────────────────────────────────────────────────────────────

function FormProprietaire() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom complet" id="nom" placeholder="Mohammed Alaoui" />
        <Field label="Téléphone" id="tel" type="tel" placeholder="+212 6xx xxx xxx" />
      </div>
      <Field label="Email" id="email" type="email" placeholder="email@exemple.ma" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mot de passe" id="pwd" type="password" placeholder="••••••••" />
        <Field label="Confirmer" id="pwd2" type="password" placeholder="••••••••" />
      </div>
      <SelectField label="Région" id="region" options={REGIONS} />
      <SelectField label="Type de bien" id="type" options={["Appartement","Villa","Local commercial","Bureau","Immeuble"]} />
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" required className="mt-0.5 accent-green-600 w-4 h-4 flex-shrink-0" />
        <span className="text-xs text-stone-400 leading-relaxed">
          J'accepte les <span className="text-green-700 dark:text-green-400 hover:underline cursor-pointer">conditions générales</span> de la plateforme GreenBuild
        </span>
      </label>
    </>
  );
}

function FormTechnicien() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom complet" id="nom" placeholder="Ahmed Tazi" />
        <Field label="Téléphone" id="tel" type="tel" placeholder="+212 6xx xxx xxx" />
      </div>
      <Field label="Email professionnel" id="email" type="email" placeholder="email@exemple.ma" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mot de passe" id="pwd" type="password" placeholder="••••••••" />
        <Field label="Confirmer" id="pwd2" type="password" placeholder="••••••••" />
      </div>
      <Field label="N° certificat technicien" id="cert" placeholder="TEC-2024-XXXX" />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Spécialité" id="spec" options={["Thermique","Électrique","Mixte"]} />
        <SelectField label="Région" id="region" options={REGIONS} />
      </div>
      <Field label="Organisme employeur" id="org" placeholder="Nom de l'entreprise" />
    </>
  );
}

function FormAMEE() {
  const [role, setRole] = useState<"auditeur"|"admin"|"analyste">("auditeur");

  const ROLES: { value: "auditeur"|"admin"|"analyste"; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { value: "auditeur",  label: "Auditeur",    icon: <IconCheckbox size={20} stroke={1.5} />,      color: "#7c3aed", bg: "#f5f3ff" },
    { value: "admin",     label: "Admin AMEE",  icon: <IconBuildingBank size={20} stroke={1.5} />,  color: "#b45309", bg: "#fffbeb" },
    { value: "analyste",  label: "Analyste IA", icon: <IconChartBar size={20} stroke={1.5} />,      color: "#be185d", bg: "#fdf2f8" },
  ];

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Rôle AMEE <span className="text-red-400">*</span></p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button key={r.value} type="button" onClick={() => setRole(r.value)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${role === r.value ? "shadow-sm" : "border-stone-200 dark:border-stone-700"}`}
              style={role === r.value ? { borderColor: r.color, background: r.bg + "33" } : {}}>
              <span style={{ color: role === r.value ? r.color : "#9ca3af" }}>{r.icon}</span>
              <p className="text-[11px] font-semibold" style={{ color: role === r.value ? r.color : undefined }}>{r.label}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom complet" id="nom" placeholder="Prénom Nom" />
        <Field label="Téléphone" id="tel" type="tel" placeholder="+212 6xx xxx xxx" />
      </div>
      <Field label="Email institutionnel" id="email" type="email" placeholder="prenom.nom@amee.ma" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mot de passe" id="pwd" type="password" placeholder="••••••••" />
        <Field label="Confirmer" id="pwd2" type="password" placeholder="••••••••" />
      </div>
      {role === "auditeur" && (
        <>
          <Field label="N° accréditation AMEE" id="accred" placeholder="AUD-AMEE-XXXX" />
          <Field label="Organisme de rattachement" id="org" placeholder="Bureau d'études, cabinet…" />
        </>
      )}
      {role === "admin" && (
        <>
          <Field label="Matricule agent AMEE" id="mat" placeholder="MAT-AMEE-XXXX" />
          <SelectField label="Direction régionale" id="dir" options={REGIONS} />
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-700 dark:text-amber-400">
            ⚠️ Compte réservé aux agents AMEE accrédités. Activation manuelle requise.
          </div>
        </>
      )}
      {role === "analyste" && (
        <>
          <SelectField label="Spécialité" id="spec" options={["Data science & IA","Ingénierie énergétique","Politique publique","Économie de l'énergie"]} />
          <Field label="Institution" id="inst" placeholder="AMEE, université, ministère…" />
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// FORMULAIRE CONNEXION
// ─────────────────────────────────────────────────────────────

function FormConnexion({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

const { login } = useAuth();

  const [userType, setUserType] = useState<"proprietaire"|"technicien"|"auditeur"|"admin"|"analyste">("proprietaire");
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");

  const OPTIONS: { value: "proprietaire"|"technicien"|"auditeur"|"admin"|"analyste"; label: string; icon: React.ReactNode }[] = [
    { value: "proprietaire", label: "Propriétaire", icon: <IconHome size={18} stroke={1.5} /> },
    { value: "technicien",   label: "Technicien",   icon: <IconTool size={18} stroke={1.5} /> },
    { value: "auditeur",     label: "Auditeur",     icon: <IconCheckbox size={18} stroke={1.5} /> },
    { value: "admin",        label: "Admin AMEE",   icon: <IconBuildingBank size={18} stroke={1.5} /> },
    { value: "analyste",     label: "Analyste IA",  icon: <IconChartBar size={18} stroke={1.5} /> },
  ];

  const REDIRECT: Record<string, string> = {
    proprietaire: "/proprietaire", technicien: "/technicien",
    auditeur: "/auditeur", admin: "/admin", analyste: "/analyste",
  };

 const handleLogin = () => {
  login({
    name:  name.trim()  || "Utilisateur",
    email: email.trim() || "user@greenbuild.ma",
    role:  userType,
  });
  onClose();
  navigate(REDIRECT[userType]);
};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-1.5">
        {OPTIONS.map((u) => (
          <button key={u.value} type="button" onClick={() => setUserType(u.value)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${userType === u.value ? "border-green-500 bg-green-50 dark:bg-green-950/40" : "border-stone-200 dark:border-stone-700"}`}>
            <span className={userType === u.value ? "text-green-600" : "text-stone-400"}>{u.icon}</span>
            <span className={`text-[10px] font-semibold leading-tight text-center px-1 ${userType === u.value ? "text-green-700 dark:text-green-400" : "text-stone-500"}`}>{u.label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Nom complet *</label>
        <input type="text" placeholder="Mohammed Alaoui" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Email *</label>
        <input type="email" placeholder="email@exemple.ma" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Mot de passe *</label>
        <input type="password" placeholder="••••••••" className={inputCls} />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
          <input type="checkbox" className="accent-green-600 w-3.5 h-3.5" /> Se souvenir de moi
        </label>
        <button type="button" className="text-xs text-green-700 dark:text-green-400 hover:underline">Mot de passe oublié ?</button>
      </div>
      <button type="button" onClick={handleLogin}
        className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors">
        Se connecter →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL AUTH
// ─────────────────────────────────────────────────────────────

const USER_META: Record<string, { label: string; color: string; desc: string }> = {
  proprietaire: { label: "Propriétaire", color: "#16a34a", desc: "Obtenez votre certificat énergétique officiel" },
  technicien:   { label: "Technicien",   color: "#185FA5", desc: "Saisissez vos relevés terrain certifiés"      },
  amee:         { label: "Espace AMEE",  color: "#7c3aed", desc: "Auditeur · Admin · Analyste"                  },
};

const FORM_MAP: Record<string, React.ReactNode> = {
  proprietaire: <FormProprietaire />,
  technicien:   <FormTechnicien />,
  amee:         <FormAMEE />,
};

function AuthModal({ mode, userType, onClose }: { mode: AuthMode; userType: UserType | null; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const meta = userType ? (USER_META[userType] ?? USER_META["amee"]) : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-stone-100 dark:border-stone-800">
        {/* En-tête modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            {meta && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: meta.color + "18" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
                {mode === "signup" ? `Créer un compte — ${meta?.label ?? ""}` : "Se connecter à GreenBuild"}
              </h2>
              {meta && <p className="text-xs text-stone-400 mt-0.5">{meta.desc}</p>}
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            <IconX size={16} stroke={1.5} />
          </button>
        </div>
        {/* Corps */}
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-3.5">
            {mode === "signin"
              ? <FormConnexion onClose={onClose} />
              : (FORM_MAP[userType ?? ""] ?? <FormAMEE />)
            }
          </div>
          {mode === "signup" && (
            <div className="px-6 pb-5 pt-1">
              <button type="submit"
                className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors">
                Créer mon compte →
              </button>
              <p className="text-xs text-stone-400 text-center mt-3">
                Déjà un compte ?{" "}
                <button type="button" className="text-green-700 dark:text-green-400 font-semibold hover:underline">
                  Se connecter
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// DROPDOWN S'INSCRIRE
// ─────────────────────────────────────────────────────────────

function AuthDropdown({ mode, onOpen }: { mode: AuthMode; onOpen: (mode: AuthMode, userType: UserType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (mode === "signin") {
    return (
      <button onClick={() => onOpen("signin", "proprietaire")}
        className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-green-700 dark:hover:text-green-400 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500">
        Se connecter
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-green-700 hover:bg-green-800 text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500">
        S'inscrire
        {open
          ? <IconChevronUp size={12} stroke={2} />
          : <IconChevronDown size={12} stroke={2} />
        }
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Créer un compte</p>
          </div>
          <div className="p-2 space-y-1">
            {[
              { ut: "proprietaire" as UserType, label: "Propriétaire", sub: "Certifiez votre bien immobilier", icon: <IconHome size={18} stroke={1.5} />,  color: "#16a34a", bg: "#f0fdf4" },
              { ut: "technicien"   as UserType, label: "Technicien",   sub: "Saisir les mesures terrain",      icon: <IconTool size={18} stroke={1.5} />,   color: "#185FA5", bg: "#eff6ff" },
            ].map((item) => (
              <button key={item.ut} onClick={() => { setOpen(false); onOpen("signup", item.ut); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">{item.label}</p>
                  <p className="text-[11px] text-stone-400">{item.sub}</p>
                </div>
              </button>
            ))}
            <div className="px-3 py-1.5">
              <div className="border-t border-stone-100 dark:border-stone-800" />
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2 mb-1">Espace AMEE</p>
            </div>
            <button onClick={() => { setOpen(false); onOpen("signup", "amee"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fdf2f8", color: "#7c3aed" }}>
                <IconBuildingBank size={18} stroke={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">Espace AMEE</p>
                <p className="text-[11px] text-stone-400">Auditeur · Admin · Analyste</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// FOOTER — PANEL MODAL
// ═════════════════════════════════════════════════════════════

function PanelModal({
  title, subtitle, onClose, children,
}: {
  title: string; subtitle: string; onClose: () => void; children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(4,50,34,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden"
        style={{ background: CREAM, border: `1px solid #d4c9b0` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid #d4c9b0` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: DARK }}>
              <IconLeaf size={14} stroke={1.5} color="#C0DD97" />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: DARK }}>{title}</h2>
              <p className="text-xs mt-0.5" style={{ color: "#9c9c8a" }}>{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ color: "#9c9c8a" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#d4c9b0"; e.currentTarget.style.color = DARK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9c9c8a"; }}
          >
            <IconX size={15} stroke={1.5} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Types d'utilisateurs
// ─────────────────────────────────────────────────────────────

const USER_TYPES = [
  {
    icon: <IconHome size={22} stroke={1.5} />,
    name: "Propriétaire", roleLabel: "Accès de base", roleBg: "#E4F0D8", roleColor: "#27500A",
    desc: "Soumet son bien immobilier à la certification, suit l'avancement du dossier et reçoit son certificat A–G officiel.",
    perms: ["Créer dossier", "Upload factures", "Télécharger certificat"], full: false,
  },
  {
    icon: <IconTool size={22} stroke={1.5} />,
    name: "Technicien", roleLabel: "Terrain certifié", roleBg: "#D9EAF7", roleColor: "#185FA5",
    desc: "Technicien accrédité qui effectue les mesures sur site, saisit les données d'équipements et valide les informations techniques.",
    perms: ["Saisie terrain", "Inventaire équipements", "Compléter dossiers"], full: false,
  },
  {
    icon: <IconCheckbox size={22} stroke={1.5} />,
    name: "Auditeur AMEE", roleLabel: "Validation officielle", roleBg: "#FAF0DA", roleColor: "#854F0B",
    desc: "Agent accrédité par l'AMEE qui examine les dossiers, valide les scores et émet les certificats officiels dans un délai de 5 jours ouvrés.",
    perms: ["Examiner dossiers", "Valider score", "Émettre certificat", "Recours"], full: false,
  },
  {
    icon: <IconChartBar size={22} stroke={1.5} />,
    name: "Analyste IA", roleLabel: "Données nationales", roleBg: "#EBE9FD", roleColor: "#534AB7",
    desc: "Spécialiste en data science ou ingénierie énergétique qui analyse les tendances nationales et produit des rapports de pilotage pour l'AMEE.",
    perms: ["Tableaux de bord", "Export données", "Rapports IA"], full: false,
  },
  {
    icon: <IconBuildingBank size={22} stroke={1.5} />,
    name: "Admin AMEE", roleLabel: "Supervision nationale", roleBg: "#FAECEA", roleColor: "#993C1D",
    desc: "Administrateur disposant d'un accès complet à la plateforme. Gère les comptes, configure les règles de certification, supervise les directions régionales et garantit la conformité Loi 47-09.",
    perms: ["Gestion comptes", "Paramétrage RTCM", "Supervision régionale", "Logs & audit trail", "Accès total"], full: true,
  },
];

function PanelUsers() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {USER_TYPES.map((u) => (
        <div
          key={u.name}
          className={`rounded-xl p-4 flex flex-col gap-3 transition-all${u.full ? " col-span-2" : ""}`}
          style={{ background: "white", border: `1.5px solid #d4c9b0` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = ACCENT; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${ACCENT}14`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#d4c9b0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: u.roleBg, color: u.roleColor }}>
              {u.icon}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: DARK }}>{u.name}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block" style={{ background: u.roleBg, color: u.roleColor }}>
                {u.roleLabel}
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#6b6b5e" }}>{u.desc}</p>
          <div className="flex flex-wrap gap-1.5">
            {u.perms.map((p) => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${DARK}0d`, color: DARK }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Calculateur
// ─────────────────────────────────────────────────────────────

function ChoiceGroup({ label, options, value, onChange }: {
  label: string; options: { v: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium" style={{ color: "#6b6b5e" }}>{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{
              borderColor: value === o.v ? DARK : "#d4c9b0",
              background:  value === o.v ? `${DARK}12` : "transparent",
              color:       value === o.v ? DARK : "#9c9c8a",
            }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PanelCalculateur() {
  const [surface, setSurface]     = useState(100);
  const [zone, setZone]           = useState("H1");
  const [isolation, setIsolation] = useState("moyen");
  const [chauffage, setChauffage] = useState("gaz");

  const key   = `${zone}-${isolation}-${chauffage}`;
  const score = SCORE_MAP[key] ?? { letter: "D", bg: "#FAC775", color: "#633806" };
  const coeff = (zone === "H1" ? 85 : 110) * (isolation === "bon" ? 0.7 : isolation === "moyen" ? 1 : 1.4);
  const conso = Math.round(surface * coeff);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs font-medium" style={{ color: "#6b6b5e" }}>Surface habitable</p>
          <span className="text-xs font-bold" style={{ color: ACCENT }}>{surface} m²</span>
        </div>
        <input type="range" min={20} max={1000} step={10} value={surface} onChange={(e) => setSurface(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: DARK }} />
        <div className="flex justify-between text-[10px]" style={{ color: "#9c9c8a" }}>
          <span>20 m²</span><span>1 000 m²</span>
        </div>
      </div>
      <ChoiceGroup label="Zone climatique RTCM" options={[{ v: "H1", label: "Zone H1 – Côtière" }, { v: "H2", label: "Zone H2 – Continentale" }]} value={zone} onChange={setZone} />
      <ChoiceGroup label="Niveau d'isolation" options={[{ v: "bon", label: "Bonne" }, { v: "moyen", label: "Moyenne" }, { v: "mauvais", label: "Faible" }]} value={isolation} onChange={setIsolation} />
      <ChoiceGroup
        label="Énergie principale"
        options={[{ v: "gaz", label: "Gaz" }, { v: "elec", label: "Électricité" }]}
        value={chauffage}
        onChange={setChauffage}
      />
      <div className="rounded-2xl p-5 flex flex-col items-center gap-2 text-center" style={{ background: `${score.bg}22`, border: `2px solid ${score.bg}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9c9c8a" }}>Score estimé</p>
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-extrabold" style={{ background: score.bg, color: score.color }}>
          {score.letter}
        </div>
        <p className="text-sm font-semibold" style={{ color: DARK }}>{conso.toLocaleString("fr-FR")} kWh/an</p>
        <p className="text-[11px]" style={{ color: "#9c9c8a" }}>Soit {Math.round(conso / surface)} kWh/m²/an — estimation indicative, non certifiée AMEE</p>
      </div>
      <div className="rounded-xl p-3.5 text-xs leading-relaxed flex items-start gap-2" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}33`, color: DARK }}>
        <IconBulb size={15} stroke={1.5} className="flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
        Pour un certificat officiel reconnu par l'AMEE, lancez la procédure complète depuis votre espace propriétaire.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Statistiques
// ─────────────────────────────────────────────────────────────

const DISTRIBUTION = [
  { letter: "A", bg: "#C0DD97", color: "#27500A", pct: 8,  count: "1 028" },
  { letter: "B", bg: "#97C459", color: "#27500A", pct: 14, count: "1 799" },
  { letter: "C", bg: "#C0DD97", color: "#3B6D11", pct: 27, count: "3 469" },
  { letter: "D", bg: "#FAC775", color: "#633806", pct: 23, count: "2 955" },
  { letter: "E", bg: "#EF9F27", color: "#412402", pct: 16, count: "2 056" },
  { letter: "F", bg: "#F0997B", color: "#712B13", pct: 8,  count: "1 028" },
  { letter: "G", bg: "#D85A30", color: "#fff",    pct: 4,  count: "514"   },
] as const;

const REGIONS_TOP = [
  { name: "Casablanca-Settat",         count: "3 214", score: "C" },
  { name: "Rabat-Salé-Kénitra",        count: "2 105", score: "B" },
  { name: "Marrakech-Safi",            count: "1 876", score: "C" },
  { name: "Fès-Meknès",               count: "1 543", score: "D" },
  { name: "Tanger-Tétouan-Al Hoceïma", count: "1 102", score: "C" },
] as const;

function PanelStatistiques() {
  const kpis = [
    { label: "Certificats délivrés", value: "12 847", delta: "+18% ce mois", icon: <IconCertificate size={24} stroke={1.5} /> },
    { label: "Dossiers en cours",    value: "3 204",  delta: "+5% ce mois",  icon: <IconFileText size={24} stroke={1.5} />    },
    { label: "Score moyen national", value: "C+",     delta: "Stable",       icon: <IconChartBar size={24} stroke={1.5} />    },
    { label: "Régions couvertes",    value: "12/12",  delta: "Complète",     icon: <IconMap size={24} stroke={1.5} />         },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl p-4 text-center" style={{ background: "white", border: `1px solid #d4c9b0` }}>
            <div className="flex justify-center mb-1" style={{ color: ACCENT }}>{k.icon}</div>
            <p className="text-xl font-bold" style={{ color: DARK }}>{k.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#9c9c8a" }}>{k.label}</p>
            <p className="text-[10px] mt-1 font-semibold" style={{ color: ACCENT }}>{k.delta}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5" style={{ background: "white", border: `1px solid #d4c9b0` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#9c9c8a" }}>Distribution nationale des scores</p>
        <div className="space-y-3">
          {DISTRIBUTION.map((d) => (
            <div key={d.letter} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: d.bg, color: d.color }}>{d.letter}</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#ece7da" }}>
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.bg }} />
              </div>
              <span className="text-[11px] w-8 text-right flex-shrink-0 font-medium" style={{ color: DARK }}>{d.pct}%</span>
              <span className="text-[10px] w-14 text-right flex-shrink-0" style={{ color: "#9c9c8a" }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ background: "white", border: `1px solid #d4c9b0` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#9c9c8a" }}>Top 5 régions — certifications</p>
        <div className="space-y-3">
          {REGIONS_TOP.map((r, i) => (
            <div key={r.name} className="flex items-center gap-3 py-1.5" style={{ borderBottom: i < REGIONS_TOP.length - 1 ? `1px solid #ece7da` : undefined }}>
              <span className="text-xs font-bold w-5 text-center flex-shrink-0" style={{ color: "#9c9c8a" }}>{i + 1}</span>
              <p className="text-xs flex-1" style={{ color: DARK }}>{r.name}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${DARK}10`, color: DARK }}>{r.score}</span>
              <span className="text-[11px]" style={{ color: "#9c9c8a" }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : FAQ
// ─────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Quelle est la durée de validité du certificat ?", a: "Le certificat énergétique GreenBuild est valable 10 ans. En cas de travaux importants (isolation, chauffage…), une nouvelle certification est recommandée." },
  { q: "La certification est-elle obligatoire pour vendre mon bien ?", a: "Oui. Conformément à la Loi 47-09, la certification est obligatoire pour la vente ou la location de tout bien immobilier depuis le 1er janvier 2025." },
  { q: "Qui peut réaliser l'audit technique ?", a: "L'audit doit être réalisé par un technicien certifié et accrédité par l'AMEE. Vous pouvez en trouver un depuis votre espace propriétaire ou en contactant l'AMEE directement." },
  { q: "Quels systèmes de chauffage sont pris en compte ?", a: "Tous les systèmes : gaz naturel, propane, électrique (pompe à chaleur, résistance), fioul, biomasse, solaire thermique et systèmes hybrides." },
  { q: "Mon score peut-il être contesté ?", a: "Oui. Un recours est possible auprès de l'AMEE dans les 30 jours suivant la délivrance du certificat. Une contre-expertise sera alors diligentée." },
  { q: "Les données de ma facture sont-elles sécurisées ?", a: "Oui. Toutes vos données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Nos serveurs sont hébergés au Maroc, certifiés ISO 27001." },
  { q: "Puis-je certifier plusieurs biens avec un seul compte ?", a: "Absolument. Un compte propriétaire vous permet de gérer plusieurs biens simultanément, chacun avec son propre dossier et certificat." },
] as const;

function PanelFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid #d4c9b0` }}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
            style={{ background: open === i ? `${DARK}08` : "white" }}>
            <p className="text-xs font-medium pr-3" style={{ color: DARK }}>{faq.q}</p>
            {open === i
              ? <IconChevronUp size={15} stroke={1.5} style={{ color: "#9c9c8a", flexShrink: 0 }} />
              : <IconChevronDown size={15} stroke={1.5} style={{ color: "#9c9c8a", flexShrink: 0 }} />
            }
          </button>
          {open === i && (
            <div className="px-4 pb-4 pt-1" style={{ background: "white" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#6b6b5e" }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
      <div className="rounded-xl p-4 text-center mt-4" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}>
        <p className="text-xs font-semibold mb-1" style={{ color: DARK }}>Vous ne trouvez pas votre réponse ?</p>
        <p className="text-[11px]" style={{ color: "#6b6b5e" }}>Contactez notre équipe support — réponse sous 24h</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Documentation
// ─────────────────────────────────────────────────────────────

const DOC_SECTIONS = [
  {
    section: "Démarrage rapide",
    items: [
      { icon: <IconHome size={20} stroke={1.5} />,        title: "Guide du propriétaire",    desc: "De l'inscription à la réception du certificat",        badge: "PDF · 2.4 Mo" },
      { icon: <IconTool size={20} stroke={1.5} />,         title: "Guide du technicien",      desc: "Procédures de mesure et saisie terrain RTCM",          badge: "PDF · 3.1 Mo" },
      { icon: <IconCheckbox size={20} stroke={1.5} />,     title: "Manuel auditeur AMEE",     desc: "Critères de validation et processus de contrôle",      badge: "PDF · 1.8 Mo" },
    ],
  },
  {
    section: "Réglementation",
    items: [
      { icon: <IconScale size={20} stroke={1.5} />,        title: "Loi 47-09",               desc: "Texte intégral de la loi sur l'efficacité énergétique", badge: "PDF · 0.9 Mo" },
      { icon: <IconBuilding size={20} stroke={1.5} />,     title: "RTCM",                    desc: "Réglementation thermique du bâtiment au Maroc",         badge: "PDF · 5.2 Mo" },
      { icon: <IconFileText size={20} stroke={1.5} />,     title: "Arrêté ministériel 2024", desc: "Modalités d'application et barèmes de notation",        badge: "PDF · 0.6 Mo" },
    ],
  },
  {
    section: "Références techniques",
    items: [
      { icon: <IconRuler size={20} stroke={1.5} />,        title: "Méthode de calcul DPE",   desc: "Algorithme officiel de calcul du score A–G",            badge: "PDF · 4.0 Mo" },
      { icon: <IconTemperature size={20} stroke={1.5} />,  title: "Zones climatiques RTCM",  desc: "Cartographie et coefficients par région",               badge: "PDF · 1.2 Mo" },
      { icon: <IconDatabase size={20} stroke={1.5} />,     title: "Référentiel équipements", desc: "Catalogue des systèmes et coefficients de performance",  badge: "Excel · 0.8 Mo" },
    ],
  },
];

function PanelDocumentation() {
  return (
    <div className="space-y-6">
      {DOC_SECTIONS.map((sec) => (
        <div key={sec.section}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#9c9c8a" }}>{sec.section}</p>
          <div className="space-y-2">
            {sec.items.map((item) => (
              <div key={item.title} className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{ background: "white", border: `1px solid #d4c9b0` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${ACCENT}88`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#d4c9b0"; }}>
                <span className="flex-shrink-0" style={{ color: ACCENT }}>{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: DARK }}>{item.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#9c9c8a" }}>{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${DARK}0d`, color: "#6b6b5e" }}>{item.badge}</span>
                  <IconDownload size={14} stroke={1.5} style={{ color: "#9c9c8a" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-xl p-4" style={{ background: DARK }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${CREAM}18` }}>
            <IconLink size={20} stroke={1.5} color={CREAM} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: CREAM }}>API GreenBuild</p>
            <p className="text-[11px] mt-0.5" style={{ color: `${CREAM}80` }}>Intégrez la certification via notre API REST — documentation Swagger disponible</p>
          </div>
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-80" style={{ background: `${CREAM}18`, color: CREAM }}>
            Accès API →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Contact
// ─────────────────────────────────────────────────────────────

function PanelContact() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-xl p-10 text-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}>
        <div className="flex justify-center mb-3" style={{ color: ACCENT }}>
          <IconCheckbox size={48} stroke={1.5} />
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: DARK }}>Message envoyé !</p>
        <p className="text-xs" style={{ color: "#6b6b5e" }}>Notre équipe vous répondra sous 24 heures ouvrées.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    background: CREAM, border: `1px solid #d4c9b0`, borderRadius: 8,
    padding: "7px 10px", fontSize: 12, color: DARK, outline: "none",
    width: "100%", fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: "#6b6b5e", fontWeight: 500, display: "block", marginBottom: 4 };

  const contacts = [
    { icon: <IconMail size={20} stroke={1.5} />,    label: "Email",     value: "contact@greenbuild.ma", note: "Réponse <24h"     },
    { icon: <IconPhone size={20} stroke={1.5} />,   label: "Téléphone", value: "+212 5 37 XX XX XX",    note: "Lun–Ven 9h–17h"   },
    { icon: <IconMapPin size={20} stroke={1.5} />,  label: "Adresse",   value: "Av. Mohammed V, Rabat", note: "Sur rendez-vous"  },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        {contacts.map((c) => (
          <div key={c.label} className="rounded-xl p-3 text-center" style={{ background: "white", border: `1px solid #d4c9b0` }}>
            <div className="flex justify-center mb-1" style={{ color: ACCENT }}>{c.icon}</div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#9c9c8a" }}>{c.label}</p>
            <p className="text-[11px] font-medium leading-tight" style={{ color: DARK }}>{c.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#9c9c8a" }}>{c.note}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5 space-y-3.5" style={{ background: "white", border: `1px solid #d4c9b0` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9c9c8a" }}>Formulaire de contact</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label style={labelStyle}>Nom complet *</label><input type="text" placeholder="Mohammed Alaoui" style={inputStyle} /></div>
          <div><label style={labelStyle}>Email *</label><input type="email" placeholder="email@exemple.ma" style={inputStyle} /></div>
        </div>
        <div>
          <label style={labelStyle}>Sujet *</label>
          <select style={inputStyle}>
            <option>Question sur la certification</option>
            <option>Problème technique</option>
            <option>Réclamation</option>
            <option>Partenariat</option>
            <option>Autre</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Message *</label>
          <textarea rows={4} placeholder="Décrivez votre demande en détail…" style={{ ...inputStyle, resize: "none" }} />
        </div>
        <button type="button" onClick={() => setSent(true)}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
          style={{ background: DARK, color: CREAM }}>
          Envoyer le message →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Confidentialité
// ─────────────────────────────────────────────────────────────

function PanelConfidentialite() {
  const sections = [
    { title: "1. Responsable du traitement", content: "GreenBuild, opéré sous l'égide de l'AMEE, est responsable du traitement de vos données personnelles. Contact délégué à la protection des données : dpo@greenbuild.ma." },
    { title: "2. Données collectées",        content: "Nous collectons : (a) données d'identité (nom, CIN), (b) données de contact (email, téléphone), (c) données du bâtiment (surface, adresse, équipements), (d) données de consommation (factures ONEE), (e) données de connexion (IP, logs)." },
    { title: "3. Finalités du traitement",   content: "Vos données sont utilisées pour délivrer le certificat officiel, assurer la validation AMEE, produire des statistiques nationales anonymisées conformes à la Loi 47-09, et améliorer nos services." },
    { title: "4. Sécurité des données",      content: "Chiffrement TLS 1.3 en transit et AES-256 au repos. Serveurs hébergés au Maroc dans des centres certifiés ISO 27001. Accès strictement contrôlé par rôles (RBAC)." },
    { title: "5. Durée de conservation",     content: "Données du certificat conservées 10 ans. Logs de connexion supprimés après 12 mois. Suppression anticipée possible sur demande, sauf obligation légale." },
    { title: "6. Vos droits",                content: "Conformément à la loi 09-08, vous disposez des droits d'accès, rectification, opposition et suppression. Exercez-les via : dpo@greenbuild.ma." },
  ];
  return (
    <div className="space-y-3">
      {sections.map((s) => (
        <div key={s.title} className="rounded-xl p-4" style={{ background: "white", border: `1px solid #d4c9b0` }}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: DARK }}>{s.title}</p>
          <p className="text-xs leading-relaxed" style={{ color: "#6b6b5e" }}>{s.content}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : CGU
// ─────────────────────────────────────────────────────────────

function PanelCGU() {
  const articles = [
    { num: "Art. 1", title: "Objet",             content: "Les présentes CGU définissent les conditions d'accès et d'utilisation de la plateforme GreenBuild, service national de certification énergétique conforme à la Loi 47-09 et aux dispositions de l'AMEE." },
    { num: "Art. 2", title: "Accès au service",  content: "L'accès à GreenBuild est réservé aux personnes majeures. Chaque utilisateur est responsable de la confidentialité de ses identifiants. Tout accès non autorisé doit être signalé immédiatement." },
    { num: "Art. 3", title: "Obligations",       content: "L'utilisateur s'engage à fournir des informations exactes et à jour, à ne pas utiliser le service à des fins frauduleuses, et à respecter les droits de propriété intellectuelle de GreenBuild." },
    { num: "Art. 4", title: "Valeur juridique",  content: "Le certificat GreenBuild est un document officiel reconnu par l'AMEE et valide au sens de la Loi 47-09. Toute falsification constitue une infraction pénale." },
    { num: "Art. 5", title: "Responsabilité",    content: "GreenBuild décline toute responsabilité pour des interruptions dues à des maintenances, des cas de force majeure, ou des attaques informatiques malgré les mesures de sécurité mises en place." },
    { num: "Art. 6", title: "Droit applicable",  content: "Les présentes CGU sont régies par le droit marocain. Tout litige relatif à leur interprétation relève de la compétence exclusive des tribunaux de Rabat." },
  ];
  return (
    <div className="space-y-3">
      {articles.map((a) => (
        <div key={a.num} className="rounded-xl p-4" style={{ background: "white", border: `1px solid #d4c9b0` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${DARK}10`, color: DARK }}>{a.num}</span>
            <p className="text-xs font-semibold" style={{ color: DARK }}>{a.title}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#6b6b5e" }}>{a.content}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PANEL : Mentions légales
// ─────────────────────────────────────────────────────────────

function PanelMentions() {
  const infos = [
    { label: "Raison sociale",           value: "GreenBuild – Plateforme nationale de certification énergétique" },
    { label: "Opérateur",                value: "Agence Marocaine pour l'Efficacité Énergétique (AMEE)" },
    { label: "Siège social",             value: "Angle Rues Al Araar & Al Jabha Al Watania, Hay Ryad, Rabat" },
    { label: "RC",                       value: "AMEE — Établissement public sous tutelle du MTEDD" },
    { label: "Directeur de publication", value: "Directeur Général de l'AMEE" },
    { label: "Hébergeur",                value: "Datacenter Maroc Telecom (Casablanca) — certifié ISO 27001" },
    { label: "Contact",                  value: "contact@greenbuild.ma · +212 5 37 XX XX XX" },
    { label: "Version plateforme",       value: "GreenBuild v3.0 — © 2025 Royaume du Maroc" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid #d4c9b0` }}>
        {infos.map((info, i) => (
          <div key={info.label} className="flex flex-col sm:flex-row sm:items-start px-4 py-3.5 gap-1"
            style={{ background: i % 2 === 0 ? "white" : "#f9f6f0", borderBottom: i < infos.length - 1 ? `1px solid #d4c9b0` : undefined }}>
            <p className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: "#9c9c8a", width: 140, paddingTop: 1 }}>{info.label}</p>
            <p className="text-xs" style={{ color: DARK }}>{info.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ background: "white", border: `1px solid #d4c9b0` }}>
        <div className="flex items-center gap-2 mb-1.5">
          <IconShieldCheck size={16} stroke={1.5} style={{ color: ACCENT }} />
          <p className="text-xs font-semibold" style={{ color: DARK }}>Propriété intellectuelle</p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#6b6b5e" }}>
          L'ensemble des éléments de la plateforme GreenBuild (textes, logos, algorithmes, interfaces) est protégé par les lois marocaines sur la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation expresse de l'AMEE.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONFIG PANELS FOOTER
// ─────────────────────────────────────────────────────────────

const PANEL_CONFIG: Record<FooterPage, { title: string; subtitle: string; component: React.ReactNode }> = {
  users:           { title: "Types d'utilisateurs",               subtitle: "Rôles et accès sur la plateforme GreenBuild",              component: <PanelUsers /> },
  calculateur:     { title: "Calculateur indicatif",              subtitle: "Estimez votre score avant la certification officielle",     component: <PanelCalculateur /> },
  statistiques:    { title: "Statistiques nationales",            subtitle: "Tableau de bord AMEE — données mises à jour en temps réel", component: <PanelStatistiques /> },
  faq:             { title: "Foire aux questions",                subtitle: "Réponses aux questions les plus fréquentes",               component: <PanelFAQ /> },
  documentation:   { title: "Documentation",                      subtitle: "Guides, réglementations et ressources techniques",          component: <PanelDocumentation /> },
  contact:         { title: "Contact",                            subtitle: "Notre équipe vous répond sous 24 heures ouvrées",           component: <PanelContact /> },
  confidentialite: { title: "Politique de confidentialité",       subtitle: "Dernière mise à jour : 1er janvier 2025",                   component: <PanelConfidentialite /> },
  cgu:             { title: "Conditions Générales d'Utilisation", subtitle: "Version en vigueur depuis le 1er janvier 2025",            component: <PanelCGU /> },
  mentions:        { title: "Mentions légales",                   subtitle: "Informations légales relatives à la plateforme GreenBuild", component: <PanelMentions /> },
};

// ─────────────────────────────────────────────────────────────
// FOOTER SECTION
// ─────────────────────────────────────────────────────────────

function FooterLink({ label, page, onOpen }: { label: string; page: FooterPage; onOpen: (p: FooterPage) => void }) {
  return (
    <button onClick={() => onOpen(page)}
      className="text-xs text-left transition-all hover:underline hover:opacity-100"
      style={{ color: `${CREAM}80`, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
      {label}
    </button>
  );
}

function FooterSection() {
  const [activePage, setActivePage] = useState<FooterPage | null>(null);
  const panel = activePage ? PANEL_CONFIG[activePage] : null;

  return (
    <>
      {panel && (
        <PanelModal title={panel.title} subtitle={panel.subtitle} onClose={() => setActivePage(null)}>
          {panel.component}
        </PanelModal>
      )}

      <footer style={{ background: DARK, borderTop: `1px solid ${DARK2}` }}>
        <div className="max-w-3xl mx-auto px-5 py-10">
          <div className="flex items-start justify-between flex-wrap gap-8 mb-10">
           {/* Brand */}
{/* Brand */}
<div className="flex flex-col gap-2">
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm shadow-sm">
      🌿
    </div>
    <span className="text-xl font-bold tracking-tight" style={{ color: CREAM }}>
      Green<span className="text-green-400">Build</span>
    </span>
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-md" style={{ background: `${CREAM}15`, color: `${CREAM}60` }}>
      v3.0
    </span>
  </div>
  <p className="text-xs max-w-xs leading-relaxed" style={{ color: `${CREAM}70` }}>
    Plateforme nationale de certification énergétique des bâtiments.
    Conforme Loi 47-09 · AMEE · RTCM.
  </p>
</div>

            {/* Colonnes de liens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-6">
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${CREAM}55` }}>Plateforme</p>
                <FooterLink label="Types d'utilisateurs" page="users"        onOpen={setActivePage} />
                <FooterLink label="Calculateur"           page="calculateur" onOpen={setActivePage} />
                <FooterLink label="Statistiques"          page="statistiques" onOpen={setActivePage} />
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${CREAM}55` }}>Informations</p>
                <FooterLink label="FAQ"           page="faq"           onOpen={setActivePage} />
                <FooterLink label="Documentation" page="documentation" onOpen={setActivePage} />
                <FooterLink label="Contact"       page="contact"       onOpen={setActivePage} />
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${CREAM}55` }}>Légal</p>
                <FooterLink label="Politique de confidentialité" page="confidentialite" onOpen={setActivePage} />
                <FooterLink label="CGU"                          page="cgu"             onOpen={setActivePage} />
                <FooterLink label="Mentions légales"             page="mentions"        onOpen={setActivePage} />
              </div>
            </div>
          </div>

          {/* Bas du footer */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-6" style={{ borderTop: `1px solid ${CREAM}15` }}>
            <p className="text-[11px]" style={{ color: `${CREAM}50` }}>© 2025 GreenBuild · Royaume du Maroc</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: `${CREAM}15`, color: `${CREAM}70` }}>AMEE certifié</span>
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: `${CREAM}15`, color: `${CREAM}70` }}>Loi 47-09</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// PAGE PRINCIPALE — EXPORT DEFAULT
// ═════════════════════════════════════════════════════════════

export default function LandingPage() {
  const [scrolled,  setScrolled]  = useState(false);
  const [darkMode,  setDarkMode]  = useState(getInitialDark);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [authState, setAuthState] = useState<{ open: boolean; mode: AuthMode; userType: UserType | null }>
    ({ open: false, mode: "signup", userType: null });

  const howRef = useRef<HTMLDivElement>(null);

  const openAuth  = (mode: AuthMode, userType: UserType) => setAuthState({ open: true, mode, userType });
  const closeAuth = () => setAuthState((s) => ({ ...s, open: false }));

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // FIX #2 & #3 : catch nommé + useCallback sans dépendance sur darkMode
  // (on lit classList directement, pas l'état React)
  const toggleDark = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
   
      localStorage.setItem("greenbuild-theme", next ? "dark" : "light");
   
    setDarkMode(next);
  }, []); //  pas de dépendance sur darkMode : on lit classList, pas l'état


  // Supprime l'avertissement "darkMode is declared but never read"
  void darkMode;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">

      {authState.open && (
        <AuthModal mode={authState.mode} userType={authState.userType} onClose={closeAuth} />
      )}

      {/* ── NAVBAR ── */}
      <nav className={[
        "sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md",
        "border-b border-stone-100 dark:border-stone-800 transition-shadow duration-200",
        scrolled ? "shadow-sm" : "",
      ].join(" ")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
  to="/"
  className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg p-1"
  aria-label="GreenBuild — Accueil"
>
  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm group-hover:bg-green-700 transition-colors shadow-sm">
    🌿
  </div>
  <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
    Green<span className="text-green-600">Build</span>
  </span>
  <span className="hidden sm:block text-xs text-stone-400 dark:text-stone-600 font-medium bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-md">
    v3.0
  </span>
</Link>
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={toggleDark} className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" aria-label="Basculer thème">
                <span>{document.documentElement.classList.contains("dark") ? "☀️" : "🌙"}</span>
              </button>
              <AuthDropdown mode="signin" onOpen={openAuth} />
              <AuthDropdown mode="signup" onOpen={openAuth} />
            </div>
            {/* Mobile burger */}
            <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-current rounded-full transition-all ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block h-0.5 bg-current rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 bg-current rounded-full transition-all ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-200 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 ${menuOpen ? "max-h-screen" : "max-h-0"}`}>
          <div className="px-4 py-4 flex flex-col gap-2">
            <AuthDropdown mode="signin" onOpen={(m, u) => { setMenuOpen(false); openAuth(m, u); }} />
            <AuthDropdown mode="signup" onOpen={(m, u) => { setMenuOpen(false); openAuth(m, u); }} />
            <button onClick={toggleDark} className="p-2 text-stone-400 self-start">
              {document.documentElement.classList.contains("dark") ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── HERO ── */}
        {/* ── HERO ── */}
<section className="relative overflow-hidden">
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl" />
  </div>
  <div className="relative max-w-4xl mx-auto px-5 pt-20 pb-16 text-center">

    {/* Badge */}
    <div className="inline-flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full px-4 py-1.5 mb-8 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Plateforme nationale · Loi 47-09 · Certifié AMEE
    </div>

    {/* Titre */}
    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-white leading-tight mb-6">
      Certifiez votre bâtiment<br />
      <span className="text-green-600 dark:text-green-400">éco-énergétique</span>
    </h1>

    <p className="text-base text-stone-400 dark:text-stone-500 max-w-lg mx-auto mb-10 leading-relaxed">
      Obtenez votre score A–G officiel en 3 étapes. Pipeline intelligent de 11 phases conforme à la réglementation thermique marocaine RTCM.
    </p>

    {/* CTA */}
    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
      <button
        onClick={() => openAuth("signup", "proprietaire")}
        className="px-7 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-700/20 hover:shadow-green-700/30 hover:-translate-y-0.5 active:translate-y-0"
      >
        Démarrer la certification →
      </button>

      {/* ✅ CORRIGÉ — scroll vers la section étapes */}
      <button
        onClick={() => howRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="px-7 py-3 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-semibold border border-stone-200 dark:border-stone-700 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        En savoir plus ↓
      </button>
    </div>

    {/* Score A-G preview */}
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
        Échelle de performance énergétique officielle
      </p>
      <div className="space-y-2.5">
        {SCORES.map((s) => (
          <div key={s.letter} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: s.bg }}>
              {s.letter}
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${s.pct}%`, background: s.bg }} />
            </div>
            <span className="text-[11px] text-stone-400 w-32 text-left hidden sm:block flex-shrink-0">
              {s.label}
            </span>
            <span className="text-[10px] font-mono text-stone-300 dark:text-stone-600 w-28 text-right hidden md:block flex-shrink-0">
              {s.kwh}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      <div ref={howRef} className="scroll-mt-20 max-w-4xl mx-auto px-5 pt-16 pb-8">
  <div className="text-center mb-10">
    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Processus</p>
    <h2 className="text-2xl font-black text-stone-900 dark:text-white">Votre certification en 3 étapes</h2>
    <p className="text-sm text-stone-400 mt-2">Un processus guidé, simple et conforme à la réglementation RTCM</p>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-mt-20">
  {ETAPES.map((e, i) => (
    <div
      key={e.num}
      className="relative bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden"
    >
      {/* Flèche entre les cartes */}
      {i < ETAPES.length - 1 && (
        <div className="hidden md:block absolute top-1/2 -right-3 z-10 text-stone-300 dark:text-stone-600 text-xl">
          →
        </div>
      )}

      {/* Image avec overlay texte */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={e.image}
          alt={e.title}
          className="w-full h-full object-cover"
        />

        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Texte au-dessus de l’image */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
          {/* Numéro */}
          <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold">
            {e.num}
          </div>

          {/* Description */}
          <div>
            <p className="text-lg font-bold mb-2">
              {e.title}
            </p>

            <p className="text-sm leading-relaxed text-stone-100">
              {e.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
       

        {/* ── POURQUOI GREENBUILD ── */}
        <section className="border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="max-w-4xl mx-auto px-5 py-16">
            <div className="text-center mb-10">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Avantages</p>
              <h2 className="text-2xl font-black text-stone-900 dark:text-white">Pourquoi GreenBuild</h2>
              <p className="text-sm text-stone-400 mt-2">Une plateforme pensée pour chaque acteur de la certification</p>
            </div>
            <WhyCarousel />
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="max-w-4xl mx-auto px-5 py-16">
          <div className="bg-green-800 rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-3">Certifié AMEE · Loi 47-09</p>
              <h2 className="text-2xl font-black text-white mb-3">Prêt à certifier votre bâtiment ?</h2>
              <p className="text-green-200 text-sm mb-8 max-w-md mx-auto">
                Rejoignez la plateforme nationale de certification énergétique et obtenez votre score A–G officiel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => openAuth("signup", "proprietaire")}
                  className="px-7 py-3 bg-white hover:bg-green-50 text-green-800 text-sm font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
                  Démarrer gratuitement →
                </button>
                <button onClick={() => openAuth("signin", "proprietaire")}
                  className="px-7 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 rounded-xl transition-all hover:-translate-y-0.5">
                  J'ai déjà un compte
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER INTÉGRÉ ── */}
      <FooterSection />

    </div>
  );
}