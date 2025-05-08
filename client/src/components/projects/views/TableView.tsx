/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalDeleteTask from '@/components/shared/modals/tasks/ModalDeleteTask';
import ModalUpdateTask from '@/components/shared/modals/tasks/ModalUpdateTask';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetTasksByUserProjectQuery } from '@/state/api/tasksApi';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
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

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  // Check user roles
  const isManager = globalUser?.data?.manager !== null;
  const isDeveloper = globalUser?.data?.developer !== null;
  const hasActionPermission = isManager || isDeveloper;

  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserProjectQuery(id, {});

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleEdit = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
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
            <span
              className='inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5'
              style={{ color }}
            >
              {statusLabel}
            </span>
          );
        },
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 75,
        renderCell: (params) => {
          const priority = params.value || 'Medium';
          const color = priorityColor[priority] || '#FBBF24';

          return (
            <span
              className='inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5'
              style={{ color }}
            >
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

    // Only add actions column if user is a developer or manager
    if (hasActionPermission) {
      baseColumns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <div className='my-3 flex gap-3 items-center'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row.id);
              }}
              className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
              title='Edit'
            >
              <Edit size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id);
              }}
              className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
              title='Delete'
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      });
    }

    return baseColumns;
  };

  const transformedTaskRows = tasks?.data.map((task: any) => {
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
  });

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
    <div className='my-4 h-auto w-full px-4 pb-8 xl:px-6'>
      {/* Update Project Modal */}
      <ModalUpdateTask
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        taskId={selectedTaskId}
      />

      {/* Delete Project Modal */}
      <ModalDeleteTask
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        taskId={selectedTaskId}
      />

      <DataGrid
        rows={transformedTaskRows || []}
        // columns={columns}
        columns={getColumns()}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default TableView;
