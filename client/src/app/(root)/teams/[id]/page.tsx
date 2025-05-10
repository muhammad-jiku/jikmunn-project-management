import TeamComp from '@/components/teams/Team';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function getTeam(id: string) {
  try {
    // Get the cookies from the incoming request headers
    const reqHeaders = await headers();
    const cookie = reqHeaders.get('cookie') || '';

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
      {
        cache: 'no-store',
        // Forward the cookie so that the protected API can authenticate
        headers: { cookie },
      }
    );

    if (!res.ok) {
      // Instead of throwing an error, return null
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
  const teamId = resolvedParams.id;

  const team = await getTeam(teamId);

  // Only call notFound() in the component itself, not in generateMetadata
  if (!team) {
    notFound();
  }

  return <TeamComp params={{ id: teamId }} />;
};

export default TeamPage;
