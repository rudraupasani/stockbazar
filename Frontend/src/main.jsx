import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CryptoProvider} from './context/CryptoContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <CryptoProvider>
      <App />
    </CryptoProvider>
  </StrictMode>
  </BrowserRouter>
)
