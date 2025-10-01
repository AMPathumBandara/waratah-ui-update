import React, { Suspense } from 'react'
import './App.css'
import "./utils/style.css"
import FullScreenLoading from 'components/Layout/FullScreenLoading'

const Layout = React.lazy(() => import("components/Layout"));

function App() {
  return (
    <Suspense fallback={<FullScreenLoading />}>
      <Layout />
    </Suspense>
  )
}

export default App
