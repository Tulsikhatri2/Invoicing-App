import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isAuthenticated } from '../utils/auth'

const PublicRoute = ({ children }) => {
  const token = useSelector((state) => state.auth?.token)

  if (token || isAuthenticated()) {
    return <Navigate to="/items" replace />
  }

  return children
}

export default PublicRoute
