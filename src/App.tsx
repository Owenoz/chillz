import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TvPage from './pages/TvPage'
import TvWatchPage from './pages/TvWatchPage'
import SportsPage from './pages/SportsPage'
import FixturePage from './pages/FixturePage'
import MoviesPage from './pages/MoviesPage'
import MovieWatchPage from './pages/MovieWatchPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tv" element={<TvPage />} />
        <Route path="tv/watch/:id" element={<TvWatchPage />} />
        <Route path="sports" element={<SportsPage />} />
        <Route path="sports/fixture/:id" element={<FixturePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/watch/:tmdbId" element={<MovieWatchPage />} />
      </Route>
    </Routes>
  )
}
