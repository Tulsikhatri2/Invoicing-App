import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth/authSlice'
import dataReducer from "./slices/data/dataSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
  },
})

export default store
