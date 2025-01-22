'use client';

import Header from '@/_components/Header';
import { Legend, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// const taskColumns: GridColDef[] = [
//   { field: 'title', headerName: 'Title', width: 200 },
//   { field: 'status', headerName: 'Status', width: 150 },
//   { field: 'priority', headerName: 'Priority', width: 150 },
//   { field: 'dueDate', headerName: 'Due Date', width: 150 },
// ];

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const HomePage = () => {
  //   const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  //   const chartColors = isDarkMode
  //     ? {
  //         bar: '#8884d8',
  //         barGrid: '#303030',
  //         pieFill: '#4A90E2',
  //         text: '#FFFFFF',
  //       }
  //     : {
  //         bar: '#8884d8',
  //         barGrid: '#E0E0E0',
  //         pieFill: '#82ca9d',
  //         text: '#000000',
  //       };

  return (
    <div className='container h-full w-[100%] bg-gray-100 bg-transparent p-8'>
      <Header name='Project Management Dashboard' />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
          <h3 className='mb-4 text-lg font-semibold dark:text-white'>
            Task Priority Distribution
          </h3>
          {/* <ResponsiveContainer width='100%' height={300}>
          
          </ResponsiveContainer> */}
        </div>
        <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary'>
          <h3 className='mb-4 text-lg font-semibold dark:text-white'>
            Project Status
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2'>
          <h3 className='mb-4 text-lg font-semibold dark:text-white'>
            Your Tasks
          </h3>
          <div style={{ height: 400, width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
