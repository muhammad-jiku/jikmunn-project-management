/* eslint-disable @typescript-eslint/no-explicit-any */
import ProjectComp from '@/components/projects/Project';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function getProject(id: string) {
  // Get the cookies from the incoming request headers
  const reqHeaders = await headers();
  const cookie = reqHeaders.get('cookie') || '';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${id}`,
    {
      cache: 'no-store',
      // Forward the cookie so that the protected API can authenticate
      headers: { cookie },
    }
  );
  if (!res.ok) {
    throw new Error('Failed to fetch project data');
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
    const project = await getProject(resolvedParams.id);
    console.log('project', project);
    return {
      title: `${project?.data?.title} - Project Management Dashboard`,
      description: project?.data?.description || 'Project details',
      openGraph: {
        title: `${project?.data?.title} - Project Management Dashboard`,
        description: project?.data?.description || 'Project details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/projects/${resolvedParams.id}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${project?.data?.title} - Project Management Dashboard`,
        description: project?.data?.description || 'Project details',
      },
    };
  } catch (error: any) {
    console.error('metadata error', error);
    notFound();
    // return {
    //   title: 'Project Management Dashboard',
    //   description: 'Manage your projects effectively.',
    // };
  }
}

type Props = {
  params: { id: string };
};

const ProjectPage = ({ params }: Props) => {
  return <ProjectComp params={params} />;
};

export default ProjectPage;
