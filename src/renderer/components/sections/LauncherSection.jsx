import React, { useState, useEffect } from 'react'
import { colors } from '../../theme/colors'
import imgWincc from '../../assets/launcher/wincc.jpg'
import imgHminavi from '../../assets/launcher/hminavi.png'
import imgProsysOpc from '../../assets/launcher/prosys-opc.png'
import imgUaExpert from '../../assets/launcher/ua-expert.jpg'
import imgModbuspal from '../../assets/launcher/modbuspal.jpg'
import imgQmodmaster from '../../assets/launcher/qmodmaster.jpg'
import imgMqttExplorer from '../../assets/launcher/mqtt-explorer.jpg'
import imgMosquitto from '../../assets/launcher/mosquitto.png'
import imgBacnet from '../../assets/launcher/bacnet-explorer.webp'
import imgOnvif from '../../assets/launcher/onvif-device-manager.png'

const SUCCESS_MESSAGE_DURATION_MS = 4000

const LAUNCHER_IMAGES = {
  wincc: imgWincc,
  hminavi: imgHminavi,
  'prosys-opc': imgProsysOpc,
  'ua-expert': imgUaExpert,
  modbuspal: imgModbuspal,
  qmodmaster: imgQmodmaster,
  'mqtt-explorer': imgMqttExplorer,
  mosquitto: imgMosquitto,
  'bacnet-explorer': imgBacnet,
  'onvif-device-manager': imgOnvif
}

const LAUNCHER_TOOLS = [
  { id: 'wincc', name: 'WinCC Runtime', description: 'Launch WinCC on this PC.', type: null, protocol: null },
  { id: 'hminavi', name: 'HmiNavi', description: 'Launch HmiNavi application on this PC.', type: null, protocol: null },
  { id: 'prosys-opc', name: 'Prosys OPC UA Simulator', description: 'PLC/device simulation.', type: 'Server', protocol: 'OPC UA' },
  { id: 'ua-expert', name: 'UA Expert', description: 'Browse/test PLC tags.', type: 'Client', protocol: 'OPC UA' },
  { id: 'modbuspal', name: 'ModbusPal', description: 'Modbus device sim.', type: 'Server', protocol: 'Modbus TCP' },
  { id: 'qmodmaster', name: 'QModMaster', description: 'Read/write registers.', type: 'Client', protocol: 'Modbus TCP/RTU' },
  { id: 'mqtt-explorer', name: 'MQTT Explorer', description: 'Telemetry inspection.', type: 'Client', protocol: 'MQTT' },
  { id: 'mosquitto', name: 'Mosquitto', description: 'Telemetry hub.', type: 'Broker', protocol: 'MQTT' },
  { id: 'bacnet-explorer', name: 'BACnet Explorer', description: 'BMS discovery.', type: 'Client', protocol: 'BACnet/IP' },
  { id: 'onvif-device-manager', name: 'ONVIF Device Manager', description: 'Camera/NVR mgmt.', type: 'Client', protocol: 'ONVIF' }
]

function ToolLogo({ toolId, name }) {
  const src = LAUNCHER_IMAGES[toolId]
  if (src) {
    return (
      <div style={iconStyles.wrapper}>
        <img src={src} alt="" style={iconStyles.img} />
      </div>
    )
  }
  const letter = (name || '?').charAt(0).toUpperCase()
  return (
    <div style={iconStyles.wrapper}>
      <span style={iconStyles.letter}>{letter}</span>
    </div>
  )
}

const iconStyles = {
  wrapper: {
    width: 56,
    height: 56,
    borderRadius: 8,
    background: colors.bgTertiary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden'
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  letter: {
    fontSize: 22,
    fontWeight: 600,
    color: colors.accent
  }
}

export function LauncherSection() {
  const [message, setMessage] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (message?.type !== 'success') return
    const t = setTimeout(() => setMessage(null), SUCCESS_MESSAGE_DURATION_MS)
    return () => clearTimeout(t)
  }, [message?.type, message?.text])

  async function handleLaunch(toolId) {
    if (!window.electronAPI?.launcherLaunch) {
      setMessage({ type: 'error', text: 'Launcher not available in this environment.' })
      return
    }
    setMessage(null)
    setLoadingId(toolId)
    try {
      const result = await window.electronAPI.launcherLaunch(toolId)
      setLoadingId(null)
      if (result.ok) {
        const tool = LAUNCHER_TOOLS.find((t) => t.id === toolId)
        setMessage({ type: 'success', text: `${tool?.name || toolId} starting.` })
      } else {
        setMessage({ type: 'error', text: result.error || 'Launch failed.' })
      }
    } catch (err) {
      setLoadingId(null)
      setMessage({ type: 'error', text: err.message || 'Launch failed.' })
    }
  }

  return (
    <div>
      <h2 style={styles.h2}>Launcher</h2>
      <p style={styles.p}>
        Launch applications and tools on this PC. Configure EXE paths in .env if a tool does not start.
      </p>
      {message && (
        <div style={{ ...styles.message, ...(message.type === 'error' ? styles.messageError : styles.messageSuccess) }}>
          {message.text}
        </div>
      )}
      <div style={styles.cards}>
        {LAUNCHER_TOOLS.map((tool) => (
          <div key={tool.id} style={styles.card}>
            <ToolLogo toolId={tool.id} name={tool.name} />
            <h3 style={styles.cardTitle}>{tool.name}</h3>
            <p style={styles.cardP}>{tool.description}</p>
            <button
              type="button"
              style={styles.button}
              onClick={() => handleLaunch(tool.id)}
              disabled={loadingId != null}
            >
              {loadingId === tool.id ? 'Launching…' : 'Launch'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  h2: { margin: '0 0 8px', fontSize: 22 },
  p: { margin: '0 0 16px', color: colors.textSecondary, fontSize: 14 },
  message: {
    padding: '10px 12px',
    marginBottom: 16,
    borderRadius: 4,
    fontSize: 14,
    maxWidth: 520
  },
  messageError: { background: '#3d1f1f', color: '#f28b82' },
  messageSuccess: { background: '#1e3a2f', color: colors.statusOk },
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
  button: {
    padding: '10px 16px',
    fontSize: 14,
    background: colors.buttonPrimary,
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer'
  }
}
