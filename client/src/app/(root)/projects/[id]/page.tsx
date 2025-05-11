import ProjectComp from '@/components/projects/Project';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function getProject(id: string) {
  try {
    // Get the cookies from the incoming request headers
    const reqHeaders = await headers();
    const cookie = reqHeaders.get('cookie') || '';

    // Get cookies explicitly rather than relying on header forwarding
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('accessToken')?.value;

    console.log('cookies', authCookie, cookie);

    if (!cookie || !authCookie) {
      console.error('No auth cookie found when fetching project');
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}projects/${id}`,
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
      console.error(`Error fetching project: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching project:', error);
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

    // If project is null, return default metadata
    if (!project?.data) {
      return {
        title: 'Project - Project Management Dashboard',
        description: 'Project details',
      };
    }

    return {
      title: `${project.data.title} - Project Management Dashboard`,
      description: project.data.description || 'Project details',
      openGraph: {
        title: `${project.data.title} - Project Management Dashboard`,
        description: project.data.description || 'Project details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}projects/${projectId}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${project.data.title} - Project Management Dashboard`,
        description: project.data.description || 'Project details',
      },
    };
  } catch (error) {
    console.error('metadata error', error);
    // Return default metadata instead of notFound()
    return {
      title: 'Project - Project Management Dashboard',
      description: 'Project details',
    };
  }
}

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

const ProjectPage = async ({ params }: Props) => {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  console.log('resolved params', resolvedParams);
  const projectId = resolvedParams.id;
  console.log('project id', projectId);

  const project = await getProject(projectId);
  console.log('project', project);

  // Only call notFound() in the component itself, not in generateMetadata
  if (!project) {
    console.error(
      `Project with ID ${projectId} not found or error fetching data`
    );
    notFound();
  }

  return <ProjectComp params={{ id: projectId }} />;
};

export default ProjectPage;
