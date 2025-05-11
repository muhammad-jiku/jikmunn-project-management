import TeamComp from '@/components/teams/Team';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function getTeam(id: string) {
  try {
    // Get the cookies from the incoming request headers
    const reqHeaders = await headers();
    const cookie = reqHeaders.get('cookie') || '';

    // Get cookies explicitly rather than relying on header forwarding
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('accessToken')?.value;

    console.log('cookies', authCookie, cookie);

    if (!cookie || !authCookie) {
      console.error('No auth cookie found when fetching team');
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
      {
        // Forward the cookie so that the protected API can authenticate
        cache: 'no-store',
        headers: {
          // cookie,
          Cookie: `accessToken=${authCookie}`,
          Authorization: `Bearer ${authCookie}`, // Add explicit auth header as fallback
        },
      }
    );

    if (!res.ok) {
      console.error(`Error fetching team: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching team:', error);
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

    // If team is null, return default metadata
    if (!team?.data) {
      return {
        title: 'Team - Project Management Dashboard',
        description: 'Team details',
      };
    }

    return {
      title: `${team.data.name} - Project Management Dashboard`,
      description: team.data.description || 'Team details',
      openGraph: {
        title: `${team.data.name} - Project Management Dashboard`,
        description: team.data.description || 'Team details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}teams/${teamId}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${team.data.name} - Project Management Dashboard`,
        description: team.data.description || 'Team details',
      },
    };
  } catch (error) {
    console.error('metadata error', error);
    // Return default metadata instead of notFound()
    return {
      title: 'Team - Project Management Dashboard',
      description: 'Team details',
    };
  }
}

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

const TeamPage = async ({ params }: Props) => {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  console.log('resolved params', resolvedParams);
  const teamId = resolvedParams.id;
  console.log('team id', teamId);

  const team = await getTeam(teamId);
  console.log('team', team);

  // Only call notFound() in the component itself, not in generateMetadata
  if (!team) {
    console.error(`Team with ID ${teamId} not found or error fetching data`);
    notFound();
  }

  return <TeamComp params={{ id: teamId }} />;
};

export default TeamPage;
