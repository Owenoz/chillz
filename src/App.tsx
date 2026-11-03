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
import RadioPage from './pages/RadioPage'
import ChurchPage from './pages/ChurchPage'
import NewsPage from './pages/NewsPage'
import UPLPage from './pages/UPLPage'
import NollywoodPage from './pages/NollywoodPage'
import MorePage from './pages/MorePage'
import InstallBanner from './components/InstallBanner'

const EB = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
)

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index                  element={<EB><HomePage /></EB>} />
          <Route path="tv"              element={<EB><TvPage /></EB>} />
          <Route path="tv/watch/:id"    element={<EB><TvWatchPage /></EB>} />
          <Route path="sports"          element={<EB><SportsPage /></EB>} />
          <Route path="sports/fixture/:id" element={<EB><FixturePage /></EB>} />
          <Route path="movies"          element={<EB><MoviesPage /></EB>} />
          <Route path="movies/tmdb/:id" element={<EB><TMDBWatchPage /></EB>} />
          <Route path="movies/luga/:id" element={<EB><LugaWatchPage /></EB>} />
          <Route path="radio"           element={<EB><RadioPage /></EB>} />
          <Route path="church"          element={<EB><ChurchPage /></EB>} />
          <Route path="news"            element={<EB><NewsPage /></EB>} />
          <Route path="upl"             element={<EB><UPLPage /></EB>} />
          <Route path="nollywood"       element={<EB><NollywoodPage /></EB>} />
          <Route path="profile"         element={<EB><ProfilePage /></EB>} />
          <Route path="checkout"        element={<EB><CheckoutPage /></EB>} />
          <Route path="watchlist"       element={<EB><WatchlistPage /></EB>} />
          <Route path="more"            element={<EB><MorePage /></EB>} />
        </Route>
      </Routes>
      <InstallBanner />
    </>
  )
}
