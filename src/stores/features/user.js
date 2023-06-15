import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullName: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  pk: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setFullName: (state, action) => {
      state.fullName = action.payload;
    },
    setUserEmail: (state, action) => {
      state.email = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
  },
});

export const { setFullName, setUserEmail, setPassword } = userSlice.actions;
export default userSlice.reducer;
