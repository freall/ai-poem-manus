type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const LOCAL_USER = {
  id: 1,
  name: "本地学习者",
  email: "纯前端模式",
  loginMethod: "local",
};

export function useAuth(_options?: UseAuthOptions) {
  return {
    user: LOCAL_USER,
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: async () => LOCAL_USER,
    logout: async () => undefined,
  };
}
