import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { FaSignOutAlt } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../Redux/slices/auth/authSlice'

const LogoutButton = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogoutConfirm = () => {
    setOpen(false)
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FaSignOutAlt size={14} />}
        onClick={() => setOpen(true)}
        sx={{
          color: '#555',
          borderColor: '#e0e0e0',
          backgroundColor: '#fff',
          textTransform: 'none',
          borderRadius: '6px',
          px: 2,
          py: 0.75,
          '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#ccc' },
        }}
      >
        Logout
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm logout</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#666' }}>
            Are you sure you want to log out? You will need to sign in again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: '#444',
              '&:hover': { backgroundColor: '#333' },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LogoutButton
