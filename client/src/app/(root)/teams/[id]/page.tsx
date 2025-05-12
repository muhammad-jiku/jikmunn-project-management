export const dynamic = 'force-dynamic'; // Disable static rendering

import TeamComp from '@/components/teams/Team';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function TeamPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const teamId = resolvedParams?.id;

  try {
    return <TeamComp params={{ id: teamId }} />;
  } catch (error) {
    console.error('Error fetching team data:', error); // debugging log
    notFound();
  }
}
