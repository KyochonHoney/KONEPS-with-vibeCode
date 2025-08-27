import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Bid, BidsResponse } from '../types/bid';

interface GetFavoritesParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const useFavorites = (params: GetFavoritesParams) => {
  const queryClient = useQueryClient();

  const getFavorites = async (): Promise<BidsResponse> => {
    const response = await api.get('/favorites', { params });
    return response.data;
  };

  const { data, isLoading, error } = useQuery<BidsResponse, Error>(
    ['favorites', params],
    getFavorites,
    {
      keepPreviousData: true,
    }
  );

  const toggleStar = useMutation<
    { starred: boolean },
    Error,
    string,
    { previousFavorites: BidsResponse | undefined }
  >(
    async (bidId) => {
      const response = await api.post(`/bids/${bidId}/star`);
      return response.data;
    },
    {
      onMutate: async (bidId) => {
        await queryClient.cancelQueries(['favorites', params]);
        const previousFavorites = queryClient.getQueryData<BidsResponse>(['favorites', params]);

        queryClient.setQueryData<BidsResponse>(['favorites', params], (old) => {
          if (!old) return old;
          // Remove the bid from the list if it was starred and now unstarred
          const updatedItems = old.items.filter((bid) => bid.id !== bidId);
          return {
            ...old,
            items: updatedItems,
            pageInfo: { ...old.pageInfo, total: old.pageInfo.total - 1 }, // Decrement total count
          };
        });

        return { previousFavorites };
      },
      onError: (err, bidId, context) => {
        queryClient.setQueryData(['favorites', params], context?.previousFavorites);
        console.error('Failed to toggle star in favorites:', err);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['favorites', params]);
        queryClient.invalidateQueries(['bids']); // Also invalidate general bids list
      },
    }
  );

  return {
    favorites: data?.items || [],
    pageInfo: data?.pageInfo,
    isLoading,
    error,
    toggleStar,
  };
};
