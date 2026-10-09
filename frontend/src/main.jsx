import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App.jsx'
import { AppProvider } from '@/context/AppContext.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { TaskContextProvider } from '@/context/TaskContext.jsx'
import '@/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppProvider>
          <TaskContextProvider>
            <App />
          </TaskContextProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
