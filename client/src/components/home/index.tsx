'use client';

import Header from '@/components/shared/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetProjectsQuery } from '@/state/api/projectsApi';
import { useGetTasksQuery } from '@/state/api/tasksApi';
import { Priority, Project, Task } from '@/state/types';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

const taskColumns: GridColDef[] = [
  { field: 'title', headerName: 'Title', width: 200 },
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
  { field: 'dueDate', headerName: 'Due Date', width: 150 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Home = () => {
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery({});

  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery(
    {}
  );

  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);

  // Compute task priority distribution
  const priorityCount =
    tasks?.data?.reduce((acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    }, {}) || {};

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  // Get the current year
  const currentYear = new Date().getFullYear();

  // Compute project status based on endDate
  const statusCount =
    projects?.data?.reduce((acc: Record<string, number>, project: Project) => {
      let status = 'Active';
      if (project.endDate) {
        const endDate = new Date(project.endDate);
        if (endDate.getFullYear() < currentYear) {
          status = 'Completed';
        } else if (endDate.getFullYear() === currentYear) {
          // If the end date is in the current year, check if it's already passed
          status = endDate.getTime() < Date.now() ? 'Completed' : 'Active';
        } else {
          status = 'Active';
        }
      }
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: '#8884d8',
        barGrid: '#303030',
        pieFill: '#4A90E2',
        text: '#FFFFFF',
      }
    : {
        bar: '#8884d8',
        barGrid: '#E0E0E0',
        pieFill: '#82ca9d',
        text: '#000000',
      };

  if (tasksLoading || isProjectsLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );

  return (
    <div className='container h-full w-full bg-gray-50 dark:bg-dark-bg p-8'>
      <Header name='Project Management Dashboard' />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Task Priority Distribution Chart */}
        <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
          <h3 className='mb-4 text-lg font-semibold dark:text-white'>
            Task Priority Distribution
          </h3>
          {tasksError || !tasks || tasks.data.length === 0 ? (
            <div className='flex items-center justify-center h-[300px] text-center text-black dark:text-white'>
              No task information added yet!
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={chartColors.barGrid}
                />
                <XAxis dataKey='name' stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  contentStyle={{
                    width: 'min-content',
                    height: 'min-content',
                  }}
                />
                <Legend />
                <Bar dataKey='count' fill={chartColors.bar} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Project Status Chart */}
        <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
          <h3 className='mb-4 text-lg font-semibold dark:text-white'>
            Project Status
          </h3>
          {!projects || projects.data.length === 0 ? (
            <div className='flex items-center justify-center h-[300px] text-center text-black dark:text-white'>
              No project information added yet!
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie dataKey='count' data={projectStatus} fill='#82ca9d' label>
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Your Tasks DataGrid */}
        <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary lg:col-span-2'>
          <h3 className='mb-4 text-lg font-semibold dark:text-white'>
            Your Tasks
          </h3>
          <div style={{ height: 400, width: '100%' }}>
            {tasksError || !tasks || tasks.data.length === 0 ? (
              <div className='flex items-center justify-center h-[300px] text-center text-black dark:text-white'>
                No task information added yet!
              </div>
            ) : (
              <DataGrid
                rows={tasks.data!}
                columns={taskColumns}
                checkboxSelection
                loading={tasksLoading}
                getRowClassName={() => 'data-grid-row'}
                getCellClassName={() => 'data-grid-cell'}
                className={dataGridClassNames}
                sx={dataGridSxStyles(isDarkMode)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
