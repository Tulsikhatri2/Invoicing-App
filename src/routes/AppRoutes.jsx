import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import DataList from '../pages/DataList'
import Invoices from '../pages/Invoices'
import InvoiceEditor from '../components/InvoiceEditor'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/items"
          element={
            <PrivateRoute>
              <DataList />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <Invoices />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoice/editor"
          element={
            <PrivateRoute>
              <InvoiceEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/edit/:id"
          element={
            <PrivateRoute>
              <InvoiceEditor />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/items" replace />} />
        <Route path="*" element={<Navigate to="/items" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
