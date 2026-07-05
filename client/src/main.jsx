import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BorrowingsProvider } from './context/BorrowingsContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BorrowingsProvider>
        <App />
      </BorrowingsProvider>
    </AuthProvider>
  </StrictMode>,
)
