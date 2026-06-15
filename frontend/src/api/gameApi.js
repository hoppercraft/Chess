import axios from 'axios'

const BASE = '/api/games'

const api = axios.create()

api.interceptors.request.use(config => {
  const token = localStorage.getItem('chess_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chess_token')
      localStorage.removeItem('chess_refresh')
    }
    return Promise.reject(err)
  },
)

export const gameApi = {
  async saveGame(payload) {
    const { data } = await api.post(`${BASE}/`, payload)
    return data
  },

  async getMyGames() {
    const { data } = await api.get(`${BASE}/my/`)
    return data
  },

  async getGame(id) {
    const { data } = await api.get(`${BASE}/${id}/`)
    return data
  },
}