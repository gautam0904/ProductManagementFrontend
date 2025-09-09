import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { login as loginApi, signup as signupApi, getProfile as getProfileApi } from "../../api/authApi";
import type { AuthResponse, LoginRequest, SignupRequest, User } from "../../types/auth";

// Define RootState type since we can't import it directly
type RootState = {
  auth: {
    token: string | null;
  };
};

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Signup thunk
export const signupUser = createAsyncThunk<AuthResponse, SignupRequest>(
  "auth/signup",
  async (payload: SignupRequest, { rejectWithValue }) => {
    try {
      return await signupApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

// Login thunk
export const loginUser = createAsyncThunk<AuthResponse, LoginRequest>(
  "auth/login",
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      return await loginApi(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Get logged-in user profile
export const getProfile = createAsyncThunk<User, void, { state: RootState }>(
  'auth/getProfile',
  async (_, { getState }) => {
    const { token } = getState().auth;
    if (!token) {
      throw new Error('No token found');
    }
    // The getProfileApi already returns the user directly
    return await getProfileApi();
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.data?.user || null;
        state.token = action.payload.data?.token || null;
        if (action.payload.data?.token) {
          localStorage.setItem("token", action.payload.data.token);
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.data?.user || null;
        state.token = action.payload.data?.token || null;
        if (action.payload.data?.token) {
          localStorage.setItem("token", action.payload.data.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
