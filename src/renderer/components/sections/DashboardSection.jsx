import React from 'react'
import { usePrivilege } from '../../hooks/usePrivilege'
import { colors } from '../../theme/colors'

export function DashboardSection() {
  const { canViewHmi, canLaunchWinCC, canRequestEditConfig, canAccessAdminControls } = usePrivilege()

  return (
    <div>
      <h2 style={styles.h2}>Dashboard</h2>
      <p style={styles.p}>
        Authenticated via Acronis PAM. Role-based access applies. Use the side navigation to open sections.
      </p>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>View HMI</h3>
          <p style={styles.cardP}>Available to all roles.</p>
          <span style={styles.badge}>{canViewHmi ? 'Allowed' : '—'}</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Launch WinCC</h3>
          <p style={styles.cardP}>Available to all roles. Use WinCC Access in the menu.</p>
          <span style={styles.badge}>{canLaunchWinCC ? 'Allowed' : '—'}</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Edit configuration</h3>
          <p style={styles.cardP}>
            {canRequestEditConfig ? 'Engineer/Admin: requires PAM approval. See Edit configuration.' : 'Not available for your role.'}
          </p>
          <span style={styles.badge}>{canRequestEditConfig ? 'Via PAM' : '—'}</span>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Admin controls</h3>
          <p style={styles.cardP}>
            {canAccessAdminControls ? 'Admin only: requires PAM approval. See Admin.' : 'Not available for your role.'}
          </p>
          <span style={styles.badge}>{canAccessAdminControls ? 'Via PAM' : '—'}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  h2: { margin: '0 0 8px', fontSize: 22 },
  p: { margin: '0 0 16px', color: colors.textSecondary, fontSize: 14 },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16
  },
  card: {
    background: colors.bgSecondary,
    padding: 20,
    borderRadius: 8,
    border: `1px solid ${colors.border}`
  },
  cardTitle: { margin: '0 0 8px', fontSize: 16 },
  cardP: { margin: '0 0 12px', color: colors.textSecondary, fontSize: 13 },
  badge: { fontSize: 12, color: colors.statusOk }
}
