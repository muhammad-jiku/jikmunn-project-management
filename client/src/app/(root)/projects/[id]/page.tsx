/* eslint-disable @typescript-eslint/no-unused-vars */
export const dynamic = 'force-dynamic'; // Disable static rendering

import ProjectComp from '@/components/projects/Project';
import { serverSideGetProject } from '@/lib/serverSideApiHelpers';
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
    const projectId = Number(resolvedParams?.id);

    // Fetch project data using server-side helper
    const { data: project } = await serverSideGetProject(projectId);

    return {
      title:
        `${project?.title} - Project Management Dashboard` || 'Project Details',
      description: project?.description || 'Project management details',
      openGraph: {
        title: project?.title || 'Project Details',
        description: project?.description || 'Project management details',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}projects/${projectId}`,
      },
    };
  } catch (error) {
    console.error('Comprehensive Metadata Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

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
  const projectId = Number(resolvedParams?.id);

  try {
    // Fetch project data
    const { data: project } = await serverSideGetProject(projectId);
    console.log('Project Data:', project);

    if (!project) {
      notFound();
    }

    return <ProjectComp params={{ id: String(projectId) }} />;
  } catch (error) {
    notFound();
  }
}
