export const dynamic = 'force-dynamic'; // Disable static rendering

import ProjectComp from '@/components/projects/Project';
import { useGetProjectQuery } from '@/state/api/projectsApi';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// async function getProject(id: string) {
//   // Get the cookies from the incoming request headers
//   const reqHeaders = await headers();
//   const cookie = reqHeaders.get('cookie') || '';
//   console.log('reqHeaders', reqHeaders);
//   console.log('cookie', cookie);
//   console.log('base url', process.env.NEXT_PUBLIC_API_BASE_URL);
//   console.log('id', id);

//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_BASE_URL}projects/${id}`,
//     {
//       cache: 'no-store',
//       // Forward the cookie so that the protected API can authenticate
//       headers: {
//         cookie,
//       },
//     }
//   );
//   if (!res.ok) {
//     throw new Error('Failed to fetch project data');
//   }
//   return res.json();
//   // const res = await fetch(
//   //   `${process.env.NEXT_PUBLIC_API_BASE_URL}projects/${id}`,
//   //   { credentials: 'include' }
//   // );
//   // if (res.status === 404) return null;
//   // if (!res.ok) throw new Error('Failed to fetch project');
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
//     const project = await getProject(resolvedParams.id);
//     console.log('project', project);
//     return {
//       title: `${project?.data?.title} - Project Management Dashboard`,
//       description: project?.data?.description || 'Project details',
//       openGraph: {
//         title: `${project?.data?.title} - Project Management Dashboard`,
//         description: project?.data?.description || 'Project details',
//         url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}projects/${resolvedParams.id}`,
//         type: 'website',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: `${project?.data?.title} - Project Management Dashboard`,
//         description: project?.data?.description || 'Project details',
//       },
//     };
//   } catch (error) {
//     console.error('metadata error', error);

//     return {
//       title: 'Project Management Dashboard',
//       description: 'Manage your projects effectively.',
//     };
//   }
// }

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;

  // Fetch project data
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: project } = useGetProjectQuery(Number(resolvedParams.id), {
      skip: resolvedParams.id === null,
    });

    if (!project || !project.data) {
      return {
        title: 'Project Not Found',
      };
    }

    return {
      title: `${project.data.title} | Project Management Dashboard`,
      description: project.data.description || 'Project details and management',
    };
  } catch (error) {
    console.error('Error fetching project metadata:', error);
    return {
      title: 'Project Details',
      description: 'Project management dashboard',
    };
  }
}

export default async function ProjectPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const projectId = resolvedParams?.id;

  try {
    // Fetch project data
    // const project = await fetchProjectData(Number(resolvedParams.id));
    // console.log('Project Data:', project);

    // if (!project.success) {
    //   notFound();
    // }

    return <ProjectComp params={{ id: projectId }} />;
  } catch (error) {
    console.error('Error fetching project data:', error);
    notFound();
  }
}
