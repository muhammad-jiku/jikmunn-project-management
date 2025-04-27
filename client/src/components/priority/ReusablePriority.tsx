/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ModalNewTask from '@/components/modals/ModalNewTask';
import Header from '@/components/shared/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetTasksByUserQuery } from '@/state/api/tasksApi';
import { Priority, Task } from '@/state/types';
import { useAppSelector } from '@/store';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import TaskCard from '../tasks/TaskCard';

type Props = {
  priority: Priority;
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
    width: 130,
    renderCell: (params) => (
      <span className='inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800'>
        {params.value}
      </span>
    ),
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 75,
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
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const globalUser = useAppSelector((state) => state.global.user?.data);

  const userId = globalUser?.userId as string;
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

  if (isTasksError || !tasks) return <div>Error fetching tasks</div>;

  return (
    <div className='m-5 p-4'>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name='Priority Page'
        buttonComponent={
          <button
            className='mr-3 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
      />
      <div className='mb-4 flex justify-start'>
        <button
          className={`px-4 py-2 ${
            view === 'list' ? 'bg-gray-300' : 'bg-white'
          } rounded-l`}
          onClick={() => setView('list')}
        >
          List
        </button>
        <button
          className={`px-4 py-2 ${
            view === 'table' ? 'bg-gray-300' : 'bg-white'
          } rounded-l`}
          onClick={() => setView('table')}
        >
          Table
        </button>
      </div>
      {isLoading ? (
        <div>Loading tasks...</div>
      ) : view === 'list' ? (
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
    </div>
  );
};

export default ReusablePriority;
