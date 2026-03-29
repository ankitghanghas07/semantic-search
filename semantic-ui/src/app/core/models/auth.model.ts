export interface User { id: string; email: string; }
export interface AuthResponse { token: string; }
export interface RegisterResponse { user: User; }
export interface LoginRequest { email: string; password: string; }