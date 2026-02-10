import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { Layout } from './components/Layout'
import { DashboardSection } from './components/sections/DashboardSection'
import { WinCCAccess } from './components/sections/WinCCAccess'
import { HmiNaviAccess } from './components/sections/HmiNaviAccess'
import { EditConfig } from './components/sections/EditConfig'
import { AdminSection } from './components/sections/AdminSection'

function AppContent() {
  const { user } = useAuth()
  const [section, setSection] = useState('dashboard')

  if (!user) {
    return <Login />
  }

  const sectionContent = {
    dashboard: <DashboardSection />,
    wincc: <WinCCAccess />,
    hminavi: <HmiNaviAccess />,
    editConfig: <EditConfig />,
    admin: <AdminSection />
  }

  return (
    <Layout currentSection={section} onSectionChange={setSection}>
      {sectionContent[section] ?? <DashboardSection />}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
