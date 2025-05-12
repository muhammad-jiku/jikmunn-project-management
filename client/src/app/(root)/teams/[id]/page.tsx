/* eslint-disable @typescript-eslint/no-unused-vars */
export const dynamic = 'force-dynamic'; // Disable static rendering

import TeamComp from '@/components/teams/Team';
import { serverSideGetTeam } from '@/lib/serverSideApiHelpers';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    // Await the params object to resolve any Promise
    const resolvedParams = await params;
    const teamId = Number(resolvedParams?.id);

    // Fetch team data using server-side helper
    const { data: team } = await serverSideGetTeam(teamId);
    console.log('Team Data:', team);

    return {
      title: `${team?.name} - Project Management Dashboard` || 'Team Details',
      description: team?.description || 'Team management details',
      openGraph: {
        title: team?.name || 'Team Details',
        description: team?.description || 'Team management details',
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
  const teamId = Number(resolvedParams?.id);

  try {
    // Fetch team data
    const { data: team } = await serverSideGetTeam(teamId);
    console.log('Team Data:', team);

    if (!team) {
      notFound();
    }

    return <TeamComp params={{ id: String(teamId) }} />;
  } catch (error) {
    notFound();
  }
}
