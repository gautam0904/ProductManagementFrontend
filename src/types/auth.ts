export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    createdAt?: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface SignupRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    message: string;
    data: {
      token: string;
      user: User;
    };
  }