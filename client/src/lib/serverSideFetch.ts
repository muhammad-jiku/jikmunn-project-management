import { headers } from 'next/headers';

export async function serverSideFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Retrieve server-side cookies
    const headerStore = await headers();
    const accessToken =
      headerStore.get('X-Access-Token') || // From middleware
      headerStore.get('Authorization')?.replace('Bearer ', '') || // Direct Authorization header
      process.env.FALLBACK_ACCESS_TOKEN; // Fallback environment token
    console.log('Access Token:', accessToken);
    console.log('Header Store:', headerStore);

    // Prepare headers with authentication
    const finalHeaders = new Headers(options.headers);
    console.log('Headers:', finalHeaders);

    if (accessToken) {
      finalHeaders.set('Authorization', `Bearer ${accessToken}`);
    }

    console.log('backend url:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Server-Side Fetch Debug:', {
      url,
      accessToken: accessToken ? 'Token Present' : 'No Token',
      headers: Object.fromEntries(finalHeaders.entries()),
    });
    // Perform fetch with combined options
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
      {
        ...options,
        headers: finalHeaders,
        credentials: 'include',
        cache: 'no-store', // Ensure fresh data
      }
    );
    console.log('Response:', response);

    // Handle non-successful responses
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Fetch Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });

      throw new Error(`API request failed: ${response.status} - ${errorBody}`);
    }

    return response.json();
  } catch (error) {
    console.error('Complete Fetch Error:', error);
    throw error;
  }
}
