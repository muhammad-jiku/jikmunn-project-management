'use client';

import ProjectHeader from '@/components/projects/ProjectHeader';
import BoardView from '@/components/projects/views/BoardView';
import ListView from '@/components/projects/views/ListView';
import TableView from '@/components/projects/views/TableView';
import TimelineView from '@/components/projects/views/TimeLineView';
import ModalNewTask from '@/components/shared/modals/tasks/ModalNewTask';
import { useState } from 'react';

type Props = {
  params: { id: string };
};

const ProjectComp = ({ params }: Props) => {
  const { id } = params;

  const [activeTab, setActiveTab] = useState<string>('Board');
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState<boolean>(false);

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader
        id={id}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
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
