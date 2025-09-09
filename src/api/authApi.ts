import httpClient from "./httpClient";
import type { AuthResponse, LoginRequest, SignupRequest, User } from "../types/auth";

// Signup user
export const signup = async (userData: SignupRequest): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>("/auth/signup", userData);
  if (!response.data?.data?.user || !response.data?.data?.token) {
    throw new Error(response.data?.message || "Signup failed");
  }
  return response.data;
};

// Login user
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>("/auth/login", credentials);
  if (!response.data?.data?.user || !response.data?.data?.token) {
    throw new Error(response.data?.message || "Login failed");
  }
  return response.data;
};

// Get logged-in user profile
export const getProfile = async (): Promise<User> => {
  const response = await httpClient.get<AuthResponse>("/auth/profile");
  if (!response.data?.data?.user) {
    throw new Error(response.data?.message || "User not found");
  }
  return response.data.data.user;
};

// Logout user (optional if handled client-side only)
export const logout = async (): Promise<void> => {
  await httpClient.post("/auth/logout");
};
