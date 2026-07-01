import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, getPermissions, createRole, updateRole, deleteRole, assignRole } from "../services/roleService";
import toast from "react-hot-toast";

export const useRoles = () => useQuery({
  queryKey: ["roles"],
  queryFn: getRoles
});

export const usePermissions = () => useQuery({
  queryKey: ["permissions"],
  queryFn: getPermissions
});

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Role created successfully");
      queryClient.invalidateQueries(["roles"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create role");
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleData }) => updateRole(id, roleData),
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries(["roles"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries(["roles"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }) => assignRole(userId, roleId),
    onSuccess: () => {
      toast.success("Role assigned successfully");
      queryClient.invalidateQueries(["roles"]);
      queryClient.invalidateQueries(["users"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to assign role");
    }
  });
};
