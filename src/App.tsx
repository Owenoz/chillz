import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import TvPage from './pages/TvPage'
import TvWatchPage from './pages/TvWatchPage'
import SportsPage from './pages/SportsPage'
import FixturePage from './pages/FixturePage'
import MoviesPage from './pages/MoviesPage'
import TMDBWatchPage from './pages/TMDBWatchPage'
import LugaWatchPage from './pages/LugaWatchPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import WatchlistPage from './pages/WatchlistPage'
import InstallBanner from './components/InstallBanner'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
          <Route path="tv" element={<ErrorBoundary><TvPage /></ErrorBoundary>} />
          <Route path="tv/watch/:id" element={<ErrorBoundary><TvWatchPage /></ErrorBoundary>} />
          <Route path="sports" element={<ErrorBoundary><SportsPage /></ErrorBoundary>} />
          <Route path="sports/fixture/:id" element={<ErrorBoundary><FixturePage /></ErrorBoundary>} />
          <Route path="movies" element={<ErrorBoundary><MoviesPage /></ErrorBoundary>} />
          <Route path="movies/tmdb/:id" element={<ErrorBoundary><TMDBWatchPage /></ErrorBoundary>} />
          <Route path="movies/luga/:id" element={<ErrorBoundary><LugaWatchPage /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
          <Route path="checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
          <Route path="watchlist" element={<ErrorBoundary><WatchlistPage /></ErrorBoundary>} />
        </Route>
      </Routes>
      <InstallBanner />
    </>
  )
}
