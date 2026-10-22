import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, fetchProducts, fetchUsers } from "./api";
export function useProducts(searchTerm) {
  return useQuery({
    queryKey: ["products", { search: searchTerm }],
    queryFn: () => fetchProducts(searchTerm),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["users"] });
      const previousUsers = qc.getQueryData(["users"]);
      qc.setQueryData(["users"], (old) =>
        old?.filter((user) => user.id !== id),
      );
      return { previousUsers };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousUsers) qc.setQueryData(["users"], ctx.previousUsers);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
