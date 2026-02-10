import React from 'react'
import { colors } from '../theme/colors'

/**
 * HmiNavi: clear alarms and system indicators.
 * Mock: shows "No active alarms" or count. In production, connect to alarm source.
 */
export function AlarmsStrip({ alarmCount = 0 }) {
  const hasAlarms = alarmCount > 0

  return (
    <div style={styles.strip}>
      <span style={styles.label}>Alarms:</span>
      {hasAlarms ? (
        <span style={styles.alarmActive}>{alarmCount} active</span>
      ) : (
        <span style={styles.alarmOk}>No active alarms</span>
      )}
    </div>
  )
}

const styles = {
  strip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 20px',
    background: colors.bgTertiary,
    borderBottom: `1px solid ${colors.border}`,
    fontSize: 13,
    color: colors.textSecondary,
    flexShrink: 0
  },
  label: {
    fontWeight: 500,
    color: colors.textPrimary
  },
  alarmOk: {
    color: colors.statusOk
  },
  alarmActive: {
    color: colors.statusAlarm,
    fontWeight: 500
  }
}
