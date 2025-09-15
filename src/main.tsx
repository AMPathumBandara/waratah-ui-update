import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ApolloAuthWrapper from './ApolloAuthWrapper.tsx'
import { AuthProvider } from 'components/Auth/CognitoHooks.tsx'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <ApolloAuthWrapper>
      <App />
    </ApolloAuthWrapper> */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
