import { Routes, Route } from 'react-router-dom'
import './styles/board.css'

import Navbar     from './components/common/Navbar.jsx'
import Dashboard  from './pages/Dashboard.jsx'
import PlayLocal  from './pages/PlayLocal.jsx'
import PlayEngine from './pages/PlayEngine.jsx'
import Login      from './pages/Login.jsx'
import Register   from './pages/Register.jsx'
import Profile    from './pages/Profile.jsx'
import NotFound   from './pages/NotFound.jsx'

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/play/local"  element={<PlayLocal />} />
        <Route path="/play/engine" element={<PlayEngine />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/profile"     element={<Profile />} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
    </>
  )
}