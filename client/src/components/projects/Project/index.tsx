'use client';

import ProjectHeader from '@/components/projects/ProjectHeader';
import BoardView from '@/components/projects/views/BoardView';
import ListView from '@/components/projects/views/ListView';
import TableView from '@/components/projects/views/TableView';
import TimelineView from '@/components/projects/views/TimeLineView';
import ModalNewTask from '@/components/shared/modals/tasks/ModalNewTask';
import { use, useState } from 'react';

type Params = {
  id: string;
};

type Props = {
  // params might be a Promise or an object
  params: Promise<Params> | Params;
};

const ProjectComp = ({ params }: Props) => {
  // If params is a Promise, unwrap it using the experimental use() hook.
  const resolvedParams: Params =
    typeof (params as Promise<Params>).then === 'function'
      ? use(params as Promise<Params>)
      : (params as Params);

  const { id } = resolvedParams;

  const [activeTab, setActiveTab] = useState<string>('Board');
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState<boolean>(false);

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Board' && (
        <BoardView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === 'List' && (
        <ListView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === 'Timeline' && (
        <TimelineView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === 'Table' && (
        <TableView id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default ProjectComp;
