import { useState } from "react";
import { authApi, LoginRequest, RegisterRequest } from "../api/auth.api";
import { tokenService } from "../services/token.service";
import { useUserStore } from "../../user/user.store";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, setUser, logout: clearUserStore } = useUserStore();

  const login = async (req: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(req);
      tokenService.setAccessToken(res.accessToken);
      tokenService.setRefreshToken(res.refreshToken);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (req: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(req);
      tokenService.setAccessToken(res.accessToken);
      tokenService.setRefreshToken(res.refreshToken);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      tokenService.clearTokens();
      clearUserStore();
      setIsLoading(false);
    }
  };

  return { user, isAuthenticated, isLoading, error, login, register, logout };
};
