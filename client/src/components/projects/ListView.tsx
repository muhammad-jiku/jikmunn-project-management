/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useGetTasksByUserQuery } from '@/state/api/tasksApi';
import { Task } from '@/state/types';
import { useAppSelector } from '@/store';
import Header from '../shared/Header';
import TaskCard from '../tasks/TaskCard';

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TransformedTask = Omit<Task, 'author' | 'assignee'> & {
  author: string;
  assignee: string;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const globalUser = useAppSelector((state) => state?.global?.user?.data);
  const userId = globalUser?.userId as string;

  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId, {});

  console.log('list view param id', id);
  console.log('list view modal check', setIsModalNewTaskOpen);
  console.log('list view tasks data', tasks);

  if (isLoading) return <div>Loading...</div>;
  if (isTasksError || !tasks)
    return <div>An error occurred while fetching tasks</div>;

  // Transform the tasks data to include flattened author and assignee strings.
  const transformedTasks: TransformedTask[] = (tasks?.data ?? []).map(
    (task: Task) => {
      const authorManager = task.author?.manager;
      const authorDeveloper = task.author?.developer;
      const assigneeDeveloper = task.assignee?.developer;

      return {
        ...task,
        author: authorManager
          ? `${authorManager.firstName} ${authorManager.middleName ? authorManager.middleName + ' ' : ''}${authorManager.lastName}`
          : authorDeveloper
            ? `${authorDeveloper.firstName} ${authorDeveloper.middleName ? authorDeveloper.middleName + ' ' : ''}${authorDeveloper.lastName}`
            : task.author?.username || 'Unknown',
        assignee: assigneeDeveloper
          ? `${assigneeDeveloper.firstName} ${assigneeDeveloper.middleName ? assigneeDeveloper.middleName + ' ' : ''}${assigneeDeveloper.lastName}`
          : task.assignee?.username || 'Unassigned',
      };
    }
  );

  console.log('transformed tasks data', transformedTasks);

  return (
    <div className='px-4 pb-8 xl:px-6'>
      <div className='pt-5'>
        <Header
          name='List'
          buttonComponent={
            <button
              className='flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600'
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6'>
        {transformedTasks.map((task: any) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ListView;
