/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useGetTasksByUserProjectQuery,
  // useGetTasksByUserQuery,
  useUpdateTaskStatusMutation,
} from '@/state/api/tasksApi';
import { Task as TaskType } from '@/state/types';
// import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { EllipsisVertical, MessageSquareMore, Plus } from 'lucide-react';
import Image from 'next/image';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import i1 from '../../../../public/images/i1.jpg';
import p3 from '../../../../public/images/p3.jpeg';
import p7 from '../../../../public/images/p7.jpeg';

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ['TO_DO', 'WORK_IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  // const globalUser = useAppSelector((state) => state?.global?.user?.data);
  // const userId = globalUser?.data?.userId as string;
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserProjectQuery(id, {});

  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

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
    <DndProvider backend={HTML5Backend}>
      <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4'>
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks?.data || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    TO_DO: '#2563EB',
    WORK_IN_PROGRESS: '#059669',
    UNDER_REVIEW: '#D97706',
    COMPLETED: '#00ff0d',
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? 'bg-blue-100 dark:bg-neutral-950' : ''}`}
    >
      <div className='mb-3 flex w-full'>
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className='flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary'>
          <h3 className='flex items-center text-lg font-semibold dark:text-white'>
            {status === 'TO_DO'
              ? 'To Do'
              : status === 'WORK_IN_PROGRESS'
                ? 'Work In Progress'
                : status === 'UNDER_REVIEW'
                  ? 'Under Review'
                  : 'Completed'}
            <span
              className='ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary'
              style={{ width: '1.5rem', height: '1.5rem' }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className='flex items-center gap-1'>
            <button className='flex h-6 w-5 items-center justify-center dark:text-neutral-500'>
              <EllipsisVertical size={26} />
            </button>
            <button
              className='flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white'
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
};

const Task = ({ task }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(',') : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), 'P')
    : '';
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'P')
    : '';

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const PriorityTag = ({ priority }: { priority: TaskType['priority'] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === 'Urgent'
          ? 'bg-red-200 text-red-700'
          : priority === 'High'
            ? 'bg-yellow-200 text-yellow-700'
            : priority === 'Medium'
              ? 'bg-green-200 text-green-700'
              : priority === 'Low'
                ? 'bg-blue-200 text-blue-700'
                : 'bg-gray-200 text-gray-700'
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={i1}
          alt={task.attachments[0].fileName || 'task'}
          width={400}
          height={200}
          className='h-auto w-full rounded-t-md'
        />
      )}
      <div className='p-4 md:p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex flex-1 flex-wrap items-center gap-2'>
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className='flex gap-2'>
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className='rounded-full bg-blue-100 dark:bg-blue-600 px-2 py-1 text-xs'
                >
                  {' '}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button className='flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500'>
            <EllipsisVertical size={26} />
          </button>
        </div>

        <div className='my-3 flex justify-between'>
          <h4 className='text-md font-bold dark:text-white'>{task.title}</h4>
          {typeof task.points === 'number' && (
            <div className='text-xs font-semibold dark:text-white'>
              {task.points} pts
            </div>
          )}
        </div>

        <div className='text-xs text-gray-500 dark:text-neutral-500'>
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className='text-sm text-gray-600 dark:text-neutral-500'>
          {task.description}
        </p>
        <div className='mt-4 border-t border-gray-200 dark:border-stroke-dark' />

        {/* Users */}
        <div className='mt-3 flex items-center justify-between'>
          <div className='flex -space-x-[6px] overflow-hidden'>
            {task.assignee && (
              <Image
                key={task?.assignee?.data?.userId}
                src={p3}
                alt={task?.assignee?.data?.username || 'username'}
                width={30}
                height={30}
                className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary'
              />
            )}
            {task.author && (
              <Image
                key={task?.author?.data?.userId}
                src={p7}
                alt={task?.author?.data?.username || 'username'}
                width={30}
                height={30}
                className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary'
              />
            )}
          </div>
          <div className='flex items-center text-gray-500 dark:text-neutral-500'>
            <MessageSquareMore size={20} />
            <span className='ml-1 text-sm dark:text-neutral-400'>
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
