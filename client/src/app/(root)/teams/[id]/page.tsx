export const dynamic = 'force-dynamic'; // Disable static rendering

import TeamComp from '@/components/teams/Team';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

// async function getTeam(id: string) {
//   try {
//     const cookieStore = await cookies();
//     const cookieString = await cookieStore.toString();

//     console.log('Team API Cookies:', cookieString);

//     if (!cookieString) {
//       console.error('No cookies found when fetching team');
//       return null;
//     }

//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
//       {
//         cache: 'no-store',
//         headers: {
//           Cookie: cookieString,
//           Authorization: `Bearer ${cookieStore.get('accessToken')?.value || ''}`,
//         },
//       }
//     );

//     if (!res.ok) {
//       console.error(`Team API Error: ${res.status} ${res.statusText}`);
//       return null;
//     }

//     return res.json();
//   } catch (error) {
//     console.error('Team Fetch Error:', error);
//     return null;
//   }
// }

async function getTeam(id: string) {
  try {
    const cookieStore = await cookies();

    // Don't use toString() on cookieStore, it doesn't work as expected
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Create a proper cookie string
    const cookieString = [
      accessToken ? `accessToken=${accessToken}` : '',
      refreshToken ? `refreshToken=${refreshToken}` : '',
    ]
      .filter(Boolean)
      .join('; ');

    console.log('Team API Cookie Status:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasCookieString: !!cookieString,
    });

    if (!accessToken) {
      console.error('No access token found when fetching team');
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
      {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          Cookie: cookieString,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      console.error(`Team API Error: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Team Fetch Error:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    // Await the params object to resolve any Promise
    const resolvedParams = await params;
    const teamId = resolvedParams.id;

    const team = await getTeam(teamId);
    console.log('Team Data:', team);

    return {
      title: team?.data?.name
        ? `${team.data.name} - Project Management Dashboard`
        : 'Team Details',
      description: team?.data?.description || 'Team management details',
      openGraph: {
        title: team?.data?.name || 'Team Details',
        description: team?.data?.description || 'Team management details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}teams/${teamId}`,
      },
    };
  } catch (error) {
    console.error('Metadata Generation Error:', error);
    return {
      title: 'Team Details',
      description: 'Team management details',
    };
  }
}

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function TeamPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const teamId = resolvedParams.id;

  const team = await getTeam(teamId);
  console.log('Team Data:', team);

  if (!team?.data) {
    console.error(`Team ${teamId} not found`);
    notFound();
  }

  return <TeamComp params={{ id: teamId }} />;
}
