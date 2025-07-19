import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  nickname: string | null;
  uid: string | null;
  email: string | null;
  displayName?: string;
  token: string | null;
}

const initialState: UserState = {
  nickname: "",
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
    setNickName: (state , action) => {
      state.nickname = action.payload
    }
  },
});

export const { setUser, clearUser, setNickName } = authSlice.actions;
export default authSlice.reducer;
