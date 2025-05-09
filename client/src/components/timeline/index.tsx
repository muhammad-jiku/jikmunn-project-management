'use client';

import Header from '@/components/shared/Header';
import { useGetProjectsQuery } from '@/state/api/projectsApi';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import { DisplayOption, Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import React, { useMemo, useState } from 'react';

type TaskTypeItems = 'task' | 'milestone' | 'project';

const TimelineComp = () => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: 'en-US',
  });

  const { data: projects, isLoading, isError } = useGetProjectsQuery({});

  const ganttTasks = useMemo(() => {
    return (
      projects?.data?.map((project) => ({
        start: new Date(project?.startDate as string),
        end: new Date(project?.endDate as string),
        name: project?.title,
        id: `Project-${project?.id}`,
        type: 'project' as TaskTypeItems,
        progress: 50,
        isDisabled: false,
      })) || []
    );
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );
  if (isError || !projects || projects.data.length === 0)
    return (
      <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
        No project information added yet!
      </div>
    );

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
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth='100px'
            projectBackgroundColor={isDarkMode ? '#101214' : '#1f2937'}
            projectProgressColor={isDarkMode ? '#1f2937' : '#aeb8c2'}
            projectProgressSelectedColor={isDarkMode ? '#000' : '#9ba1a6'}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineComp;
