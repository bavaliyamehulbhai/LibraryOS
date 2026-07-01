import api from "./api";

export const initiateAccessReview = () => {
  return api.post("/v1/governance/access-reviews/initiate");
};

export const getAccessReviews = () => {
  return api.get("/v1/governance/access-reviews");
};

export const approveAccessReview = (data) => {
  return api.post("/v1/governance/access-reviews/approve", data);
};

export const requestAccess = (data) => {
  return api.post("/v1/governance/access-requests", data);
};

export const approveAccessRequest = (data) => {
  return api.post("/v1/governance/access-requests/approve", data);
};
