import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    // Extend the Request interface within Express namespace
    interface Request {
      user: JwtPayload | null;
    }
  }

  // Define the RequestWithCookies interface outside the Express namespace
  interface RequestWithCookies extends ExpressRequest {
    cookies: {
      [key: string]: string;
    };
  }
}

// This is needed to make this file a module
export {};
