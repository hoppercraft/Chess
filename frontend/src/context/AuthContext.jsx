import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const tokenKey = "chess_token";
  const refreshKey = "chess_refresh";

  // 🔄 AUTO LOGIN ON REFRESH
  useEffect(() => {
    const token = localStorage.getItem(tokenKey);

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔐 LOGIN
  async function login(email, password) {
    const data = await authApi.login(email, password);

    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(refreshKey, data.refresh);

    const me = await authApi.me(data.token);
    setUser(me.user);

    return data;
  }

  // 📝 REGISTER
  async function register(username, email, password, password2) {
    const data = await authApi.register(
      username,
      email,
      password,
      password2
    );

    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(refreshKey, data.refresh);

    const me = await authApi.me(data.token);
    setUser(me.user);

    return data;
  }

  // 🚪 LOGOUT
  function logout() {
    const refresh = localStorage.getItem(refreshKey);

    if (refresh) {
      authApi.logout(refresh).catch(() => {});
    }

    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}