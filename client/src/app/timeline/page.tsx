'use client';

import Header from '@/_components/Header';
// import { useGetProjectsQuery } from '@/state/api';
// import { useAppSelector } from '@/store';
import { DisplayOption, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import React, { useState } from 'react';

// type TaskTypeItems = 'task' | 'milestone' | 'project';

const Timeline = () => {
  // const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  // const { data, isLoading, isError } = useGetProjectsQuery({});
  // console.log('timeline page projects data', data);
  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: 'en-US',
  });

  // const ganttTasks = useMemo(() => {
  //   return (
  //     data?.data?.map((project) => ({
  //       start: new Date(project.startDate as string),
  //       end: new Date(project.endDate as string),
  //       name: project.name,
  //       id: `Project-${project.id}`,
  //       type: 'project' as TaskTypeItems,
  //       progress: 50,
  //       isDisabled: false,
  //     })) || []
  //   );
  // }, [data]);

  // console.log('timeline page ganttasks', ganttTasks);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  // if (isLoading) return <div>Loading...</div>;
  // if (isError || !data)
  //   return <div>An error occurred while fetching projects</div>;

  return (
    <div className='max-w-full p-8'>
      <header className='mb-4 flex items-center justify-between'>
        <Header name='Projects Timeline' />
        <div className='relative inline-block w-64'>
          <select
            className='focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white'
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </header>

      <div className='overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white'>
        <div className='timeline'>
          {/* <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth='100px'
            projectBackgroundColor={isDarkMode ? '#101214' : '#1f2937'}
            projectProgressColor={isDarkMode ? '#1f2937' : '#aeb8c2'}
            projectProgressSelectedColor={isDarkMode ? '#000' : '#9ba1a6'}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
