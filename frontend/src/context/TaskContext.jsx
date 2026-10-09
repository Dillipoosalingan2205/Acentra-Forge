import { createContext, useContext, useState, useEffect } from 'react'
import { getTasks as mockGetTasks } from '../services/mockApi.js'
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
 * Dashboard, Timeline, and Tasks pages without a backend.
 */
const TaskContext = createContext({
  tasks: [],
  loading: true,
  error: null,
  updateTaskStatus: () => { },
  markNeedsReview: () => { },
  resetTask: () => { },
  activityFeed: [],
})

export const useTaskContext = () => useContext(TaskContext)

export const TaskContextProvider = ({ children }) => {
  const { patientId } = useApp()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activityFeed, setActivityFeed] = useState([])

  // Initialize state from mockApi on mount (requires the session patient id)
  useEffect(() => {
    if (!patientId) return
    let active = true

    mockGetTasks(patientId)
      .then((fetchedTasks) => {
        if (active) {
          setTasks(fetchedTasks)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load tasks')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [patientId])

  /** Update a task's status in the global state */
  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id === taskId) {
          // Safety guard: tasks requiring human review cannot be marked complete
          if (task.status === TaskStatus.NEEDS_REVIEW && newStatus === TaskStatus.COMPLETED) {
            return task
          }
          return { ...task, status: newStatus }
        }
        return task
      }),
    )

    // If task is marked complete, add to activity feed
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
        ].slice(0, 6)) // Keep only the 6 most recent activities
      }
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
        activityFeed,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}