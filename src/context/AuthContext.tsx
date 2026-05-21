// src/context/AuthContext.tsx
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

// ── Types définis directement ici — plus de fichier séparé ───
export type UserRole = "proprietaire" | "technicien" | "auditeur" | "admin" | "analyste"

export interface AuthUser {
  name:  string
  email: string
  role:  UserRole
}

export interface AuthContextType {
  user:   AuthUser | null
  login:  (user: AuthUser) => void
  logout: () => void
}

// ── Constantes ───────────────────────────────────────────────
const STORAGE_KEY = "greenbuild-user"
const VALID_ROLES: UserRole[] = ["proprietaire", "technicien", "auditeur", "admin", "analyste"]

// ── Helpers ──────────────────────────────────────────────────
function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.name && parsed?.email && VALID_ROLES.includes(parsed?.role)) {
      return parsed as AuthUser
    }
    return null
  } catch {
    return null
  }
}

// ── Context ──────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  const login = (u: AuthUser) => {
    setUser(u)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)) }
    catch { /* ignoré */ }
  }

  const logout = () => {
    setUser(null)
    try { localStorage.removeItem(STORAGE_KEY) }
    catch { /* ignoré */ }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}