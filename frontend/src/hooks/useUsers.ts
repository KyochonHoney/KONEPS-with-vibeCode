import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { User, UsersResponse } from '../types/user';

interface GetUsersParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

interface UpdateUserRolePayload {
  userId: string;
  nextRole: User['role'];
}

interface UpdateUserStatusPayload {
  userId: string;
  nextStatus: User['status'];
}

export const useUsers = (params: GetUsersParams) => {
  const queryClient = useQueryClient();

  const getUsers = async (): Promise<UsersResponse> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  };

  const { data, isLoading, error, refetch } = useQuery<UsersResponse, Error>(
    ['users', params],
    getUsers,
    {
      keepPreviousData: true,
    }
  );

  const mutateRole = useMutation<
    User, // Response type
    Error, // Error type
    UpdateUserRolePayload, // Variables type
    { previousUsers: UsersResponse | undefined } // Snapshot
  >(
    async ({ userId, nextRole }) => {
      const response = await api.patch(`/admin/users/${userId}`, { role: nextRole });
      return response.data;
    },
    {
      onMutate: async ({ userId, nextRole }) => {
        await queryClient.cancelQueries(['users', params]);
        const previousUsers = queryClient.getQueryData<UsersResponse>(['users', params]);

        queryClient.setQueryData<UsersResponse>(['users', params], (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((user) =>
              user.id === userId ? { ...user, role: nextRole } : user
            ),
          };
        });
        return { previousUsers };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(['users', params], context?.previousUsers);
        console.error('Failed to update user role:', err);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['users', params]);
      },
    }
  );

  const mutateStatus = useMutation<
    User, // Response type
    Error, // Error type
    UpdateUserStatusPayload, // Variables type
    { previousUsers: UsersResponse | undefined } // Snapshot
  >(
    async ({ userId, nextStatus }) => {
      const response = await api.patch(`/admin/users/${userId}`, { status: nextStatus });
      return response.data;
    },
    {
      onMutate: async ({ userId, nextStatus }) => {
        await queryClient.cancelQueries(['users', params]);
        const previousUsers = queryClient.getQueryData<UsersResponse>(['users', params]);

        queryClient.setQueryData<UsersResponse>(['users', params], (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((user) =>
              user.id === userId ? { ...user, status: nextStatus } : user
            ),
          };
        });
        return { previousUsers };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(['users', params], context?.previousUsers);
        console.error('Failed to update user status:', err);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['users', params]);
      },
    }
  );

  return {
    users: data?.items || [],
    pageInfo: data?.pageInfo,
    isLoading,
    error,
    refetch,
    mutateRole,
    mutateStatus,
  };
};