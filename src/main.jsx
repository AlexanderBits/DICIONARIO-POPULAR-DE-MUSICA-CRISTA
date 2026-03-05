import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import VerbetePage from './VerbetePage.jsx'
import AdminPanel from './AdminPanel.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
            <BrowserRouter basename="/">
                  <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/verbete/:slug" element={<VerbetePage />} />
                  </Routes>
            </BrowserRouter>
      </React.StrictMode>,
)
