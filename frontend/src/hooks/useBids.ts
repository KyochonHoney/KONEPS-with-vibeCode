import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Bid, BidsResponse } from '../types/bid';

interface GetBidsParams {
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const useBids = (params: GetBidsParams) => {
  const queryClient = useQueryClient();

  const getBids = async (): Promise<BidsResponse> => {
    const response = await api.get('/bids', { params });
    return response.data;
  };

  const { data, isLoading, error } = useQuery<BidsResponse, Error>(
    ['bids', params],
    getBids,
    {
      keepPreviousData: true, // Keep previous data while fetching new data
    }
  );

  const toggleStar = useMutation<
    { starred: boolean }, // Response type
    Error, // Error type
    string, // Bid ID type (variable passed to mutate)
    { previousBids: BidsResponse | undefined } // Snapshot of the previous data
  >(
    async (bidId) => {
      const response = await api.post(`/bids/${bidId}/star`);
      return response.data;
    },
    {
      onMutate: async (bidId) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['bids', params]);

        // Snapshot the previous value
        const previousBids = queryClient.getQueryData<BidsResponse>(['bids', params]);

        // Optimistically update to the new value
        queryClient.setQueryData<BidsResponse>(['bids', params], (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((bid) =>
              bid.id === bidId ? { ...bid, starred: !bid.starred } : bid
            ),
          };
        });

        return { previousBids };
      },
      onError: (err, bidId, context) => {
        // If the mutation fails, use the context we returned from onMutate to roll back
        queryClient.setQueryData(['bids', params], context?.previousBids);
        // Optionally, show an error message to the user
        console.error('Failed to toggle star:', err);
      },
      onSettled: () => {
        // Always refetch after error or success:
        queryClient.invalidateQueries(['bids', params]);
      },
    }
  );

  return {
    bids: data?.items || [],
    pageInfo: data?.pageInfo,
    isLoading,
    error,
    toggleStar,
  };
};