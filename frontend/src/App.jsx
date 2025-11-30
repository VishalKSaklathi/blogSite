import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './components/login/LoginPage'
import Dashboard from './components/dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="dashboard/*" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
