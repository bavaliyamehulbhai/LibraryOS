export const selectUser = (state) => state.auth.user;
export const selectLoading = (state) => state.auth.loading;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectError = (state) => state.auth.error;
