import jwt from 'jsonwebtoken';
import { config } from '../config';

export const signJwt = (payload: object) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
