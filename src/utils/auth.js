export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  const tokenExpiry = localStorage.getItem('tokenExpiry')

  if (!token) return false

  if (tokenExpiry) {
    const now = Date.now()
    if (now > parseInt(tokenExpiry, 10)) {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiry')
      return false
    }
  }

  return true
}
