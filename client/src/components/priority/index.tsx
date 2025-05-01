/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Header from '@/components/shared/Header';
import ModalNewTask from '@/components/shared/modals/tasks/ModalNewTask';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetTasksByUserQuery } from '@/state/api/tasksApi';
import { Priority, Task } from '@/state/types';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { PlusSquare } from 'lucide-react';
import { useState } from 'react';
import TaskCard from '../tasks/TaskCard';

type Props = {
  priority: Priority;
};

// Status color mapping
const statusColor: Record<string, string> = {
  TO_DO: '#2563EB',
  WORK_IN_PROGRESS: '#059669',
  UNDER_REVIEW: '#D97706',
  COMPLETED: '#00ff0d',
};

// Priority color mapping
const priorityColor: Record<string, string> = {
  Backlog: '#6B7280', // Gray
  Low: '#3B82F6', // Blue
  Medium: '#FBBF24', // Amber
  High: '#F59E0B', // Orange
  Urgent: '#EF4444', // Red
};

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    width: 100,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 200,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: (params) => {
      const status = params.value || 'TO_DO';
      const color = statusColor[status] || '#2563EB';

      const statusLabel =
        status === 'TO_DO'
          ? 'To Do'
          : status === 'WORK_IN_PROGRESS'
            ? 'Work In Progress'
            : status === 'UNDER_REVIEW'
              ? 'Under Review'
              : 'Completed';

      return (
        <span className='px-2 font-semibold leading-5' style={{ color }}>
          {statusLabel}
        </span>
      );
    },
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 150,
    renderCell: (params) => {
      const priority = params.value || 'Medium';
      const color = priorityColor[priority] || '#FBBF24';

      return (
        <span className='px-2 font-semibold leading-5' style={{ color }}>
          {priority}
        </span>
      );
    },
  },
  {
    field: 'tags',
    headerName: 'Tags',
    width: 130,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    width: 130,
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    width: 130,
  },
  {
    field: 'author',
    headerName: 'Author',
    width: 150,
  },
  {
    field: 'assignee',
    headerName: 'Assignee',
    width: 150,
  },
];

const ReusablePriority = ({ priority }: Props) => {
  const [view, setView] = useState('list');
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  const userId = globalUser?.data?.userId as string;
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId, {});
  console.log('priority page tasks data', tasks);

  // Transform the data to include a flat author and assignee property
  const filteredTasks = tasks?.data
    .filter((task: Task) => task.priority === priority)
    .map((task: any) => {
      const authorManager = task.author?.manager;
      const authorDeveloper = task.author?.developer;
      const assigneeDeveloper = task.assignee?.developer;

      return {
        ...task,
        author: authorManager
          ? `${authorManager.firstName} ${authorManager.middleName ? authorManager.middleName + ' ' : ''}${authorManager.lastName}`
          : `${authorDeveloper.firstName} ${authorDeveloper.middleName ? authorDeveloper.middleName + ' ' : ''}${authorDeveloper.lastName}`,
        assignee: assigneeDeveloper
          ? `${assigneeDeveloper.firstName} ${assigneeDeveloper.middleName ? assigneeDeveloper.middleName + ' ' : ''}${assigneeDeveloper.lastName}`
          : task.assignee.username,
      };
    });
  console.log('priority page filtered tasks data', filteredTasks);

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );
  // if (isTasksError || !tasks)
  //   return (
  //     <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
  //       No task information added yet!
  //     </div>
  //   );

  return (
    <div className='m-5 p-4'>
      <div className='flex items-center justify-between'>
        <Header name="Task's Proirity" />
        <div className='flex w-full items-center justify-end'>
          <ModalNewTask
            isOpen={isModalNewTaskOpen}
            onClose={() => setIsModalNewTaskOpen(false)}
          />
          <button
            className='mb-4 flex justify-center items-center rounded-md bg-blue-primary p-3 text-white hover:bg-blue-600'
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <PlusSquare className='mr-2 h-5 w-5' /> Add Task
          </button>
        </div>
      </div>
      {isTasksError || !tasks ? (
        <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
          No task information added yet!{' '}
        </div>
      ) : (
        <>
          <div className='mb-4 flex justify-start'>
            <button
              className={`px-4 py-2 ${
                view === 'list' ? 'bg-gray-800' : 'bg-gray-700'
              } text-white rounded-l`}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button
              className={`px-4 py-2 ${
                view === 'table' ? 'bg-gray-800' : 'bg-gray-700'
              } text-white rounded-l`}
              onClick={() => setView('table')}
            >
              Table
            </button>
          </div>
          {view === 'list' ? (
            <div className='grid grid-cols-1 gap-4'>
              {filteredTasks?.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            view === 'table' &&
            filteredTasks && (
              <div className='z-0 w-full'>
                <DataGrid
                  rows={filteredTasks}
                  columns={columns}
                  checkboxSelection
                  getRowId={(row) => row.id}
                  className={dataGridClassNames}
                  sx={dataGridSxStyles(isDarkMode)}
                />
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default ReusablePriority;
