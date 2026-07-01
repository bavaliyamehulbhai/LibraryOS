import { createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser as registerApi, loginUser as loginApi, verifyOtp as verifyOtpApi, requestOtpLogin as requestOtpLoginApi, getCurrentUser as getMeApi, logoutUser as logoutApi } from "../../../services/authService";

export const registerUser = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  try {
    const response = await registerApi(data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration Failed");
  }
});

export const requestOtpLogin = createAsyncThunk("auth/requestOtpLogin", async (data, thunkAPI) => {
  try {
    const response = await requestOtpLoginApi(data);
    return response.data; // { success, message, email }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "OTP Request Failed");
  }
});

export const loginUser = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const response = await loginApi(data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login Failed");
  }
});

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (data, thunkAPI) => {
  try {
    const response = await verifyOtpApi(data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "OTP Verification Failed");
  }
});

export const getCurrentUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const response = await getMeApi();
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await logoutApi();
  } catch (error) {
    console.error("Logout error detailed:", error.response?.data?.message || error.message);
  }
});
