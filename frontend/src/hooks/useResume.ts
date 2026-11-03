import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CandidateProfile, ApiResponse } from '@/types';

export const useProfile = () => {
  return useQuery({
    queryKey: ['resume', 'profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ profile: CandidateProfile }>>('/resumes/profile');
      return data.data.profile;
    },
    retry: 1,
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post<ApiResponse<{ profile: CandidateProfile }>>(
        '/resumes/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'recommended'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<CandidateProfile>) => {
      const { data } = await api.patch<ApiResponse<{ profile: CandidateProfile }>>(
        '/resumes/profile',
        updates,
      );
      return data.data.profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'recommended'] });
    },
  });
};

