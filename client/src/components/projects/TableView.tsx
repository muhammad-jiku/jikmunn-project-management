/* eslint-disable @typescript-eslint/no-explicit-any */
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetTasksByUserQuery } from '@/state/api/tasksApi';
import { useAppSelector } from '@/store';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Header from '../shared/Header';

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
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

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  const userId = globalUser?.data?.userId as string;
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId, {});
  console.log('table view param id', id);
  console.log('table view modal check', setIsModalNewTaskOpen);
  console.log('table view tasks data', tasks);

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

  if (isLoading) return <div>Loading...</div>;
  if (isTasksError || !tasks)
    return <div>An error occurred while fetching tasks</div>;

  return (
    <div className='h-[540px] w-full px-4 pb-8 xl:px-6'>
      <div className='pt-5'>
        <Header
          name='Table'
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
      <DataGrid
        rows={transformedTaskRows || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default TableView;
