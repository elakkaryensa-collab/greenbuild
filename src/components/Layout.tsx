/* eslint-disable react-hooks/static-components */
// src/components/Layout.tsx
// GreenBuild — Sidebar + Topbar with full user dropdown & modals

import {
  useState, useEffect, useRef, startTransition,
} from "react"
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { UserRole } from "../context/AuthContext"

// ── Theme init (before React) ─────────────────────────────────────────────────
if (typeof window !== "undefined") {
  try {
    const stored      = localStorage.getItem("greenbuild-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", stored ? stored === "dark" : prefersDark)
  } catch { /* ignored */ }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  desc: string
  end?: boolean
}

type ModalType = "profile" | "settings" | "notifications" | "password" | "support" | null

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  Home:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  Clipboard:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/></svg>,
  Folder:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Settings:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Wrench:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/></svg>,
  MapPin:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Ruler:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 8.7 8.7 21.3a2.41 2.41 0 0 1-3.4 0L2.7 18.7a2.41 2.41 0 0 1 0-3.4L15.3 2.7a2.41 2.41 0 0 1 3.4 0l2.6 2.6a2.41 2.41 0 0 1 0 3.4z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/></svg>,
  Check:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Files:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"/><polyline points="15 2 15 7 20 7"/><path d="M10 18v3H3.6c-.4 0-.8-.2-1.1-.5-.3-.3-.5-.7-.5-1.1V7.6c0-.4.2-.8.5-1.1.3-.3.7-.5 1.1-.5H6"/></svg>,
  Map:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  Users:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  BarChart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  TrendDown:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Robot:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/><path d="M9 15h6"/></svg>,
  Report:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Sun:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  User:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Logout:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  CollapseL:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9-3 3 3 3"/></svg>,
  ExpandL:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m13 9 3 3-3 3"/></svg>,
  Menu:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Globe:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  ChevronDown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Bell:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Lock:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  HelpCircle:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Camera:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Edit:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Save:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  X:           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ArrowLeft:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Eye:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Mail:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Info:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  AlertCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  CheckCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
}

// ── Nav per role ──────────────────────────────────────────────────────────────
const NAV_ROLE: Record<UserRole, NavItem[]> = {
  proprietaire: [
    { path: "/proprietaire",            label: "Tableau de bord", icon: Icon.Home,      desc: "Mon espace",           end: true },
    { path: "/proprietaire/audit",      label: "Mes audits",      icon: Icon.Clipboard, desc: "Historique des audits"           },
    { path: "/proprietaire/documents",  label: "Documents",       icon: Icon.Folder,    desc: "Mes fichiers"                    },
  ],
  technicien: [
    { path: "/technicien",              label: "Tableau de bord", icon: Icon.Home,      desc: "Mon espace",           end: true },
    { path: "/technicien/missions",     label: "Missions",        icon: Icon.MapPin,    desc: "Missions du jour"               },
    { path: "/technicien/mesures",      label: "Mesures",         icon: Icon.Ruler,     desc: "Saisir les données"             },
  ],
  auditeur: [
    { path: "/auditeur",                label: "Tableau de bord", icon: Icon.Home,      desc: "Mon espace",           end: true },
    { path: "/auditeur/dossiers",       label: "Dossiers",        icon: Icon.Files,     desc: "À valider"                      },
    { path: "/auditeur/rapports",       label: "Rapports",        icon: Icon.Report,    desc: "Mes rapports"                   },
  ],
  admin: [
    { path: "/admin",                   label: "Vue nationale",   icon: Icon.Map,       desc: "Tableau de bord",     end: true },
    { path: "/admin/utilisateurs",      label: "Utilisateurs",    icon: Icon.Users,     desc: "Gestion des comptes"            },
    { path: "/admin/statistiques",      label: "Statistiques",    icon: Icon.BarChart,  desc: "Indicateurs AMEE"              },
  ],
  analyste: [
    { path: "/analyste",                label: "Tableau de bord", icon: Icon.Home,      desc: "Mon espace",           end: true },
    { path: "/analyste/tendances",      label: "Tendances",       icon: Icon.TrendDown, desc: "Analyse nationale"              },
    { path: "/analyste/rapports",       label: "Rapports IA",     icon: Icon.Robot,     desc: "Modèles prédictifs"            },
  ],
}

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية"  },
  { code: "en", label: "English"  },
]

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("greenbuild-theme")
    if (stored) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  } catch { return false }
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

// ── Base Modal ────────────────────────────────────────────────────────────────
function BaseModal({
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}: {
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      <div className={`relative w-full ${width} bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden`}
        style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-white/8">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/8 transition-all duration-150"
          >
            <span className="w-4 h-4">{Icon.X}</span>
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-stone-100 dark:border-white/8">
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ onClose, user }: { onClose: () => void; user: ReturnType<typeof useAuth>["user"] }) {
  const name = user?.email?.split("@")[0] ?? "Utilisateur"
  const initials = getInitials(name)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(name)
  const [phone, setPhone] = useState("+212 6 00 00 00 00")
  const [bio, setBio] = useState("Expert en performance énergétique des bâtiments.")
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <BaseModal onClose={onClose} title="Profil utilisateur"
      footer={
        <div className="flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-4 h-4">{Icon.CheckCircle}</span> Profil mis à jour
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">Annuler</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white shadow-sm transition-all duration-150">Enregistrer</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-stone-100 dark:bg-white/8 hover:bg-stone-200 dark:hover:bg-white/12 text-stone-700 dark:text-stone-200 transition-all duration-150">
                <span className="w-3.5 h-3.5">{Icon.Edit}</span> Modifier
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Avatar hero */}
      <div className="px-6 pt-6 pb-5 border-b border-stone-100 dark:border-white/8">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-white text-2xl font-bold">{initials}</span>}
            </div>
            {editing && (
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white shadow-md hover:bg-green-500 transition-colors">
                <span className="w-3.5 h-3.5">{Icon.Camera}</span>
              </button>
            )}
          </div>
          <div className="min-w-0">
            {editing ? (
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-base font-semibold text-stone-800 dark:text-stone-100 outline-none focus:border-green-500 transition-colors mb-1" />
            ) : (
              <p className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-0.5">{displayName}</p>
            )}
            <p className="text-sm text-stone-400 dark:text-stone-500">{user?.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{user?.role ?? "—"}
            </span>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      {/* Fields */}
      <div className="px-6 py-5 flex flex-col gap-4">
        {[
          { label: "Adresse e-mail", icon: Icon.Mail, value: user?.email ?? "—", readOnly: true },
          { label: "Téléphone", icon: Icon.Phone, value: phone, onChange: setPhone, readOnly: !editing },
        ].map(({ label, icon, value, onChange, readOnly }) => (
          <div key={label}>
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 block">{label}</label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10">
              <span className="w-4 h-4 text-stone-400 flex-shrink-0">{icon}</span>
              {readOnly || !onChange ? (
                <span className="text-sm text-stone-700 dark:text-stone-200">{value}</span>
              ) : (
                <input type="text" value={value} onChange={e => onChange(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-stone-800 dark:text-stone-100 outline-none" />
              )}
            </div>
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 block">Bio</label>
          {editing ? (
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-sm text-stone-800 dark:text-stone-100 outline-none focus:border-green-500 transition-colors resize-none" />
          ) : (
            <div className="px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-sm text-stone-600 dark:text-stone-300">
              {bio}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

// ── Settings Modal ────────────────────────────────────────────────────────────
function SettingsModal({
  onClose,
  lang,
  setLang,
  darkMode,
  setDarkMode,
}: {
  onClose: () => void
  user: ReturnType<typeof useAuth>["user"]
  lang: string
  setLang: (l: string) => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}) {
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (autoSave) {
      try {
        localStorage.setItem("greenbuild-lang", lang)
        localStorage.setItem("greenbuild-notif", String(notifEnabled))
      } catch { /* ignored */ }
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`w-10 rounded-full transition-colors duration-200 flex items-center px-0.5 ${value ? "bg-green-500" : "bg-stone-300 dark:bg-stone-600"}`}
      style={{ height: "22px" }}>
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  )

  return (
    <BaseModal onClose={onClose} title="Paramètres du compte"
      footer={
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">Annuler</button>
          <button onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${saved ? "bg-emerald-500 text-white" : "bg-green-600 hover:bg-green-500 text-white shadow-sm"}`}>
            {saved ? "✓ Sauvegardé" : "Enregistrer"}
          </button>
        </div>
      }
    >
      {/* Langue */}
      <div className="px-6 py-5 border-b border-stone-100 dark:border-white/8">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Langue par défaut</p>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${lang === l.code ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-white/10 hover:border-green-400"}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Préférences */}
      <div className="px-6 py-5">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Préférences</p>
        <div className="flex flex-col gap-4">
          {[
            { icon: Icon.Bell, title: "Notifications", desc: "Recevoir des alertes système", value: notifEnabled, onChange: () => setNotifEnabled(v => !v) },
            { icon: Icon.Save, title: "Sauvegarde automatique", desc: "Enregistrer les préférences", value: autoSave, onChange: () => setAutoSave(v => !v) },
            { icon: darkMode ? Icon.Moon : Icon.Sun, title: "Mode sombre", desc: "Interface en thème sombre", value: darkMode, onChange: () => {
              const next = !darkMode
              setDarkMode(next)
              document.documentElement.classList.toggle("dark", next)
              try { localStorage.setItem("greenbuild-theme", next ? "dark" : "light") } catch { /* ignored */ }
            }},
          ].map(({ icon, title, desc, value, onChange }) => (
            <div key={title} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 text-stone-400">{icon}</span>
                <div>
                  <p className="text-sm text-stone-700 dark:text-stone-200 font-medium">{title}</p>
                  <p className="text-xs text-stone-400">{desc}</p>
                </div>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  )
}

// ── Notifications Modal ───────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 1, type: "info",    title: "Nouveau dossier assigné",   body: "Le dossier #2847 vous a été assigné par l'admin.",  time: "Il y a 5 min",  read: false },
  { id: 2, type: "success", title: "Rapport validé",            body: "Votre rapport de mars 2026 a été approuvé.",        time: "Il y a 1h",     read: false },
  { id: 3, type: "warning", title: "Mise à jour requise",       body: "Veuillez compléter votre profil utilisateur.",      time: "Il y a 3h",     read: false },
  { id: 4, type: "info",    title: "Réunion équipe technique",  body: "Rappel : réunion demain à 10h00.",                  time: "Hier",          read: true  },
  { id: 5, type: "success", title: "Audit terminé",             body: "L'audit du bâtiment Casablanca-Centre est clos.",   time: "Il y a 2 jours", read: true },
]

function NotificationsModal({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS)
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))

  const typeStyle: Record<string, { dot: string; icon: React.ReactNode }> = {
    info:    { dot: "bg-blue-400",   icon: <span className="text-blue-500 w-4 h-4">{Icon.Info}</span> },
    success: { dot: "bg-green-400",  icon: <span className="text-green-500 w-4 h-4">{Icon.CheckCircle}</span> },
    warning: { dot: "bg-amber-400",  icon: <span className="text-amber-500 w-4 h-4">{Icon.AlertCircle}</span> },
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <BaseModal onClose={onClose} title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400">{notifs.length} notifications</span>
          <button onClick={markAllRead} className="text-xs text-green-600 dark:text-green-400 font-semibold hover:text-green-700 transition-colors">
            Tout marquer comme lu
          </button>
        </div>
      }
    >
      <div className="divide-y divide-stone-100 dark:divide-white/6">
        {notifs.map(n => (
          <div key={n.id}
            onClick={() => markRead(n.id)}
            className={`flex items-start gap-3.5 px-6 py-4 cursor-pointer transition-colors duration-150 ${n.read ? "opacity-60 hover:bg-stone-50 dark:hover:bg-white/4" : "bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
            <div className="flex-shrink-0 mt-0.5">
              {typeStyle[n.type].icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{n.title}</p>
                {!n.read && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeStyle[n.type].dot}`} />}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{n.body}</p>
              <p className="text-[10px] text-stone-400 dark:text-stone-600 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  )
}

// ── Password Modal ────────────────────────────────────────────────────────────
function PasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const strength = (pw: string) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const pw_strength = strength(next)
  const strengthLabel = ["", "Faible", "Moyen", "Bon", "Fort"][pw_strength]
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][pw_strength]

  const handleSubmit = () => {
    setError("")
    if (!current) return setError("Veuillez saisir votre mot de passe actuel.")
    if (next.length < 8) return setError("Le nouveau mot de passe doit contenir au moins 8 caractères.")
    if (next !== confirm) return setError("Les mots de passe ne correspondent pas.")
    setSuccess(true)
    setTimeout(onClose, 2000)
  }

  const PasswordInput = ({
    label, value, onChange, show, onToggle, placeholder,
  }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string }) => (
    <div>
      <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="flex items-center px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10 focus-within:border-green-500 transition-colors">
        <span className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0">{Icon.Lock}</span>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-stone-800 dark:text-stone-100 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600" />
        <button onClick={onToggle} className="w-4 h-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 ml-2 flex-shrink-0 transition-colors">
          {show ? Icon.EyeOff : Icon.Eye}
        </button>
      </div>
    </div>
  )

  return (
    <BaseModal onClose={onClose} title="Modifier le mot de passe"
      footer={
        success ? (
          <div className="flex items-center justify-center gap-2 py-1 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <span className="w-4 h-4">{Icon.CheckCircle}</span> Mot de passe mis à jour avec succès
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">Annuler</button>
            <button onClick={handleSubmit} className="px-5 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white shadow-sm transition-all duration-150">Mettre à jour</button>
          </div>
        )
      }
    >
      <div className="px-6 py-5 flex flex-col gap-4">
        <PasswordInput label="Mot de passe actuel" value={current} onChange={setCurrent}
          show={showCurrent} onToggle={() => setShowCurrent(v => !v)} placeholder="••••••••" />
        <PasswordInput label="Nouveau mot de passe" value={next} onChange={setNext}
          show={showNext} onToggle={() => setShowNext(v => !v)} placeholder="8 caractères minimum" />

        {/* Strength meter */}
        {next.length > 0 && (
          <div>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pw_strength ? strengthColor : "bg-stone-200 dark:bg-stone-700"}`} />
              ))}
            </div>
            <p className="text-xs text-stone-400">{strengthLabel && `Niveau : ${strengthLabel}`}</p>
          </div>
        )}

        // eslint-disable-next-line react-hooks/static-components
        <PasswordInput label="Confirmer le nouveau mot de passe" value={confirm} onChange={setConfirm}
          show={showConfirm} onToggle={() => setShowConfirm(v => !v)} placeholder="••••••••" />

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
            <span className="w-4 h-4 text-red-500 flex-shrink-0">{Icon.AlertCircle}</span>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

// ── Support Modal ─────────────────────────────────────────────────────────────
const FAQ = [
  { q: "Comment créer un nouveau dossier d'audit ?", a: "Depuis votre tableau de bord, cliquez sur « Nouveau dossier » et remplissez le formulaire de création. Un technicien sera ensuite assigné automatiquement." },
  { q: "Comment exporter un rapport en PDF ?", a: "Ouvrez le rapport souhaité, puis cliquez sur le bouton « Exporter » en haut à droite. Choisissez le format PDF et confirmez." },
  { q: "Puis-je modifier mes informations personnelles ?", a: "Oui, rendez-vous dans Profil utilisateur via le menu en haut à droite. Vous pouvez modifier votre nom, téléphone et photo." },
  { q: "Comment contacter le support technique ?", a: "Utilisez le formulaire ci-dessous ou envoyez un e-mail à support@greenbuild.ma. Notre équipe répond sous 24h ouvrées." },
]

function SupportModal({ onClose }: { onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!message.trim()) return
    setSent(true)
    setTimeout(() => { setSent(false); setMessage("") }, 3000)
  }

  return (
    <BaseModal onClose={onClose} title="Centre d'aide & Support" width="max-w-xl">
      {/* FAQ */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Questions fréquentes</p>
        <div className="flex flex-col gap-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-stone-100 dark:border-white/8 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-white/4 transition-colors">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200 pr-4">{item.q}</span>
                <span className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`}>{Icon.ChevronRight}</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-sm text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-white/8 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="px-6 pt-4 pb-6 border-t border-stone-100 dark:border-white/8 mt-4">
        <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Contacter le support</p>
        <div className="flex items-center gap-4 mb-4">
          <a href="mailto:support@greenbuild.ma"
            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
            <span className="w-4 h-4">{Icon.Mail}</span> support@greenbuild.ma
          </a>
          <span className="text-stone-200 dark:text-stone-700">|</span>
          <a href="tel:+212522000000"
            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
            <span className="w-4 h-4">{Icon.Phone}</span> +212 5 22 00 00 00
          </a>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Décrivez votre problème ou votre question..."
          className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-sm text-stone-800 dark:text-stone-100 outline-none focus:border-green-500 transition-colors resize-none placeholder:text-stone-300 dark:placeholder:text-stone-600 mb-3"
        />
        <div className="flex items-center justify-between">
          {sent && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-4 h-4">{Icon.CheckCircle}</span> Message envoyé !
            </span>
          )}
          <button onClick={handleSend}
            className="ml-auto px-5 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white shadow-sm transition-all duration-150 disabled:opacity-50"
            disabled={!message.trim()}>
            Envoyer
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

// ── Tooltip wrapper ───────────────────────────────────────────────────────────
function Tooltip({ label, children, show }: { label: string; children: React.ReactNode; show: boolean }) {
  if (!show) return <>{children}</>
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                      px-2.5 py-1.5 rounded-lg bg-stone-800 dark:bg-stone-700 text-white text-xs font-medium
                      whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-stone-800 dark:border-r-stone-700" />
      </div>
    </div>
  )
}

// ── User Dropdown (Topbar) ────────────────────────────────────────────────────
function TopbarUserDropdown({
  user,
  darkMode,
  setDarkMode,
  lang,
  setLang,
  onOpenModal,
}: {
  user: ReturnType<typeof useAuth>["user"]
  darkMode: boolean
  setDarkMode: (v: boolean) => void
  lang: string
  setLang: (l: string) => void
  onOpenModal: (modal: ModalType) => void
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate("/")
  }

  const openModal = (modal: ModalType) => {
    setOpen(false)
    onOpenModal(modal)
  }

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("greenbuild-theme", next ? "dark" : "light") } catch { /* ignored */ }
  }

  const initials = user?.email ? getInitials(user.email.split("@")[0]) : "U"

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Menu utilisateur"
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-white/8 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500 group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 truncate max-w-[140px]">
            {user?.email?.split("@")[0] ?? "Utilisateur"}
          </span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate max-w-[140px]">
            {user?.email ?? "—"}
          </span>
        </div>
        <span className={`w-3.5 h-3.5 text-stone-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          {Icon.ChevronDown}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-72 z-50 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 shadow-2xl overflow-hidden"
          style={{ animation: "dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          {/* User header */}
          <div className="px-4 py-3.5 border-b border-stone-100 dark:border-white/8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">
                {user?.email?.split("@")[0] ?? "Utilisateur"}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{user?.email ?? "—"}</p>
            </div>
          </div>

          {/* Controls row */}
          <div className="px-2 py-2">
            <button onClick={toggleDark}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-white/6 transition-colors duration-150 group/item">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 text-stone-400 group-hover/item:text-stone-600 dark:group-hover/item:text-stone-300 transition-colors">
                  {darkMode ? Icon.Sun : Icon.Moon}
                </span>
                <span className="text-sm text-stone-600 dark:text-stone-300">{darkMode ? "Mode clair" : "Mode sombre"}</span>
              </div>
              <div className={`w-9 rounded-full transition-colors duration-200 flex items-center px-0.5 ${darkMode ? "bg-green-500" : "bg-stone-200 dark:bg-stone-600"}`} style={{ height: "20px" }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${darkMode ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-white/6 transition-colors duration-150">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 text-stone-400">{Icon.Globe}</span>
                <span className="text-sm text-stone-600 dark:text-stone-300">Langue</span>
              </div>
              <div className="flex items-center gap-1">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all duration-150 ${lang === l.code ? "bg-green-500 text-white" : "text-stone-400 hover:bg-stone-100 dark:hover:bg-white/10"}`}>
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-3 border-t border-stone-100 dark:border-white/8" />

          {/* Navigation items */}
          <div className="px-2 py-2 flex flex-col gap-0.5">
            <DropdownItem icon={Icon.User}       label="Profil utilisateur"    onClick={() => openModal("profile")}       />
            <DropdownItem icon={Icon.Settings}   label="Paramètres du compte"  onClick={() => openModal("settings")}      />
            <DropdownItem icon={Icon.Bell}        label="Notifications"          onClick={() => openModal("notifications")} badge="3" />
            <DropdownItem icon={Icon.Lock}        label="Modifier mot de passe"  onClick={() => openModal("password")}      />
          </div>

          <div className="mx-3 border-t border-stone-100 dark:border-white/8" />

          <div className="px-2 py-2 flex flex-col gap-0.5">
            <DropdownItem icon={Icon.HelpCircle} label="Centre d'aide / Support" onClick={() => openModal("support")} />
          </div>

          <div className="mx-3 border-t border-stone-100 dark:border-white/8" />

          <div className="px-2 py-2">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150 text-sm font-medium group/item">
              <span className="w-4 h-4">{Icon.Logout}</span>
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── Dropdown Item helper ──────────────────────────────────────────────────────
function DropdownItem({ icon, label, onClick, badge }: {
  icon: React.ReactNode; label: string; onClick: () => void; badge?: string
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-white/6 transition-all duration-150 group/item">
      <div className="flex items-center gap-2.5">
        <span className="w-4 h-4 text-stone-400 group-hover/item:text-stone-600 dark:group-hover/item:text-stone-300 transition-colors">{icon}</span>
        <span className="text-sm text-stone-600 dark:text-stone-300">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge && (
          <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
        <span className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover/item:text-stone-400 dark:group-hover/item:text-stone-400 transition-colors">{Icon.ChevronRight}</span>
      </div>
    </button>
  )
}

// ── Sidebar component ─────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle, onClose }: {
  collapsed: boolean; onToggle: () => void; onClose?: () => void
}) {
  const { user } = useAuth()
  const navItems = user ? NAV_ROLE[user.role] : []

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-xl transition-all duration-150 outline-none",
      "focus-visible:ring-2 focus-visible:ring-green-500 group/link",
      collapsed ? "justify-center p-2.5 w-10 mx-auto" : "px-3 py-2.5 w-full",
      isActive
        ? "bg-white/10 text-white"
        : "text-stone-400 hover:bg-white/6 hover:text-stone-100",
    ].join(" ")

  return (
    <div className="flex flex-col h-full">
      {/* Logo + collapse */}
      <div className={`flex items-center flex-shrink-0 h-14 px-3 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <Link to="/" onClick={onClose}
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg px-1"
            aria-label="GreenBuild — Accueil">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs shadow-sm flex-shrink-0">🌿</div>
            <span className="text-base font-bold tracking-tight text-white">Green<span className="text-green-400">Build</span></span>
          </Link>
        )}
        <Tooltip label={collapsed ? "Développer" : "Réduire"} show={collapsed}>
          <button onClick={onToggle}
            aria-label={collapsed ? "Développer la barre" : "Réduire la barre"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-white/8 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500">
            <span className="w-[18px] h-[18px]">
              {collapsed ? Icon.ExpandL : Icon.CollapseL}
            </span>
          </button>
        </Tooltip>
      </div>

      {/* Nav */}
      {user && (
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-2 ${collapsed ? "px-1" : "px-2"}`}
          aria-label="Navigation principale">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Tooltip key={item.path} label={item.label} show={collapsed}>
                <NavLink to={item.path} end={item.end} onClick={onClose} className={linkClass} title={collapsed ? item.label : item.desc}>
                  <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                </NavLink>
              </Tooltip>
            ))}
          </div>
        </nav>
      )}

      {!user && <div className="flex-1" />}

      {/* Footer */}
      <div className={`border-t border-white/8 flex-shrink-0 ${collapsed ? "mx-2" : "mx-3"}`} />
      <div className="py-3 px-2 flex-shrink-0">
        {collapsed ? (
          <Tooltip label="Menu" show={true}>
            <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-300 hover:bg-white/8 transition-all duration-150 cursor-default">
              <span className="w-4 h-4">{Icon.Menu}</span>
            </div>
          </Tooltip>
        ) : (
          <div className="px-2 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            GreenBuild
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function Layout() {
  const { pathname } = useLocation()
  const { user }     = useAuth()

  const [collapsed, setCollapsed]       = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [darkMode, setDarkMode]         = useState(getInitialDark)
  const [lang, setLang]                 = useState("fr")
  const [activeModal, setActiveModal]   = useState<ModalType>(null)

  useEffect(() => { startTransition(() => setMobileOpen(false)) }, [pathname])

  useEffect(() => {
    const anyOpen = mobileOpen || activeModal !== null
    document.body.style.overflow = anyOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen, activeModal])

  useEffect(() => {
    try { localStorage.setItem("greenbuild-sidebar", collapsed ? "collapsed" : "expanded") } catch { /* ignored */ }
  }, [collapsed])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("greenbuild-sidebar")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "collapsed") setCollapsed(true)
    } catch { /* ignored */ }
  }, [])


  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-950 overflow-hidden">

      {/* MOBILE OVERLAY */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* MOBILE DRAWER */}
      <aside
        id="mobile-sidebar"
        aria-label="Barre de navigation mobile"
        aria-hidden={!mobileOpen}
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col bg-stone-900 border-r border-white/6 transition-transform duration-250 ease-out ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* RIGHT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-white/8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar"
              aria-label="Ouvrir le menu"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/8 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <span className="w-5 h-5">{Icon.Menu}</span>
            </button>
            <Link to="/" className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-lg">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs">🌿</div>
              <span className="text-base font-bold text-stone-800 dark:text-white">Green<span className="text-green-600 dark:text-green-400">Build</span></span>
            </Link>

          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal("notifications")}
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/8 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <span className="w-[18px] h-[18px]">{Icon.Bell}</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-stone-900" />
            </button>

            <TopbarUserDropdown
              user={user}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              lang={lang}
              setLang={setLang}
              onOpenModal={setActiveModal}
            />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 min-w-0" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* MODALS */}
      {activeModal === "profile"       && <ProfileModal       onClose={() => setActiveModal(null)} user={user} />}
      {activeModal === "settings"      && <SettingsModal      onClose={() => setActiveModal(null)} user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />}
      {activeModal === "notifications" && <NotificationsModal onClose={() => setActiveModal(null)} />}
      {activeModal === "password"      && <PasswordModal      onClose={() => setActiveModal(null)} />}
      {activeModal === "support"       && <SupportModal       onClose={() => setActiveModal(null)} />}
    </div>
  )
}