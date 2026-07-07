import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("chess_token");

        const res = await axios.get(
          "http://localhost:8000/api/auth/me/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(res.data.user);
      } catch (err) {
        console.log("Profile fetch failed:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div style={{ color: "white" }}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-wrapper">
        <div style={{ color: "#ef4444" }}>
          Failed to load profile.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">

        <div className="profile-left">
          <div className="avatar-circle">
            {profile.username?.[0]?.toUpperCase()}
          </div>

          <h2 className="username">{profile.username}</h2>

          <p className="subtext">{profile.email}</p>

          <div className="rating-block">
            <div className="rating-label">Rating</div>
            <div className="rating">
              {profile.rating}
            </div>
          </div>
        </div>

        <div className="profile-right">

          <h3 className="section-title">Statistics</h3>

          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-label">Games Played</div>
              <div className="stat-value">
                {profile.games_played}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">
                {profile.games_played
                  ? Math.round(
                      (profile.games_won / profile.games_played) * 100
                    )
                  : 0}
                %
              </div>
            </div>

            <div className="stat-card win">
              <div className="stat-label">Wins</div>
              <div className="stat-value">{profile.games_won}</div>
            </div>

            <div className="stat-card loss">
              <div className="stat-label">Losses</div>
              <div className="stat-value">{profile.games_lost}</div>
            </div>

            <div className="stat-card draw">
              <div className="stat-label">Draws</div>
              <div className="stat-value">{profile.games_drawn}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}