import React, { Suspense } from 'react'
import './App.css'
import "./utils/style.css"
import FullScreenLoading from 'components/Layout/FullScreenLoading'
import { BrowserRouter } from 'react-router';

const Layout = React.lazy(() => import("components/Layout"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoading />}>
        <Layout />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
