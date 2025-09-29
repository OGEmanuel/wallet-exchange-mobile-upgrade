import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  user: UserModel | null,
}

const initialState: State = {
  user: null,
}

export const kycSlice = createSlice({
  name: "kyc",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserModel>) => {
      state.user = action.payload;
    },
  },
});

export const kycActions = kycSlice.actions;
export default kycSlice.reducer;