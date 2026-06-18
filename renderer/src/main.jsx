import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Show scrollbar only while scrolling
let scrollTimer
document.addEventListener('scroll', (e) => {
  const el = e.target
  if (!el || el === document) return
  el.classList.add('is-scrolling')
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => el.classList.remove('is-scrolling'), 800)
}, true)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)