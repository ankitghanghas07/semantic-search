import jwt from 'jsonwebtoken';
import { config } from '../config';
// import { log } from 'console';

export const signJwt = (user: {userId : string, email : string}) => {
  return jwt.sign(user, config.jwtSecret, { expiresIn: '1h' });
};

export const verifyJwt = (token: string) => {
  const result = jwt.verify(token, process.env.JWT_SECRET!);
  // log("jwt verify result : ", result);
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
    email: string;
    iat: number;
    exp: number;
  };
}
