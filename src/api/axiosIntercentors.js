import axios from 'axios'
import store from '../Redux/store'
import { logout } from '../Redux/slices/auth/authSlice'

const api = axios.create({
  baseURL: 'https://alitinvoiceappapi.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const tokenExpiry = localStorage.getItem('tokenExpiry')

    if (token && tokenExpiry) {
      const now = new Date().getTime()
      if (now > parseInt(tokenExpiry, 10)) {
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExpiry')
        store.dispatch(logout())
        return Promise.reject(new Error("Token expired"))
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    if (config.responseType === 'blob') {
      delete config.headers['Content-Type']
      config.headers.Accept = 'image/jpeg, image/png, image/gif, image/webp, image/*, */*;q=0.8'
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data instanceof Blob) {
      try {
        error.response.data = await error.response.data.text()
      } catch (error) {
        console.error("Error:", error)
      }
    }

    if (error.response?.status === 401) {
      store.dispatch(logout())
    }
    return Promise.reject(error)
  }
)

export default api
