import { configureStore } from "@reduxjs/toolkit"
import userSlice from './userSlicer.jsx'
const store = configureStore({
  reducer: {
    user: userSlice, // This creates store.user.isLoading
  },
})

export default store
