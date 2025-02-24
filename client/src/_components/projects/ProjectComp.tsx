'use client';

import ModalNewTask from '@/_components/modals/ModalNewTask';
import BoardView from '@/_components/projects/BoardView';
import ListView from '@/_components/projects/ListView';
import ProjectHeader from '@/_components/projects/ProjectHeader';
import TableView from '@/_components/projects/TableView';
import TimelineView from '@/_components/projects/TimeLineView';
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

  const [activeTab, setActiveTab] = useState('Board');
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

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
