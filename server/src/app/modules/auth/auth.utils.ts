import bcrypt from 'bcrypt';
import crypto from 'crypto';
import config from '../../../config';
import { prisma } from '../../../shared/prisma';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
}

export async function isUserExist(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      userId: true,
      username: true,
      email: true,
      role: true,
      password: true,
      needsPasswordChange: true,
      emailVerified: true,
      emailVerificationToken: true, // NEW
      emailVerificationExpires: true, // NEW
    },
  });
  return user;
}

export async function isPasswordMatch(
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  console.log('Comparing passwords:', { givenPassword, savedPassword }); // Debugging logs
  return bcrypt.compare(givenPassword, savedPassword);
}

export const createEmailVerificationToken = (): {
  verificationToken: string;
  hashedToken: string;
} => {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  console.log('(1) created email verification token', verificationToken);
  console.log('(1.1) created email verification hashed token', hashedToken);

  return {
    verificationToken,
    hashedToken,
  };
};

export const createPasswordResetToken = (): {
  resetToken: string;
  hashedToken: string;
} => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  return {
    resetToken,
    hashedToken,
  };
};
