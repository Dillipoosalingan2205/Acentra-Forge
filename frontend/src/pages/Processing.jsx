import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import CarePlanNotFound from '@/components/common/CarePlanNotFound.jsx'
import LoadingState from '@/components/common/LoadingState.jsx'
import ProcessingSteps from '@/components/documents/ProcessingSteps.jsx'
import { useDocumentGuard } from '@/hooks/useCarePlanGuard.js'
import { useApp } from '@/context/appContext.js'

const STAGES = [
  'Uploading document',
  'Reading document',
  'Extracting instructions',
  'Identifying follow-up actions',
  'Validating information',
  'Creating follow-up plan',
]

const TOTAL_DURATION = 3600 // 3.6s total (~600ms per step)

export default function Processing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updatePatient, patientName: appPatientName } = useApp()
  const { status, data: document } = useDocumentGuard(id)

  const [step, setStep] = useState(0)
  const [stageState, setStageState] = useState('processing')

  useEffect(() => {
    if (document?.patientId || document?.patientName) {
      updatePatient(document.patientId, document.patientName, true)
    }
  }, [document, updatePatient])

  useEffect(() => {
    if (status !== 'ok' || !document) return

    const stepDuration = TOTAL_DURATION / STAGES.length

    let currentStep = 0
    let timeoutId = null

    const transition = () => {
      if (currentStep >= STAGES.length) {
        setStageState('completed')
        timeoutId = setTimeout(() => {
          navigate(`/dashboard/${document.patientId || 'demo'}`, { replace: true })
        }, 500)
        return
      }

      setStep(currentStep)
      timeoutId = setTimeout(() => {
        currentStep += 1
        transition()
      }, stepDuration)
    }

    transition()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [status, document, navigate])

  if (status === 'missing') {
    return (
      <CarePlanNotFound
        title="We couldn't find this document."
        description={`No document with id ${id} exists in this demo. Start from the upload page.`}
      />
    )
  }

  if (status !== 'ok') {
    return (
      <div className="mx-auto max-w-5xl">
        <LoadingState label="Locating document…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <ProcessingSteps
        currentStep={step}
        stages={STAGES}
        state={stageState}
        patientName={document?.patientName || appPatientName}
      />
    </div>
  )
}
