
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import './styles/globals.css'

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { 
            background: 'rgba(30, 13, 46, 0.95)', 
            color: '#fff',
            border: '1px solid rgba(138, 43, 226, 0.3)'
          },
          success: { 
            style: { 
              background: 'rgba(138, 43, 226, 0.9)',
              color: '#fff'
            } 
          },
          error: { 
            style: { 
              background: 'rgba(239, 68, 68, 0.9)',
              color: '#fff'
            } 
          }
        }}
      />
      
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
