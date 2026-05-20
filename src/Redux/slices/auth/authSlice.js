import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginUser, registerUser } from './authService'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    userSignupData: null,
    loading: false,
    success: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload?.token ?? null
      if (action.payload?.token) {
        localStorage.setItem('token', action.payload.token)
      }
      if (action.payload?.tokenExpiry != null) {
        localStorage.setItem('tokenExpiry', String(action.payload.tokenExpiry))
      }
    },
    logout: (state) => {
      state.token = null
      state.success = false
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiry')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state, action) => {
        state.loading = true
        state.success = false
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.userSignupData = action.payload
        state.success = true
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.success = false
      })
      .addCase(login.pending, (state, action) => {
        state.loading = true
        state.success = false
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.success = false
      })
  },
})

export const signupUser = createAsyncThunk(
  "USER/SIGNUP",
  async (signupData) => {
    try {
      const response = await registerUser(signupData)
      console.log("Registered succesfully");
      return response
    } catch (error) {
      console.error(error.response?.data?.message || error.message)
    }
  }
)

export const login = createAsyncThunk(
  "USER/LOGIN",
  async (loginData) => {
    try {
      const response = await loginUser(loginData)
      console.log("Logged in successfully")
      return response
    }
    catch (error) {
      console.error(error.response?.data?.message || error.message, {
        autoClose: 2000,
      })
    }
  }
)

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
