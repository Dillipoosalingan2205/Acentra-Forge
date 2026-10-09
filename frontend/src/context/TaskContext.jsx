import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { getTasks as mockGetTasks, updateTaskStatus as apiUpdateTaskStatus } from '../services/mockApi.js'
import { useApp } from '@/context/appContext.js'

/**
 * Task status types matching the specification.
 * 'pending' | 'completed' | 'needs-review'
 */
export const TaskStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  NEEDS_REVIEW: 'needs-review',
}

/** Task category types */
export const TaskCategory = {
  APPOINTMENT: 'appointment',
  INVESTIGATION: 'investigation',
  REFERRAL: 'referral',
  CARE_INSTRUCTION: 'care-instruction',
  MEDICATION: 'medication',
  FOLLOW_UP: 'follow-up',
}

/** Priority levels */
export const TaskPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
}

/**
 * TaskContext provides global task state that syncs across
 * Dashboard, Timeline, Tasks, and Human Review pages.
 */
const TaskContext = createContext({
  tasks: [],
  loading: true,
  error: null,
  updateTaskStatus: () => Promise.resolve(),
  markNeedsReview: () => { },
  resetTask: () => { },
  refreshTasks: () => Promise.resolve([]),
  activityFeed: [],
})

export const useTaskContext = () => useContext(TaskContext)

export const TaskContextProvider = ({ children }) => {
  const { patientId } = useApp()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activityFeed, setActivityFeed] = useState([])
  const currentPatientRef = useRef(patientId)


  useEffect(() => {
    if (patientId) {
      currentPatientRef.current = patientId
    }
  }, [patientId])

  const refreshTasks = useCallback((customPatientId = null) => {
    const targetId = customPatientId || currentPatientRef.current
    if (!targetId) return Promise.resolve([])

    currentPatientRef.current = targetId
    setLoading(true)
    return mockGetTasks(targetId)
      .then((fetchedTasks) => {
        setTasks(fetchedTasks || [])
        setLoading(false)
        return fetchedTasks
      })
      .catch((err) => {
        setError(err.message || 'Failed to load tasks')
        setLoading(false)
        return []
      })
  }, [])

  // Initialize state from mockApi on mount / when patientId changes
  useEffect(() => {
    if (!patientId) return
    refreshTasks(patientId)
  }, [patientId, refreshTasks])

  // Listen for review resolutions from the Human Review queue or detail page
  useEffect(() => {
    const handleReviewResolved = (event) => {
      const detail = event?.detail || {}
      const action = (detail.action || '').toUpperCase()
      const updatedTaskId = detail.updatedTaskId
      const resolvedValues = detail.resolvedValues
      const resolvedPatientId = detail.patientId

      // Only alter tasks if the resolved review belongs to the currently loaded patient or matches by task ID
      const activePid = currentPatientRef.current
      if (resolvedPatientId && activePid && resolvedPatientId !== activePid && !updatedTaskId) {
        return
      }

      if (['APPROVE', 'OVERRIDE'].includes(action)) {
        let affectedTaskTitle = 'Medication instruction'

        setTasks((currentTasks) =>
          currentTasks.map((t) => {
            const matches =
              (updatedTaskId && t.id === updatedTaskId) ||
              (!updatedTaskId && (t.status === TaskStatus.NEEDS_REVIEW || t.reviewRequired))

            if (matches) {
              affectedTaskTitle = t.title
              return {
                ...t,
                status: TaskStatus.PENDING,
                reviewRequired: false,
                clarificationNeeded: false,
                priority: 'medium',
                confidence: Math.max(t.confidence || 0.85, 0.90),
                date: resolvedValues?.dueDate || resolvedValues?.due_date || t.date,
                title: resolvedValues?.overrideInstruction || resolvedValues?.override_instruction || t.title,
              }
            }
            return t
          }),
        )

        // Add resolution notice to recent activity
        setActivityFeed((prev) => [
          {
            id: `review-resolved-${Date.now()}`,
            taskId: updatedTaskId || 'review-task',
            taskTitle: resolvedValues?.overrideInstruction
              ? `Instruction confirmed with override: "${resolvedValues.overrideInstruction}"`
              : `${affectedTaskTitle} approved by clinician review`,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 6))

        // Re-fetch from server to ensure complete sync with database
        setTimeout(() => {
          refreshTasks(activePid)
        }, 150)
      }
    }

    window.addEventListener('aegis:review-resolved', handleReviewResolved)
    return () => {
      window.removeEventListener('aegis:review-resolved', handleReviewResolved)
    }
  }, [refreshTasks])

  /** Update a task's status in the global state and persist to backend */
  const updateTaskStatus = async (taskId, newStatus) => {
    // 1. Optimistically update local React state
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id === taskId) {
          if (task.status === TaskStatus.NEEDS_REVIEW && newStatus === TaskStatus.COMPLETED) {
            return task
          }
          return { ...task, status: newStatus }
        }
        return task
      }),
    )

    // 2. If task is marked complete, add to activity feed
    if (newStatus === TaskStatus.COMPLETED) {
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        setActivityFeed((prev) => [
          {
            id: `${taskId}-${Date.now()}`,
            taskId,
            taskTitle: task.title,
            timestamp: Date.now(),
          },
          ...prev,
        ].slice(0, 6))
      }
    }

    // 3. Persist mutation to backend API (PATCH /api/tasks/{taskId})
    try {
      await apiUpdateTaskStatus(taskId, newStatus)
    } catch (err) {
      console.warn('Failed to persist task status to backend:', err)
    }
  }

  /** Mark a task as needing human review (protected from "complete") */
  const markNeedsReview = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: TaskStatus.NEEDS_REVIEW } : task,
      ),
    )
  }

  /** Reset a task back to its original state (for undo/rollback) */
  const resetTask = (taskId, originalTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? originalTask : task)),
    )
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        updateTaskStatus,
        markNeedsReview,
        resetTask,
        refreshTasks,
        activityFeed,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}