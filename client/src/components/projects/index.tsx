/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ModalNewProject from '@/components/modals/ModalNewProject';
import Header from '@/components/shared/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetProjectsQuery } from '@/state/api/projectsApi';
// import { Project } from '@/state/types';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { PlusSquare } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Project ID',
    width: 100,
    renderCell: (params) => (
      // Wrap the id in a Link so that clicking it navigates to the project details page.
      <Link
        href={`/projects/${params.value}`}
        className='hover:text-blue-500 hover:underline'
      >
        {params.value}
      </Link>
    ),
  },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'startDate', headerName: 'Start Date', width: 200 },
  { field: 'endDate', headerName: 'End Date', width: 200 },
  { field: 'projectOwnerFullName', headerName: 'Project Owner', width: 200 },
];

const ProjectsComp = () => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery({});
  console.log('projects data', projects);
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);

  // Transform the data to include a flat projectOwnerFullName property
  // const rows = projects?.data.map((project: Project) => {
  const rows = projects?.data.map((project: any) => {
    const ownerManager = project.owner?.manager;

    return {
      ...project,
      projectOwnerFullName: ownerManager
        ? `${ownerManager.firstName} ${ownerManager.middleName ? ownerManager.middleName + ' ' : ''}${ownerManager.lastName}`
        : 'N/A',
    };
  });

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );
  if (isError || !projects)
    return (
      <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
        No project information added yet!
      </div>
    );

  return (
    <div className='flex w-full flex-col p-8'>
      <Header name='Projects' />
      <div className='flex flex-col lg:flex-row h-[650px] w-full items-center justify-center'>
        <ModalNewProject
          isOpen={isModalNewProjectOpen}
          onClose={() => setIsModalNewProjectOpen(false)}
        />
        <button
          className='my-4 lg:mx-2 flex items-center rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600'
          onClick={() => setIsModalNewProjectOpen(true)}
        >
          <PlusSquare className='mr-2 h-5 w-5' /> New Boards
        </button>
      </div>
      <div style={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default ProjectsComp;
