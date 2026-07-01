import { createSlice } from "@reduxjs/toolkit";
import { registerUser, loginUser, requestOtpLogin, getCurrentUser, logoutUser, verifyOtp } from "./authThunks";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  loading: false,
  error: null,
  isAuthenticated: false,
  requires2FA: false,
  pendingEmail: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOAuthTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    }
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.data;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.requires2FA) {
        state.requires2FA = true;
        state.pendingEmail = action.payload.email;
      } else {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Request OTP Login
    builder.addCase(requestOtpLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(requestOtpLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.requires2FA = true; // Show OTP screen
      state.pendingEmail = action.payload.email;
    })
    .addCase(requestOtpLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.requires2FA = false;
      state.pendingEmail = null;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.data;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    })
    .addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.data;
      state.isAuthenticated = true;
    })
    .addCase(getCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.requires2FA = false;
      state.pendingEmail = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    });
  }
});

export const { clearError, setOAuthTokens } = authSlice.actions;
export default authSlice.reducer;
