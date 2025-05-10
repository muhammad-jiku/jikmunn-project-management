import ProjectComp from '@/components/projects/Project';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function getProject(id: string) {
  try {
    // Get the cookies from the incoming request headers
    const reqHeaders = await headers();
    const cookie = reqHeaders.get('cookie') || '';

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}projects/${id}`,
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
  const projectId = resolvedParams.id;

  const project = await getProject(projectId);

  // Only call notFound() in the component itself, not in generateMetadata
  if (!project) {
    notFound();
  }

  return <ProjectComp params={{ id: projectId }} />;
};

export default ProjectPage;
