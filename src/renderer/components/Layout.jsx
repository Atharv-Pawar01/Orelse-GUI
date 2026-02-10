import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePrivilege } from '../hooks/usePrivilege'
import { colors } from '../theme/colors'
import { AlarmsStrip } from './AlarmsStrip'

const SECTIONS = {
  dashboard: 'Dashboard',
  wincc: 'WinCC Access',
  hminavi: 'HmiNavi Access',
  editConfig: 'Edit configuration',
  admin: 'Admin'
}

export function Layout({ currentSection, onSectionChange, children }) {
  const { user, role, logout } = useAuth()
  const {
    canLaunchWinCC,
    canRequestEditConfig,
    canAccessAdminControls
  } = usePrivilege()

  const navItems = [
    { id: 'dashboard', label: SECTIONS.dashboard },
    { id: 'wincc', label: SECTIONS.wincc },
    { id: 'hminavi', label: SECTIONS.hminavi },
    ...(canRequestEditConfig ? [{ id: 'editConfig', label: SECTIONS.editConfig }] : []),
    ...(canAccessAdminControls ? [{ id: 'admin', label: SECTIONS.admin }] : [])
  ]

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>Orelse</span>
          <div style={styles.statusBar}>
            <span style={styles.statusItem}>
              <span style={styles.statusDot} />
              PAM Connected
            </span>
            <span style={styles.statusItem}>
              <span style={{ ...styles.statusDot, ...styles.statusOk }} />
              System OK
            </span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.user}>
            {user} <span style={styles.role}>({role})</span>
          </span>
          <button type="button" onClick={logout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </header>
      <AlarmsStrip alarmCount={0} />
      <div style={styles.body}>
        <nav style={styles.sideNav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              style={{
                ...styles.navItem,
                ...(currentSection === item.id ? styles.navItemActive : {})
              }}
              onClick={() => onSectionChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <main style={styles.content}>
          {children}
        </main>
      </div>
      <footer style={styles.footer}>
        <span>© 2026 Orelse</span>
        
      </footer>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: colors.bgPrimary,
    fontFamily: 'system-ui, sans-serif',
    color: colors.textPrimary,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: colors.bgSecondary,
    borderBottom: `1px solid ${colors.border}`,
    flexShrink: 0
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 24
  },
  logo: {
    fontWeight: 600,
    fontSize: 18
  },
  statusBar: {
    display: 'flex',
    gap: 16,
    fontSize: 13,
    color: colors.textSecondary
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: colors.statusInfo
  },
  statusOk: {
    background: colors.statusOk
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16
  },
  user: {
    fontSize: 14,
    color: colors.textSecondary
  },
  role: {
    color: colors.accent
  },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: 13,
    background: colors.buttonSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.buttonBorder}`,
    borderRadius: 4,
    cursor: 'pointer'
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0
  },
  sideNav: {
    width: 200,
    flexShrink: 0,
    background: colors.bgSecondary,
    borderRight: `1px solid ${colors.border}`,
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  navItem: {
    padding: '10px 20px',
    fontSize: 14,
    textAlign: 'left',
    background: 'transparent',
    color: colors.textSecondary,
    border: 'none',
    borderLeft: '3px solid transparent',
    cursor: 'pointer'
  },
  navItemActive: {
    color: colors.textPrimary,
    background: colors.bgTertiary,
    borderLeftColor: colors.accent
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: 24
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 20px',
    background: colors.bgSecondary,
    borderTop: `1px solid ${colors.border}`,
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 0
  },
  footerMuted: {
    color: colors.textMuted
  }
}
