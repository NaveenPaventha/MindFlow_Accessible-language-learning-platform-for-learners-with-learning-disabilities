import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/style.css'
import './styles/style-kids.css'
import './styles/animations.css'
import App from './App.jsx'
import './i18n.js'

import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </AuthProvider>
  </StrictMode>,
)

