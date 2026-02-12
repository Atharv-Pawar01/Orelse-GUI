import React from 'react'
import { colors } from '../../theme/colors'

export function AnalyserSection() {
  return (
    <div>
      <h2 style={styles.h2}>Analyser</h2>
      <p style={styles.p}>
        OT layer data from Node-RED will be shown here.
      </p>
      <div style={styles.placeholder}>
        <p style={styles.placeholderText}>This page will display information from the Node-RED OT layer once connected.</p>
      </div>
    </div>
  )
}

const styles = {
  h2: { margin: '0 0 8px', fontSize: 22 },
  p: { margin: '0 0 16px', color: colors.textSecondary, fontSize: 14 },
  placeholder: {
    background: colors.bgSecondary,
    padding: 32,
    borderRadius: 8,
    border: `1px dashed ${colors.border}`,
    textAlign: 'center'
  },
  placeholderText: {
    margin: 0,
    color: colors.textMuted,
    fontSize: 14
  }
}
