import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [dbStatus, setDbStatus] = useState('Checking...')

  useEffect(() => {
    // Placeholder for future database connection check
    setDbStatus('PostGIS database configured')
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>CMU APSCO</h1>
        <p>React Application with PostGIS Database</p>
        <div className="status">
          <strong>Database Status:</strong> {dbStatus}
        </div>
      </header>
    </div>
  )
}

export default App
