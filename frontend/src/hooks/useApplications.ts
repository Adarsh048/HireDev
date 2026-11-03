import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Application, ApiResponse } from '@/types';

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ applications: Application[] }>>('/applications');
      return data.data.applications;
    },
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { jobId: string; status?: string; notes?: string }) => {
      const { data } = await api.post<ApiResponse<{ application: Application }>>(
        '/applications',
        payload,
      );
      return data.data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { status?: string; notes?: string };
    }) => {
      const { data } = await api.patch<ApiResponse<{ application: Application }>>(
        `/applications/${id}`,
        updates,
      );
      return data.data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

