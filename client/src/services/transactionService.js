import api from "./api";

export const issueBook = (data) => {
  return api.post("/v1/transactions", data);
};
