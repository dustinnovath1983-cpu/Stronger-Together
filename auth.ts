import { User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const authStorage = {
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem('relationshipwise_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  
  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('relationshipwise_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('relationshipwise_user');
    }
  }
};
