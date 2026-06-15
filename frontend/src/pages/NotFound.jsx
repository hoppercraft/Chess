import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-inner">
        <span className="notfound-icon">♟</span>
        <h2 className="notfound-title">404</h2>
        <p className="notfound-sub">This square is off the board.</p>
        <Link to="/" className="notfound-btn">← Back to Dashboard</Link>
      </div>
    </div>
  )
}