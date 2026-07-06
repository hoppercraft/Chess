import axios from 'axios'

const BASE = '/api/auth'

export const authApi = {
  async register(username, email, password, password2) {
    const { data } = await axios.post(`${BASE}/register/`, { username, email, password, password2 })
    return data
  },

  async login(email, password) {
    const { data } = await axios.post(`${BASE}/login/`, { email, password })
    return data
  },

  async me(token) {
    const { data } = await axios.get(`${BASE}/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async logout(refreshToken) {
    const token = localStorage.getItem('chess_token')
    const { data } = await axios.post(
      `${BASE}/logout/`,
      { refresh: refreshToken },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    )
    return data
  },
}