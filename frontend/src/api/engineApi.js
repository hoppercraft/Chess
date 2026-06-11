import axios from 'axios'

const BASE = '/api/engine'

export const engineApi = {
  async validateMove(fen, from, to) {
    const { data } = await axios.post(`${BASE}/validate`, { fen, from, to })
    return data
  },

  async bestMove(fen, depth = 3) {
    const { data } = await axios.post(`${BASE}/best`, { fen, depth })
    return data
  },
}