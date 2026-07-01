import api from "./api";

export const getTeamMembers = () => {
  return api.get("/v1/organizations/team");
};

export const getPendingInvites = () => {
  return api.get("/v1/organizations/invites");
};

export const inviteUser = (data) => {
  return api.post("/v1/organizations/invite", data);
};

export const acceptInvite = (data) => {
  return api.post("/v1/organization/accept-invite", data);
};
