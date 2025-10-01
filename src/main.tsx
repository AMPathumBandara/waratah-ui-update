import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ApolloAuthWrapper from './ApolloAuthWrapper.tsx'
import { AuthProvider } from 'components/Auth/CognitoHooks.tsx'
import { BrowserRouter } from 'react-router'
import { ApplicationModalProvider } from 'components/Context/ApplicationModalContext.tsx'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ApolloAuthWrapper>
          <ApplicationModalProvider>
            <App />
          </ApplicationModalProvider>
        </ApolloAuthWrapper>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
