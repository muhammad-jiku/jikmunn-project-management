import { cookies } from 'next/headers';

/**
 * Fetches project data by ID from the API with authentication
 */
export async function fetchProjectData(id: number) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log('apiBaseUrl', apiBaseUrl);

    if (!apiBaseUrl) {
      throw new Error('API base URL is not defined in environment variables');
    }

    // Get all cookies to forward them to the API
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Make the API request with cookies
    const response = await fetch(`${apiBaseUrl}/projects/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
      // This ensures cookies are handled properly
      credentials: 'include',
      // Cache control
      next: { revalidate: 60 },
    });
    console.log('projects response', response);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Project not found
      }
      // Handle unauthorized access (token expired or invalid)
      if (response.status === 401) {
        // You might want to handle token refresh here
        // or just return null to show not found
        return null;
      }
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching project data:', error);
    throw error;
  }
}

/**
 * Fetches team data by ID from the API with authentication
 */
export async function fetchTeamData(id: number) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log('apiBaseUrl', apiBaseUrl);

    if (!apiBaseUrl) {
      throw new Error('API base URL is not defined in environment variables');
    }

    // Get all cookies to forward them to the API
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Make the API request with cookies
    const response = await fetch(`${apiBaseUrl}/teams/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
      // This ensures cookies are handled properly
      credentials: 'include',
      // Cache control
      next: { revalidate: 60 },
    });
    console.log('teams response', response);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Team not found
      }
      // Handle unauthorized access (token expired or invalid)
      if (response.status === 401) {
        // You might want to handle token refresh here
        // or just return null to show not found
        return null;
      }
      throw new Error(`Failed to fetch team: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching team data:', error);
    throw error;
  }
}
