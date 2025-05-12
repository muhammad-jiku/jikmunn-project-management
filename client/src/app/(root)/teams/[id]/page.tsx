export const dynamic = 'force-dynamic'; // Disable static rendering

import TeamComp from '@/components/teams/Team';
import { fetchTeamData } from '@/lib/serverSideFetch';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

// async function getTeam(id: string) {
//   // Get the cookies from the incoming request headers
//   const reqHeaders = await headers();
//   const cookie = reqHeaders.get('cookie') || '';
//   console.log('reqHeaders', reqHeaders);
//   console.log('cookie', cookie);
//   console.log('base url', process.env.NEXT_PUBLIC_API_BASE_URL);
//   console.log('id', id);

//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
//     {
//       cache: 'no-store',
//       // Forward the cookie so that the protected API can authenticate
//       headers: {
//         cookie,
//       },
//     }
//   );
//   if (!res.ok) {
//     throw new Error('Failed to fetch team data');
//   }
//   return res.json();
//   // const res = await fetch(
//   //   `${process.env.NEXT_PUBLIC_API_BASE_URL}teams/${id}`,
//   //   { credentials: 'include' }
//   // );
//   // if (res.status === 404) return null;
//   // if (!res.ok) throw new Error('Failed to fetch team');
//   // return res.json();
// }

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ id: string }> | { id: string };
// }): Promise<Metadata> {
//   // Await the params so you get the resolved object.
//   const resolvedParams = await params;
//   try {
//     const team = await getTeam(resolvedParams.id);
//     console.log('team', team);
//     return {
//       title: `${team?.data?.name} - Project Management Dashboard`,
//       description: team?.data?.description || 'Team details',
//       openGraph: {
//         title: `${team?.data?.name} - Project Management Dashboard`,
//         description: team?.data?.description || 'Team details',
//         url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}teams/${resolvedParams.id}`,
//         type: 'website',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: `${team?.data?.name} - Project Management Dashboard`,
//         description: team?.data?.description || 'Team details',
//       },
//     };
//   } catch (error) {
//     console.error('metadata error', error);

//     return {
//       title: 'Project Management Dashboard',
//       description: 'Manage your teams effectively.',
//     };
//   }
// }

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;

  // Fetch team data
  try {
    const team = await fetchTeamData(Number(resolvedParams.id));

    if (!team || !team.data) {
      return {
        title: 'Team Not Found',
      };
    }

    return {
      title: `${team.data.name} | Project Management Dashboard`,
      description: team.data.description || 'Team details and management',
    };
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return {
      title: 'Team Details',
      description: 'Project management dashboard',
    };
  }
}

export default async function TeamPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const teamId = resolvedParams?.id;

  try {
    // Fetch team data
    const team = await fetchTeamData(Number(teamId));
    console.log('Team Data:', team);

    if (!team.success) {
      notFound();
    }

    return <TeamComp params={{ id: teamId }} />;
  } catch (error) {
    console.error('Error fetching team data:', error);
    notFound();
  }
}
