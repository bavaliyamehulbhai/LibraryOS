import api from "./api";

export const getRoles = async () => {
  const { data } = await api.get("/v1/roles");
  return data;
};

export const getPermissions = async () => {
  const { data } = await api.get("/v1/roles/permissions");
  return data;
};

export const createRole = async (roleData) => {
  const { data } = await api.post("/v1/roles", roleData);
  return data;
};

export const updateRole = async (id, roleData) => {
  const { data } = await api.put(`/v1/roles/${id}`, roleData);
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await api.delete(`/v1/roles/${id}`);
  return data;
};

export const assignRole = async (userId, roleId) => {
  const { data } = await api.post(`/v1/roles/assign/${userId}`, { roleId });
  return data;
};
