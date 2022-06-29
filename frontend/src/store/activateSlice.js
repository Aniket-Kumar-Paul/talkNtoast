import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    name: '',
    avatar: ''
}

export const activateSlice = createSlice({
  name: 'activate',
  initialState,
  reducers: {
    setName: (state, action) => { // action will have data
      state.name = action.payload
    },
    setAvatar: (state, action) => {
      state.avatar = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setName, setAvatar} = activateSlice.actions

export default activateSlice.reducer