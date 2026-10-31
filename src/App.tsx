import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TvPage from './pages/TvPage'
import TvWatchPage from './pages/TvWatchPage'
import SportsPage from './pages/SportsPage'
import FixturePage from './pages/FixturePage'
import MoviesPage from './pages/MoviesPage'
import MovieWatchPage from './pages/MovieWatchPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import WatchlistPage from './pages/WatchlistPage'
import InstallBanner from './components/InstallBanner'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tv" element={<TvPage />} />
          <Route path="tv/watch/:id" element={<TvWatchPage />} />
          <Route path="sports" element={<SportsPage />} />
          <Route path="sports/fixture/:id" element={<FixturePage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="movies/watch/:identifier" element={<MovieWatchPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
        </Route>
      </Routes>
      <InstallBanner />
    </>
  )
}
