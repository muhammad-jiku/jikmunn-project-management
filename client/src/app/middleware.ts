import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  console.log('Access Token in the middleware:', accessToken);

  // Create a new response
  const response = NextResponse.next();
  console.log('Response in the middleware before setting headers:', response);

  // If token exists, set it as a header
  if (accessToken) {
    response.headers.set('X-Access-Token', accessToken);
  }
  console.log('Response in the middleware after setting headers:', response);

  return response;
}

export const config = {
  matcher: ['/projects/:path*', '/teams/:path*'],
};
