import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './style.css'

import HomePage from './pages/HomePage.tsx'
import TopScorers from './components/TopScorers.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
// import FantasyLineup from './pages/FantasyLineup.tsx'
import FantasyPLUI from './pages/FantasyPLUI.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/topscorers',
    element: <TopScorers />
  },
  // {
  //   path: '/lineup',
  //   element: <FantasyLineup />
  // },
  {
    path: 'fantasy',
    element: <FantasyPLUI />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
