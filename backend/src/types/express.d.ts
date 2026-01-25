// src/types/express.d.ts
export interface UserPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

declare namespace Express {
  interface Request {
    user?: UserPayload;
  }
}