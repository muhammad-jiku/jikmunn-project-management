export const dynamic = 'force-dynamic'; // Disable static rendering

import TeamComp from '@/components/teams/Team';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function getTeam(id: string) {
  // Get the cookies from the incoming request headers
  const reqHeaders = await headers();
  const cookie = reqHeaders.get('cookie') || '';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
    {
      cache: 'no-store',
      // Forward the cookie so that the protected API can authenticate
      headers: {
        cookie,
      },
    }
  );
  if (!res.ok) {
    throw new Error('Failed to fetch team data');
  }
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  // Await the params so you get the resolved object.
  const resolvedParams = await params;
  try {
    const team = await getTeam(resolvedParams.id);
    console.log('team', team);
    return {
      title: `${team?.data?.name} - Project Management Dashboard`,
      description: team?.data?.description || 'Team details',
      openGraph: {
        title: `${team?.data?.name} - Project Management Dashboard`,
        description: team?.data?.description || 'Team details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}teams/${resolvedParams.id}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${team?.data?.name} - Project Management Dashboard`,
        description: team?.data?.description || 'Team details',
      },
    };
  } catch (error) {
    console.error('metadata error', error);

    return {
      title: 'Project Management Dashboard',
      description: 'Manage your teams effectively.',
    };
  }
}

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function TeamPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const teamId = resolvedParams?.id;

  try {
    // Fetch team data
    const team = await getTeam(teamId);
    console.log('Team Data:', team);

    if (!team) {
      notFound();
    }

    return <TeamComp params={{ id: teamId }} />;
  } catch (error) {
    console.error('Error fetching team data:', error);
    notFound();
  }
}
