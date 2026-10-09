import { useCallback, useMemo, useState } from 'react'

import { AppContext } from '@/context/appContext.js'

/**
 * Global application context:
 *  - current session patient ID & patient Name (persisted to localStorage)
 *  - current session document ID
 *  - mock user / profile shown in the top bar
 *  - language preference
 */
export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [user] = useState({
    name: 'Demo Provider',
    role: 'Provider',
    initials: 'DP',
  })
  const [documentId, setDocumentIdState] = useState(() => {
    try { return localStorage.getItem('aegis_last_doc_id') || 'demo' } catch { return 'demo' }
  })
  const [uploadedPatientId, setUploadedPatientIdState] = useState(() => {
    try { return localStorage.getItem('aegis_uploaded_patient_id') || '' } catch { return '' }
  })
  const [uploadedPatientName, setUploadedPatientNameState] = useState(() => {
    try { return localStorage.getItem('aegis_uploaded_patient_name') || '' } catch { return '' }
  })
  const [patientId, setPatientIdState] = useState(() => {
    try {
      const uploaded = localStorage.getItem('aegis_uploaded_patient_id')
      if (uploaded) return uploaded
      return localStorage.getItem('aegis_last_patient_id') || 'demo'
    } catch { return 'demo' }
  })
  const [patientName, setPatientNameState] = useState(() => {
    try {
      const uploaded = localStorage.getItem('aegis_uploaded_patient_name')
      if (uploaded) return uploaded
      return localStorage.getItem('aegis_last_patient_name') || ''
    } catch { return '' }
  })

  const updatePatient = useCallback((newPatientId, newPatientName = '', isUpload = false) => {
    if (newPatientId) {
      setPatientIdState((prev) => {
        if (prev !== newPatientId) {
          try { localStorage.setItem('aegis_last_patient_id', newPatientId) } catch {}
          return newPatientId
        }
        return prev
      })
      if (isUpload || (newPatientId !== 'pat-syn-003' && newPatientId !== 'demo')) {
        setUploadedPatientIdState(newPatientId)
        try { localStorage.setItem('aegis_uploaded_patient_id', newPatientId) } catch {}
      }
    }
    if (newPatientName) {
      setPatientNameState((prev) => {
        if (prev !== newPatientName) {
          try { localStorage.setItem('aegis_last_patient_name', newPatientName) } catch {}
          return newPatientName
        }
        return prev
      })
      if (isUpload || (newPatientId !== 'pat-syn-003' && newPatientId !== 'demo')) {
        setUploadedPatientNameState(newPatientName)
        try { localStorage.setItem('aegis_uploaded_patient_name', newPatientName) } catch {}
      }
    }
  }, [])

  const updateDocument = useCallback((newDocId) => {
    if (newDocId) {
      setDocumentIdState((prev) => {
        if (prev !== newDocId) {
          try { localStorage.setItem('aegis_last_doc_id', newDocId) } catch {}
          return newDocId
        }
        return prev
      })
    }
  }, [])

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
      uploadedPatientId,
      uploadedPatientName,
      updatePatient,
    }),
    [language, user, documentId, patientId, patientName, uploadedPatientId, uploadedPatientName, updatePatient, updateDocument],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
