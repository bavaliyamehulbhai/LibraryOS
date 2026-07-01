export const ROUTES = {
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    UNAUTHORIZED: "/unauthorized"
  },
  PROTECTED: {
    DASHBOARD: "/dashboard",
    BOOKS: "/books",
    STUDENTS: "/students",
    TRANSACTIONS: "/transactions",
    REPORTS: "/reports",
    SETTINGS: "/settings"
  },
  ROLE_SPECIFIC: {
    REPORTS: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN"],
    SETTINGS: ["SUPER_ADMIN", "LIBRARY_ADMIN"],
    TRANSACTIONS: ["SUPER_ADMIN", "LIBRARY_ADMIN", "LIBRARIAN", "ASSISTANT"]
  }
};
