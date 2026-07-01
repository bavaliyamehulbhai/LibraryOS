import api from "./api";

export const getStudents = () => {
  return api.get("/v1/students");
};
