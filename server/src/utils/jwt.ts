import jwt from 'jsonwebtoken';
import config from '../config';

export const generateAccessToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

export const generateRefreshToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );
};

export const verifyRefreshToken = (token: string): { id: string; email: string; role: string } => {
  return jwt.verify(token, config.jwt.refreshSecret) as { id: string; email: string; role: string };
};
