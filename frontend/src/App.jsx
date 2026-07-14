import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './styles/board.css'
import Navbar      from './components/common/Navbar.jsx'
import Dashboard   from './pages/Dashboard.jsx'
import PlayLocal   from './pages/PlayLocal.jsx'
import PlayEngine  from './pages/PlayEngine.jsx'
import Login       from './pages/Login.jsx'
import Register    from './pages/Register.jsx'
import Profile     from './pages/Profile.jsx'
import NotFound    from './pages/NotFound.jsx'
import ScrollToTop from './components/common/ScrollToTop.jsx'
import OnlineLobby from './pages/OnlineLobby.jsx'
import PlayOnline  from './pages/PlayOnline.jsx'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const showBack = location.pathname !== '/'

  return (
    <>
      <Navbar onBack={showBack ? () => navigate(-1) : undefined} />
      <ScrollToTop />
      <Routes>
        <Route path="/"                       element={<Dashboard />} />
        <Route path="/play/local"             element={<PlayLocal />} />
        <Route path="/play/engine"            element={<PlayEngine />} />
        <Route path="/login"                  element={<Login />} />
        <Route path="/register"               element={<Register />} />
        <Route path="/profile"                element={<Profile />} />
        <Route path="/play/online"            element={<OnlineLobby />} />
        <Route path="/play/online/:roomCode"  element={<PlayOnline />} />
        <Route path="*"                       element={<NotFound />} />
      </Routes>
    </>
  )
}