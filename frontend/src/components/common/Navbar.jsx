import { Link, useNavigate } from "react-router-dom";


export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* LEFT: BRAND */}
      <div className="nav-left">
        <Link to="/" className="logo">
          ♟ ChessApp
        </Link>
      </div>

      {/* CENTER: NAV LINKS */}
      <div className="nav-center">

        <Link to="/" className="nav-link">
          Dashboard
        </Link>

        <Link to="/play/local" className="nav-link">
          Play Local
        </Link>

        <Link to="/play/engine" className="nav-link">
          Play AI
        </Link>

        {token && (
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
        )}

      </div>

      {/* RIGHT: ACTIONS */}
      <div className="nav-right">

        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {!token ? (
          <>
            <Link to="/login" className="nav-btn">
              Login
            </Link>

            <Link to="/register" className="nav-btn primary">
              Sign Up
            </Link>
          </>
        ) : (
          <button className="nav-btn danger" onClick={handleLogout}>
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}