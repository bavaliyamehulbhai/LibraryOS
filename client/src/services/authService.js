import api from "./api";

export const registerUser = (data) => {
  return api.post("/v1/auth/register", data);
};

export const loginUser = (data) => {
  return api.post("/v1/auth/login", data);
};

export const verifyOtp = (data) => {
  return api.post("/v1/auth/verify-otp", data);
};

export const requestOtpLogin = (data) => {
  return api.post("/v1/auth/request-otp-login", data);
};

export const getCurrentUser = () => {
  return api.get("/v1/auth/me");
};

export const logoutUser = () => {
  const refreshToken = localStorage.getItem("refreshToken");
  return api.post("/v1/auth/logout", { refreshToken });
};

export const setup2FA = () => {
  return api.post("/v1/auth/2fa/setup");
};

export const verify2FASetup = (data) => {
  return api.post("/v1/auth/2fa/verify-setup", data);
};

export const getPasskeyRegisterOptions = () => {
  return api.get("/v1/auth/passkey/register/options");
};

export const verifyPasskeyRegistration = (data) => {
  return api.post("/v1/auth/passkey/register/verify", data);
};

export const getPasskeyLoginOptions = (data) => {
  return api.post("/v1/auth/passkey/login/options", data);
};

export const verifyPasskeyLogin = (data) => {
  return api.post("/v1/auth/passkey/login/verify", data);
};

export const forgotPassword = (data) => {
  return api.post("/v1/auth/forgot-password", data);
};

export const resetPassword = (data) => {
  return api.post("/v1/auth/reset-password", data);
};
