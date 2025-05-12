export const dynamic = 'force-dynamic'; // Disable static rendering

import ProjectComp from '@/components/projects/Project';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  // Await the params object to resolve any Promise
  const resolvedParams = await params;
  const projectId = resolvedParams?.id;

  try {
    return <ProjectComp params={{ id: projectId }} />;
  } catch (error) {
    console.error('Error fetching project data:', error); // debugging log
    notFound();
  }
}
