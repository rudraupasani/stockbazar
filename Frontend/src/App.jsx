import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'
import { CryptoProvider } from './context/CryptoContext'
import { Analytics } from '@vercel/analytics/react'

const App = () => {
  return (
    <ThemeProvider>
      <CryptoProvider>
        <AppRoutes />
        <Analytics />
      </CryptoProvider>
    </ThemeProvider>
  )
}

export default App

