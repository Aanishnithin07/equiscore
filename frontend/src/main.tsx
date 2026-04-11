import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/motion.css'
import './styles/surfaces.css'
import './styles/global.css'
import { initNoisePattern } from './lib/noise'

// Inject tactile glass overlay SVG implicitly
initNoisePattern()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
