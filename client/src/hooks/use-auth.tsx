import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { User, USER_ROLES, InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  role: string | null;
  isHR: boolean;
  isDirector: boolean;
  isTechnicalInterviewer: boolean;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

type LoginData = {
  username: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<string | null>(null);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"],
    onSuccess: (data) => {
      if (data) {
        setRole(data.role);
      } else {
        setRole(null);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      setRole(userData.role);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      setRole(userData.role);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      setRole(null);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        role,
        isHR: role === USER_ROLES.HR,
        isDirector: role === USER_ROLES.DIRECTOR,
        isTechnicalInterviewer: role === USER_ROLES.TECHNICAL_INTERVIEWER,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}