import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { RefreshStatus, ApiResponse } from '@/types';

export const useRefreshStatus = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['refresh', 'status'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RefreshStatus>>('/refresh/status');
      return data.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      await api.post('/refresh/trigger');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refresh', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'recommended'] });
    },
  });

  return {
    ...query,
    triggerRefresh: triggerMutation.mutateAsync,
    isTriggering: triggerMutation.isPending,
  };
};

