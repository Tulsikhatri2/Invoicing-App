import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { isAuthenticated } from '../utils/auth'
import { logout } from '../Redux/slices/auth/authSlice'

const PrivateRoute = ({ children }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const authed = isAuthenticated()

  useEffect(() => {
    if (!authed) {
      dispatch(logout())
    }
  }, [authed, dispatch])

  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
