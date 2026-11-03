import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Recommendation, JobPosting, SavedJob, ApiResponse } from '@/types';

export const useRecommendedJobs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['jobs', 'recommended', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ recommendations: Recommendation[] }>>(
        `/jobs/recommended?page=${page}&limit=${limit}`,
      );
      return data;
    },
  });
};

export const useJobsByPlatform = (platform: string) => {
  return useQuery({
    queryKey: ['jobs', 'platform', platform],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ recommendations: Recommendation[]; platform: string }>>(
        `/jobs/platform/${platform}`,
      );
      return data.data;
    },
    enabled: !!platform,
  });
};

export const useJobDetails = (jobId: string) => {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ job: JobPosting; recommendation?: Recommendation; isSaved: boolean }>
      >(`/jobs/${jobId}`);
      return data.data;
    },
    enabled: !!jobId,
  });
};

export const useSavedJobs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['jobs', 'saved', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ savedJobs: SavedJob[] }>>(
        `/jobs/saved?page=${page}&limit=${limit}`,
      );
      return data;
    },
  });
};

export const useToggleSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, notes }: { jobId: string; notes?: string }) => {
      const { data } = await api.post<ApiResponse<{ saved: boolean }>>(`/jobs/${jobId}/save`, { notes });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'recommended'] });
    },
  });
};

