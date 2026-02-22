import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { CryptoProvider } from './context/CryptoContext'

const App = () => {
  return (
    <ThemeProvider>
      <CryptoProvider>
        <AppRoutes />
      </CryptoProvider>
    </ThemeProvider>
  )
}

export default App