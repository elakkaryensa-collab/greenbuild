// src/components/Layout.tsx
// GreenBuild v3.0 — Version finale sans erreurs

import {
  useState,
  useEffect,
  useCallback,
  startTransition,
} from "react"
import { Outlet, NavLink, Link, useLocation } from "react-router-dom"

// ── Thème appliqué au niveau module (avant React mount) ─────
if (typeof window !== "undefined") {
  try {
    const stored      = localStorage.getItem("greenbuild-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle(
      "dark",
      stored ? stored === "dark" : prefersDark
    )
  } catch { /* ignoré */ }
}

// ── Types ────────────────────────────────────────────────────
interface NavPortail {
  path:  string
  label: string
  icon:  string
  desc:  string
}

// ── Données navigation ───────────────────────────────────────
// ✅ CORRECTION : paths alignés avec les routes dans App.tsx
const NAV_PORTAILS: NavPortail[] = [
  { path: "/proprietaire", label: "Propriétaire", icon: "🏠", desc: "Soumettre un audit"   },
  { path: "/technicien",   label: "Technicien",   icon: "🔧", desc: "Saisir les mesures"   },
  { path: "/auditeur",     label: "Auditeur",     icon: "✅", desc: "Valider les dossiers" },
  { path: "/admin",        label: "Admin AMEE",   icon: "🗺️", desc: "Vue nationale"        },
  { path: "/analyste",     label: "Analyste IA",  icon: "📈", desc: "Tendances nationales" },
]

// ── Lecture initiale du thème ────────────────────────────────
function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem("greenbuild-theme")
    if (stored) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  } catch {
    return false
  }
}

// ── Composant principal ──────────────────────────────────────
export default function Layout() {
  const { pathname } = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(getInitialDark)

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Fermer menu mobile à chaque changement de route
  useEffect(() => {
    startTransition(() => {
      setMenuOpen(false)
    })
  }, [pathname])

  // Bloquer scroll body quand menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  // Basculer dark mode
  const toggleDark = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      try {
        localStorage.setItem("greenbuild-theme", next ? "dark" : "light")
      } catch { /* ignoré */ }
      return next
    })
  }, [])

  // Classes NavLink
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
      "transition-all duration-150 outline-none",
      "focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1",
      isActive
        ? "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300"
        : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white",
    ].join(" ")

  const navLinkMobileClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
      "transition-colors mb-0.5 outline-none",
      "focus-visible:ring-2 focus-visible:ring-green-500",
      isActive
        ? "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300"
        : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800",
    ].join(" ")

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">

      {/* ── NAVBAR ── */}
      <nav
        role="navigation"
        aria-label="Navigation principale"
        className={[
          "sticky top-0 z-50",
          "bg-white/90 dark:bg-stone-900/90 backdrop-blur-md",
          "border-b border-stone-100 dark:border-stone-800",
          "transition-shadow duration-200",
          scrolled ? "shadow-sm" : "",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Liens desktop */}
            <div className="hidden md:flex items-center gap-0.5" role="menubar">
              {NAV_PORTAILS.map((p) => (
                <NavLink
                  key={p.path}
                  to={p.path}
                  className={navLinkClass}
                  role="menuitem"
                  title={p.desc}
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {p.icon}
                  </span>
                  {p.label}
                </NavLink>
              ))}
            </div>

            {/* Actions desktop */}
            <div className="hidden md:flex items-center gap-2">

              {/* ✅ /verifier est maintenant une route valide dans App.tsx */}
              <Link
                to="/verifier"
                className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                🔍 Vérifier certificat
              </Link>

              <button
                onClick={toggleDark}
                className="p-2 rounded-lg text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
                aria-label={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
                aria-pressed={darkMode}
              >
                <span aria-hidden="true">{darkMode ? "☀️" : "🌙"}</span>
              </button>

              {/* ✅ Bouton Commencer → /proprietaire (route existante) */}
              <Link
                to="/proprietaire"
                className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 px-4 py-2 rounded-lg transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1"
              >
                Commencer
              </Link>
            </div>

            {/* Burger mobile */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <div className="w-5 h-4 flex flex-col justify-between" aria-hidden="true">
                <span className={[
                  "block h-0.5 bg-current rounded-full origin-center transition-transform duration-200",
                  menuOpen ? "rotate-45 translate-y-[7px]" : "",
                ].join(" ")} />
                <span className={[
                  "block h-0.5 bg-current rounded-full transition-opacity duration-200",
                  menuOpen ? "opacity-0 scale-x-0" : "",
                ].join(" ")} />
                <span className={[
                  "block h-0.5 bg-current rounded-full origin-center transition-transform duration-200",
                  menuOpen ? "-rotate-45 -translate-y-[7px]" : "",
                ].join(" ")} />
              </div>
            </button>

          </div>
        </div>

        {/* Menu mobile */}
        <div
          id="mobile-menu"
          aria-hidden={!menuOpen}
          className={[
            "md:hidden overflow-hidden transition-all duration-200 ease-in-out",
            "border-t border-stone-100 dark:border-stone-800",
            "bg-white dark:bg-stone-900",
            menuOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          ].join(" ")}
        >
          <div className="px-4 pt-2 pb-4">
            {NAV_PORTAILS.map((p) => (
              <NavLink
                key={p.path}
                to={p.path}
                className={navLinkMobileClass}
              >
                <span className="text-lg leading-none w-6 text-center" aria-hidden="true">
                  {p.icon}
                </span>
                <span className="flex flex-col">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-normal">
                    {p.desc}
                  </span>
                </span>
              </NavLink>
            ))}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 gap-2">
              <Link
                to="/verifier"
                className="text-xs font-medium text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-lg flex-1 text-center"
              >
                🔍 Vérifier certificat
              </Link>
              <button
                onClick={toggleDark}
                aria-label={darkMode ? "Mode clair" : "Mode sombre"}
                aria-pressed={darkMode}
                className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 dark:text-stone-500 dark:hover:bg-stone-800 transition-colors"
              >
                <span aria-hidden="true">{darkMode ? "☀️" : "🌙"}</span>
              </button>
              <Link
                to="/proprietaire"
                className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── CONTENU ── */}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 px-6"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">

          <Link to="/" className="text-sm font-bold text-stone-800 dark:text-white">
            Green<span className="text-green-600">Build</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Netlify CI/CD
            </span>
            <span>·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              GitHub
            </a>
          </div>

        </div>
      </footer>

    </div>
  )
}