/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useGetTasksByUserProjectQuery } from '@/state/api/tasksApi';
import { Task } from '@/state/types';
// import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
// import Header from '../../shared/Header';
import TaskCard from '../../tasks/TaskCard';

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TransformedTask = Omit<Task, 'author' | 'assignee'> & {
  author: string;
  assignee: string;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  // const globalUser = useAppSelector((state) => state?.global?.user?.data);
  // const userId = globalUser?.data?.userId as string;

  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserProjectQuery(id, {});

  console.log('list view param id', id);
  console.log('list view modal check', setIsModalNewTaskOpen);
  console.log('list view tasks data', tasks);

  // Transform the tasks data to include flattened author and assignee strings.
  const transformedTasks: TransformedTask[] = (tasks?.data ?? []).map(
    (task: any) => {
      const authorManager = task.author?.manager;
      const authorDeveloper = task.author?.developer;
      const assigneeDeveloper = task.assignee?.developer;

      return {
        ...task,
        author: authorManager
          ? `${authorManager.firstName} ${authorManager.middleName ? authorManager.middleName + ' ' : ''}${authorManager.lastName}`
          : authorDeveloper
            ? `${authorDeveloper.firstName} ${authorDeveloper.middleName ? authorDeveloper.middleName + ' ' : ''}${authorDeveloper.lastName}`
            : task?.author?.data?.username || 'Unknown',
        assignee: assigneeDeveloper
          ? `${assigneeDeveloper.firstName} ${assigneeDeveloper.middleName ? assigneeDeveloper.middleName + ' ' : ''}${assigneeDeveloper.lastName}`
          : task?.assignee?.data?.username || 'Unassigned',
      };
    }
  );

  console.log('transformed tasks data', transformedTasks);

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );
  if (isTasksError || !tasks)
    return (
      <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
        No task information added yet!
      </div>
    );

  return (
    <div className='px-4 pb-8 xl:px-6'>
      {/* <div className='pt-5'>
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
      </div> */}
      <div className='my-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6'>
        {transformedTasks.map((task: any) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ListView;
