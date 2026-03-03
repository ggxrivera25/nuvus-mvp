import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const style = document.createElement('style')
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1E2030; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2A2D42; }
  button:hover { opacity: 0.9; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
