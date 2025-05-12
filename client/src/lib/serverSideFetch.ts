import { cookies } from 'next/headers';

export async function serverSideFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Retrieve server-side cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  // Prepare headers with authentication
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Perform fetch with combined options
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
    {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store', // Ensure fresh data
    }
  );

  // Handle non-successful responses
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
