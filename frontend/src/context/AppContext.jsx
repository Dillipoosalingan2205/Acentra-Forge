import { useMemo, useState } from 'react'

import { AppContext } from '@/context/appContext.js'

/**
 * Lightweight global state for the demo:
 *  - mock user/profile shown in the top bar
 *  - demo route ids ('demo') so the sidebar links and deep links resolve
 *  - app language (static selector for now)
 */
export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [user] = useState({
    name: 'Demo Provider',
    role: 'Provider',
    initials: 'DP',
  })
  const [documentId, setDocumentId] = useState(() => {
    try { return localStorage.getItem('aegis_last_doc_id') || 'demo' } catch { return 'demo' }
  })
  const [patientId, setPatientId] = useState(() => {
    try { return localStorage.getItem('aegis_last_patient_id') || 'demo' } catch { return 'demo' }
  })
  const [patientName, setPatientName] = useState(() => {
    try { return localStorage.getItem('aegis_last_patient_name') || '' } catch { return '' }
  })

  const updatePatient = (newPatientId, newPatientName = '') => {
    if (newPatientId) {
      setPatientId(newPatientId)
      try { localStorage.setItem('aegis_last_patient_id', newPatientId) } catch {}
    }
    if (newPatientName) {
      setPatientName(newPatientName)
      try { localStorage.setItem('aegis_last_patient_name', newPatientName) } catch {}
    }
  }

  const updateDocument = (newDocId) => {
    if (newDocId) {
      setDocumentId(newDocId)
      try { localStorage.setItem('aegis_last_doc_id', newDocId) } catch {}
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      user,
      documentId,
      setDocumentId: updateDocument,
      patientId,
      setPatientId: (id) => updatePatient(id),
      patientName,
      setPatientName: (name) => updatePatient(patientId, name),
      updatePatient,
    }),
    [language, user, documentId, patientId, patientName],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
