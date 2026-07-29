export interface LoginRequest { email: string; password: string; rememberMe?: boolean; }
export interface RegisterRequest { username: string; email: string; password: string; }
export interface AuthResponse { user: { id: string; username: string; email: string; avatar?: string; rank: number; coins: number; gems: number }; accessToken: string; refreshToken: string; }

export const authApi = {
  login: async (req: LoginRequest): Promise<AuthResponse> => {
    // Mock API response with 400ms latency
    await new Promise((r) => setTimeout(r, 400));
    if (req.email === "error@ludo.com") throw new Error("Invalid credentials provided.");
    return {
      user: { id: "u_101", username: req.email.split("@")[0] || "Ludo Master", email: req.email, rank: 42, coins: 150000, gems: 450 },
      accessToken: "mock_access_jwt_token_" + Date.now(),
      refreshToken: "mock_refresh_jwt_token_" + Date.now()
    };
  },
  register: async (req: RegisterRequest): Promise<AuthResponse> => {
    await new Promise((r) => setTimeout(r, 400));
    return {
      user: { id: "u_102", username: req.username, email: req.email, rank: 1, coins: 10000, gems: 100 },
      accessToken: "mock_access_jwt_token_" + Date.now(),
      refreshToken: "mock_refresh_jwt_token_" + Date.now()
    };
  },
  logout: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
  },
  refreshToken: async (token: string): Promise<string> => {
    return "refreshed_access_jwt_token_" + Date.now();
  }
};
