import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expireTime,
  });
};

const verifyToken = (payload: string, secret: Secret): JwtPayload => {
  console.log('payload', payload);
  console.log('secret', secret);
  return jwt.verify(payload, secret) as JwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
