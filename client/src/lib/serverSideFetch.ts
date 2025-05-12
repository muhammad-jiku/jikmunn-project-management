import { cookies } from 'next/headers';

export async function serverSideFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Retrieve server-side cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  console.log('Access Token:', accessToken);
  console.log('Cookie Store:', cookieStore);

  // Prepare headers with authentication
  const headers = new Headers(options.headers);
  console.log('Headers:', headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  console.log('backend url:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('url:', url);
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
  console.log('Response:', response);

  // Handle non-successful responses
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
