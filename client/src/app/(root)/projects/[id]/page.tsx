export const dynamic = 'force-dynamic'; // Disable static rendering

import ProjectComp from '@/components/projects/Project';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

// async function getProject(id: string) {
//   try {
//     const cookieStore = await cookies();
//     const cookieString = await cookieStore.toString();

//     console.log('Project API Cookies:', cookieString);

//     if (!cookieString) {
//       console.error('No cookies found when fetching project');
//       return null;
//     }

//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}projects/${id}`,
//       {
//         cache: 'no-store',
//         headers: {
//           Cookie: cookieString,
//           Authorization: `Bearer ${cookieStore.get('accessToken')?.value || ''}`,
//         },
//       }
//     );

//     if (!res.ok) {
//       console.error(`Project API Error: ${res.status} ${res.statusText}`);
//       return null;
//     }

//     return res.json();
//   } catch (error) {
//     console.error('Project Fetch Error:', error);
//     return null;
//   }
// }

async function getProject(id: string) {
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

    console.log('Project API Cookie Status:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasCookieString: !!cookieString,
    });

    if (!accessToken) {
      console.error('No access token found when fetching project');
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}projects/${id}`,
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
      console.error(`Project API Error: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Project Fetch Error:', error);
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
    const projectId = resolvedParams.id;

    const project = await getProject(projectId);

    return {
      title: project?.data?.title
        ? `${project.data.title} - Project Management Dashboard`
        : 'Project Details',
      description: project?.data?.description || 'Project management details',
      openGraph: {
        title: project?.data?.title || 'Project Details',
        description: project?.data?.description || 'Project management details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}projects/${projectId}`,
      },
    };
  } catch (error) {
    console.error('Metadata Generation Error:', error);
    return {
      title: 'Project Details',
      description: 'Project management details',
    };
  }
}

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  const project = await getProject(projectId);
  console.log('Project Data:', project);

  if (!project?.data) {
    console.error(`Project ${projectId} not found`);
    notFound();
  }

  return <ProjectComp params={{ id: projectId }} />;
}
