import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User, ApiResponse } from '@/types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, setUser, setLoading } = useAuthStore();

  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        setUser(data.data.user);
        return data.data.user;
      } catch (err) {
        setUser(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<{ user: User; tokens: { accessToken: string } }>>(
        '/auth/login',
        credentials,
      );
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      setUser(data.data.user);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; name?: string }) => {
      const { data } = await api.post<ApiResponse<{ user: User; tokens: { accessToken: string } }>>(
        '/auth/register',
        payload,
      );
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      setUser(data.data.user);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
      localStorage.removeItem('accessToken');
      setUser(null);
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });

  return {
    user,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
};

