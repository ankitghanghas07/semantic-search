import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '../../models/User';
import { signJwt } from '../../utils/jwt';
import { log } from 'console';

export const registerUser = async (email : string, password : string) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash);
  const token = signJwt({userId : user.id , email : user.email});

  const { password_hash, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const loginUser = async (email : string, password : string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = signJwt({userId : user.id , email : user.email});

  const { password_hash, ...userWithoutPassword } = user;

  log("user from jwt : ", userWithoutPassword);

  return { user: userWithoutPassword, token };
};

