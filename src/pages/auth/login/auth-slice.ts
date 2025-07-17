import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  uid: string | null;
  email: string | null;
  displayName?: string;
  token: string | null;
}

const initialState: UserState = {
  uid: null,
  email: null,
  displayName: "",
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ uid: string; email: string | null; displayName: string; token: string }>
    ) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.uid = null;
      state.email = null;
      state.displayName = "";
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
