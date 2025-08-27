import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { BidDetail } from '../types/bidDetail';

export const useBidDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const getBidDetail = async (): Promise<BidDetail> => {
    if (!id) throw new Error('Bid ID is required');
    const response = await api.get(`/bids/${id}`);
    return response.data;
  };

  const { data, isLoading, error } = useQuery<BidDetail, Error>(
    ['bidDetail', id],
    getBidDetail,
    {
      enabled: !!id, // Only run query if id is available
    }
  );

  const toggleStar = useMutation<
    { starred: boolean }, // Response type
    Error, // Error type
    string, // Bid ID type (variable passed to mutate)
    { previousBidDetail: BidDetail | undefined } // Snapshot of the previous data
  >(
    async (bidId) => {
      const response = await api.post(`/bids/${bidId}/star`);
      return response.data;
    },
    {
      onMutate: async (bidId) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['bidDetail', bidId]);

        // Snapshot the previous value
        const previousBidDetail = queryClient.getQueryData<BidDetail>(['bidDetail', bidId]);

        // Optimistically update to the new value
        queryClient.setQueryData<BidDetail>(['bidDetail', bidId], (old) => {
          if (!old) return old;
          return { ...old, starred: !old.starred };
        });

        return { previousBidDetail };
      },
      onError: (err, bidId, context) => {
        // If the mutation fails, use the context we returned from onMutate to roll back
        queryClient.setQueryData(['bidDetail', bidId], context?.previousBidDetail);
        // Optionally, show an error message to the user
        console.error('Failed to toggle star:', err);
      },
      onSettled: (data, error, variables, context) => {
        // Invalidate and refetch the bidDetail query to ensure consistency
        queryClient.invalidateQueries(['bidDetail', variables]);
        // Also invalidate the bids list query to update the starred status there
        queryClient.invalidateQueries(['bids']);
      },
    }
  );

  return {
    bidDetail: data,
    isLoading,
    error,
    toggleStar,
  };
};