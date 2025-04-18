export interface AuthState {
  isAuthenticated: boolean;
  sessionId: string | null;
  username: string | null;
  userId: string | null;
  roles: string[];
}
